import { RoomSearchSkeleton } from "@/components/skeletons";
import { RoomsIntro } from "@/components/rooms-intro";

export default function Loading() {
  return (
    <>
      <RoomsIntro />
      <RoomSearchSkeleton />
    </>
  );
}
