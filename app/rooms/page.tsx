import type { Metadata } from "next";
import { Suspense } from "react";
import { RoomSearch } from "@/components/room-search";
import { RoomsIntro } from "@/components/rooms-intro";
import { RoomSearchSkeleton } from "@/components/skeletons";

export const metadata: Metadata = { title: "Rooms & suites" };

export default function RoomsPage(props: PageProps<"/rooms">) {
  return (
    <>
      <RoomsIntro />
      <Suspense fallback={<RoomSearchSkeleton />}>
        <RoomSearch searchParams={props.searchParams} action="/rooms" />
      </Suspense>
    </>
  );
}
