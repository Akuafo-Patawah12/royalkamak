import type { Metadata } from "next";
import { VenuePage } from "@/components/venue-page";

export const metadata: Metadata = { title: "Restaurant" };

export default function RestaurantPage() {
  return <VenuePage slug="restaurant" />;
}
