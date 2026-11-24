import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { groupRoomTypes } from "./room-types";
import type { Partner, Reservation, Room, RoomTypeInfo } from "./types";

// All calls to the Kamakz backend happen on the Next.js server, so the
// backend URL and the partner's token never reach the browser and the
// Java server doesn't need CORS for this site.

const API_URL = (
  process.env.KAMAK_API_URL ?? "http://localhost:8080/kamakz/webresources"
).replace(/\/+$/, "");

export const SESSION_COOKIE = "rk_partner_session";
// Guests have no account: this cookie remembers {reference, email} of the
// guest's latest booking so /my-booking can show it. The backend re-checks the
// pair on every request, so editing the cookie only ever fails the lookup.
export const GUEST_COOKIE = "rk_guest_booking";

export function companyId(): string {
  const id = process.env.ROYALKAMAK_COMPANY_ID;
  if (!id || !/^\d+$/.test(id)) {
    throw new Error(
      "ROYALKAMAK_COMPANY_ID is not set. Add the Royal Kamak company ID to .env.local.",
    );
  }
  return id;
}

export const currency = process.env.ROYALKAMAK_CURRENCY ?? "GHS";

export type ApiResult<T> =
  | ({ ok: true; httpStatus: number } & T)
  | { ok: false; httpStatus: number; message: string };

async function call<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; token?: string } = {},
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (init.token) headers.Authorization = `Bearer ${init.token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/royalkamak${path}`, {
      method: init.method ?? "GET",
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      httpStatus: 503,
      message: "The booking service is unreachable right now. Please try again shortly.",
    };
  }

  let json: Record<string, unknown> = {};
  try {
    json = await res.json();
  } catch {
    // Non-JSON error page from the app server.
  }

  if (!res.ok || json.status === 0) {
    return {
      ok: false,
      httpStatus: res.status,
      message: typeof json.message === "string" ? json.message : `Request failed (${res.status})`,
    };
  }
  return { ok: true, httpStatus: res.status, ...(json as T) };
}

// ---------- public ----------

export function getRooms(checkIn?: string, checkOut?: string) {
  const qs = checkIn && checkOut ? `?${new URLSearchParams({ checkIn, checkOut })}` : "";
  return call<{ rooms: Room[]; nights?: number }>(`/${companyId()}/rooms${qs}`);
}

/** Every room type set up in Kamakz (empty on an older backend). Deduplicated per request. */
export const getRoomTypeCatalog = cache(async (): Promise<RoomTypeInfo[]> => {
  const res = await call<{ roomTypes: RoomTypeInfo[] }>(`/${companyId()}/room-types`);
  return res.ok && Array.isArray(res.roomTypes) ? res.roomTypes : [];
});

/** Rooms grouped into room types (all Kamakz types, even empty ones), optionally for a stay. */
export async function getRoomTypes(checkIn?: string, checkOut?: string) {
  const [res, catalog] = await Promise.all([getRooms(checkIn, checkOut), getRoomTypeCatalog()]);
  if (!res.ok) return res;
  return { ...res, catalog, types: groupRoomTypes(res.rooms, catalog) };
}

/** Raw photo response from Kamakz (used by the /room-images proxy route). */
export function fetchRoomImage(roomId: string, imageId: string) {
  return fetch(
    `${API_URL}/api/royalkamak/${companyId()}/rooms/${encodeURIComponent(roomId)}/images/${encodeURIComponent(imageId)}`,
    { cache: "no-store" },
  );
}

/** Booked nights (yyyy-MM-dd) for one room between from and to (defaults: today + 180 days). */
export function getRoomAvailability(roomId: string, from?: string, to?: string) {
  const qs = from && to ? `?${new URLSearchParams({ from, to })}` : "";
  return call<{ room: Room; from: string; to: string; bookedDates: string[] }>(
    `/${companyId()}/rooms/${encodeURIComponent(roomId)}/availability${qs}`,
  );
}

export function login(email: string, password: string) {
  return call<{ token: string; expiresInSeconds: number; partner: Partner }>(
    `/${companyId()}/login`,
    { method: "POST", body: { email, password } },
  );
}

// ---------- session ----------

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** The signed-in partner, or null. Deduplicated per request. */
export const getCurrentPartner = cache(async (): Promise<Partner | null> => {
  const token = await getToken();
  if (!token) return null;
  const res = await call<{ partner: Partner }>("/me", { token });
  return res.ok ? res.partner : null;
});

// ---------- partner (token required) ----------

export async function listReservations() {
  return call<{ reservations: Reservation[] }>("/reservations", { token: await getToken() });
}

export async function getReservation(id: string) {
  return call<{ reservation: Reservation }>(`/reservations/${encodeURIComponent(id)}`, {
    token: await getToken(),
  });
}

export type NewReservation = {
  checkInDate: string;
  checkOutDate: string;
  noOfGuest: number;
  noOfChildren: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  specialRequest: string;
  paymentMethod: string;
  rooms: { inventoryId: number; quantity: number }[];
};

export async function createReservation(body: NewReservation) {
  return call<{ reservation: Reservation }>("/reservations", {
    method: "POST",
    body,
    token: await getToken(),
  });
}

export async function cancelReservation(id: string) {
  return call<{ reservation: Reservation }>(
    `/reservations/${encodeURIComponent(id)}/cancel`,
    { method: "POST", token: await getToken() },
  );
}

// ---------- guest (no account) ----------

export function createGuestReservation(body: NewReservation) {
  return call<{ reservation: Reservation }>(`/${companyId()}/reservations`, { method: "POST", body });
}

export type GuestBookingKey = { reference: string; email: string };

export function lookupGuestReservation(key: GuestBookingKey) {
  return call<{ reservation: Reservation }>(`/${companyId()}/reservations/lookup`, { method: "POST", body: key });
}

export function cancelGuestReservation(key: GuestBookingKey) {
  return call<{ reservation: Reservation }>(`/${companyId()}/reservations/lookup/cancel`, {
    method: "POST",
    body: key,
  });
}

/** The guest booking remembered in this browser, if any. */
export async function getGuestBookingKey(): Promise<GuestBookingKey | null> {
  const raw = (await cookies()).get(GUEST_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed?.reference === "string" && typeof parsed?.email === "string"
      ? { reference: parsed.reference, email: parsed.email }
      : null;
  } catch {
    return null;
  }
}

// ---------- online payment (Paystack, handled by Kamakz) ----------

/** Whether online payment is switched on in Kamakz. Deduplicated per request. */
export const getPaymentConfig = cache(async () => {
  const res = await call<{ enabled: boolean; currency: string }>(`/${companyId()}/payments/config`);
  return { enabled: res.ok && res.enabled === true };
});

type PaymentStart = { authorizationUrl: string; reference: string };

export async function startPartnerPayment(id: string, callbackUrl: string) {
  return call<PaymentStart>(`/reservations/${encodeURIComponent(id)}/pay`, {
    method: "POST",
    body: { callbackUrl },
    token: await getToken(),
  });
}

export function startGuestPayment(key: GuestBookingKey, callbackUrl: string) {
  return call<PaymentStart>(`/${companyId()}/reservations/lookup/pay`, {
    method: "POST",
    body: { ...key, callbackUrl },
  });
}

export type PaymentResult = {
  paid: boolean;
  /** Paystack's status when not paid: abandoned, failed, reversed… */
  paymentStatus?: string;
  partnerBooking?: boolean;
  reservation?: { id: number; reference: string | null; status: string | null; paymentStatus: string | null };
};

/** Kamakz checks the payment with Paystack and marks the booking paid. Safe to repeat. */
export function verifyPayment(reference: string) {
  return call<PaymentResult>(`/${companyId()}/payments/verify`, { method: "POST", body: { reference } });
}
