/** paymentMethod sent when the guest chooses to pay online at booking. */
export const PAY_ONLINE = "Pay now with Paystack";

// Shapes returned by the Kamakz RoyalKamakApi (com.kamak.sales.api.RoyalKamakApi).

export type Partner = {
  id: number;
  fullName: string | null;
  email: string | null;
  telephone: string | null;
};

export type Room = {
  id: number;
  name: string;
  description: string | null;
  features: string | null;
  pricePerNight: number;
  totalRooms: number;
  imagePath: string | null;
  /** Kamakz room type (Hotel > Room Type) this room belongs to, if set. */
  roomTypeId?: number | null;
  roomType?: string | null;
  /** Photo ids, main photo first (see roomImageUrl). Missing on older backends. */
  images?: number[];
  // Only present when the rooms were requested for specific dates.
  available?: number;
  nights?: number;
  stayPrice?: number;
};

/** A room type set up in Kamakz (Hotel > Room Type). */
export type RoomTypeInfo = { id: number; name: string; pricePerNight: number };

export type ReservationLine = {
  id: number;
  inventoryId: number | null;
  roomName: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
};

export type Reservation = {
  id: number;
  reference: string | null;
  status: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  reservationDate: string | null;
  noOfGuest: number | null;
  noOfChildren: number | null;
  noOfRooms: number | null;
  specialRequest: string | null;
  notes: string | null;
  totalPrice: number;
  paymentStatus: string | null;
  paymentMethod: string | null;
  bookingSource: string | null;
  cancellable: boolean;
  /** Can be paid online now (missing on older backends). */
  payable?: boolean;
  rooms?: ReservationLine[];
};

export type ActionState =
  | {
      error?: string;
      success?: string;
      /** Submitted values, so a form can refill itself after an error (React resets forms after an action). */
      fields?: Record<string, string>;
    }
  | undefined;
