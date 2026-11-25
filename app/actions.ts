"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import * as api from "@/lib/api";
import { isIsoDate, safeNext } from "@/lib/format";
import { siteUrl } from "@/lib/site-url";
import { PAY_ONLINE, type ActionState } from "@/lib/types";

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

  // Guests choose room types; the cheapest rooms of each type free for the whole stay are assigned.
  const wanted = new Map<string, number>();
  for (const [key, value] of formData.entries()) {
    const match = /^qty_([a-z0-9-]{1,80})$/.exec(key);
    const quantity = Number(value);
    if (match && Number.isInteger(quantity) && quantity > 0) wanted.set(match[1], quantity);
  }
  if (wanted.size === 0) return fail("Select at least one room.", formData, BOOKING_FIELDS);

  const current = await api.getRoomTypes(checkInDate, checkOutDate);
  if (!current.ok) return fail(current.message, formData, BOOKING_FIELDS);
  const types = current.types;
  const rooms: { inventoryId: number; quantity: number }[] = [];
  for (const [slug, quantity] of wanted) {
    const type = types.find((t) => t.slug === slug);
    const free = type?.rooms.filter((r) => (r.available ?? 0) > 0) ?? [];
    if (free.length < quantity) {
      const name = type?.name ?? "That room type";
      return fail(
        free.length === 0
          ? `${name} was just booked for these dates. Please choose another room.`
          : `Only ${free.length} ${name} room${free.length === 1 ? " is" : "s are"} still free for these dates.`,
        formData,
        BOOKING_FIELDS,
      );
    }
    for (const room of free.slice(0, quantity)) rooms.push({ inventoryId: room.id, quantity: 1 });
  }

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
    const page = `/reservations/${res.reservation.id}?created=1`;
    if (body.paymentMethod !== PAY_ONLINE) redirect(page);
    const pay = await api.startPartnerPayment(String(res.reservation.id), await callbackUrl());
    redirect(pay.ok ? pay.authorizationUrl : `${page}&payment=error`);
  }

  const res = await api.createGuestReservation(body);
  if (!res.ok) return fail(res.message, formData, BOOKING_FIELDS);
  const key = { reference: res.reservation.reference ?? "", email: guestEmail };
  await rememberGuestBooking(key);
  if (body.paymentMethod !== PAY_ONLINE) redirect("/my-booking?created=1");
  const pay = await api.startGuestPayment(key, await callbackUrl());
  redirect(pay.ok ? pay.authorizationUrl : "/my-booking?created=1&payment=error");
}

/** Where Paystack sends the visitor back after paying (app/payment/callback). */
async function callbackUrl() {
  return `${await siteUrl()}/payment/callback`;
}

/** Partner pays an existing reservation online. */
export async function payReservationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = field(formData, "id");
  if (!/^\d+$/.test(id)) return { error: "Reservation not found." };
  const pay = await api.startPartnerPayment(id, await callbackUrl());
  if (!pay.ok) {
    if (pay.httpStatus === 401) redirect(`/login?next=/reservations/${id}`);
    return { error: pay.message };
  }
  redirect(pay.authorizationUrl);
}

/** Guest pays the booking remembered in this browser. */
export async function payGuestBookingAction(): Promise<ActionState> {
  const key = await api.getGuestBookingKey();
  if (!key) return { error: "Find your booking again to pay for it." };
  const pay = await api.startGuestPayment(key, await callbackUrl());
  if (!pay.ok) return { error: pay.message };
  redirect(pay.authorizationUrl);
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
