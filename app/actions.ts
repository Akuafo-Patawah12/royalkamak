"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import * as api from "@/lib/api";
import { isIsoDate, safeNext } from "@/lib/format";
import type { ActionState } from "@/lib/types";

const field = (fd: FormData, name: string) => String(fd.get(name) ?? "").trim();

/** Error result that also returns the submitted text fields (never passwords) to refill the form. */
function fail(error: string, fd: FormData, names: string[]): ActionState {
  return { error, fields: Object.fromEntries(names.map((n) => [n, String(fd.get(n) ?? "")])) };
}
const BOOKING_FIELDS = ["guestName", "guestPhone", "guestEmail", "adults", "children", "specialRequest", "paymentMethod"];

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = field(formData, "email");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return fail("Enter your email and password.", formData, ["email"]);

  const res = await api.login(email, password);
  if (!res.ok) {
    return fail(
      res.httpStatus === 401 ? "That email and password don't match a partner account." : res.message,
      formData,
      ["email"],
    );
  }

  (await cookies()).set(api.SESSION_COOKIE, res.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: res.expiresInSeconds,
  });
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  (await cookies()).delete(api.SESSION_COOKIE);
  redirect("/");
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function rememberGuestBooking(key: api.GuestBookingKey) {
  (await cookies()).set(api.GUEST_COOKIE, JSON.stringify(key), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

/** Signed-in partners book on their account; everyone else books as a guest. */
export async function createReservationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Hidden "website" field: people never fill it in, simple form bots do.
  if (field(formData, "website")) return fail("Something went wrong. Please try again.", formData, BOOKING_FIELDS);

  const asPartner = Boolean(await api.getCurrentPartner());

  const checkInDate = field(formData, "checkIn");
  const checkOutDate = field(formData, "checkOut");
  if (!isIsoDate(checkInDate) || !isIsoDate(checkOutDate)) {
    return fail("Choose your check-in and check-out dates again.", formData, BOOKING_FIELDS);
  }

  const rooms: { inventoryId: number; quantity: number }[] = [];
  for (const [key, value] of formData.entries()) {
    const match = /^qty_(\d+)$/.exec(key);
    const quantity = Number(value);
    if (match && Number.isInteger(quantity) && quantity > 0) {
      rooms.push({ inventoryId: Number(match[1]), quantity });
    }
  }
  if (rooms.length === 0) return fail("Select at least one room.", formData, BOOKING_FIELDS);

  const guestName = field(formData, "guestName");
  if (!guestName) return fail("Enter the lead guest's name.", formData, BOOKING_FIELDS);

  const guestEmail = field(formData, "guestEmail");
  const guestPhone = field(formData, "guestPhone");
  if (!asPartner) {
    if (!EMAIL.test(guestEmail)) return fail("Enter a valid email address so we can send your booking.", formData, BOOKING_FIELDS);
    if (guestPhone.replace(/\D/g, "").length < 7) return fail("Enter a phone number the hotel can reach you on.", formData, BOOKING_FIELDS);
  }

  const noOfGuest = Number(field(formData, "adults"));
  if (!Number.isInteger(noOfGuest) || noOfGuest < 1) return fail("At least one adult is required.", formData, BOOKING_FIELDS);

  const body: api.NewReservation = {
    checkInDate,
    checkOutDate,
    noOfGuest,
    noOfChildren: Math.max(0, Number(field(formData, "children")) || 0),
    guestName,
    guestPhone,
    guestEmail,
    specialRequest: field(formData, "specialRequest"),
    paymentMethod: field(formData, "paymentMethod") || "Pay at hotel",
    rooms,
  };

  if (asPartner) {
    const res = await api.createReservation(body);
    if (!res.ok) {
      if (res.httpStatus === 401) redirect("/login?next=/reservations");
      return fail(res.message, formData, BOOKING_FIELDS);
    }
    redirect(`/reservations/${res.reservation.id}?created=1`);
  }

  const res = await api.createGuestReservation(body);
  if (!res.ok) return fail(res.message, formData, BOOKING_FIELDS);
  await rememberGuestBooking({ reference: res.reservation.reference ?? "", email: guestEmail });
  redirect("/my-booking?created=1");
}

/** Find a guest booking by reference + email and remember it in this browser. */
export async function findGuestBookingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const reference = field(formData, "reference").toUpperCase();
  const email = field(formData, "email");
  if (!reference || !EMAIL.test(email)) return fail("Enter your booking reference and the email you booked with.", formData, ["reference", "email"]);

  const res = await api.lookupGuestReservation({ reference, email });
  if (!res.ok) return fail(res.message, formData, ["reference", "email"]);
  await rememberGuestBooking({ reference, email });
  redirect("/my-booking");
}

export async function forgetGuestBookingAction() {
  (await cookies()).delete(api.GUEST_COOKIE);
  redirect("/my-booking");
}

export async function cancelGuestReservationAction(): Promise<ActionState> {
  const key = await api.getGuestBookingKey();
  if (!key) redirect("/my-booking");
  const res = await api.cancelGuestReservation(key);
  if (!res.ok) return { error: res.message };
  refresh();
  return { success: "Your booking has been cancelled." };
}

export async function cancelReservationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = field(formData, "id");
  if (!/^\d+$/.test(id)) return { error: "Unknown reservation." };

  const res = await api.cancelReservation(id);
  if (!res.ok) {
    if (res.httpStatus === 401) redirect(`/login?next=/reservations/${id}`);
    return { error: res.message };
  }
  refresh();
  return { success: "Reservation cancelled." };
}
