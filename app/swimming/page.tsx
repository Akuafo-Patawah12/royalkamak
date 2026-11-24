import type { Metadata } from "next";
import { VenuePage } from "@/components/venue-page";

export const metadata: Metadata = { title: "Swimming pool" };

export default function SwimmingPage() {
  return <VenuePage slug="swimming" />;
}
