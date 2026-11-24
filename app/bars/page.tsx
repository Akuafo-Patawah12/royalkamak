import type { Metadata } from "next";
import { VenuePage } from "@/components/venue-page";

export const metadata: Metadata = { title: "Bars & lounge" };

export default function BarsPage() {
  return <VenuePage slug="bars" />;
}
