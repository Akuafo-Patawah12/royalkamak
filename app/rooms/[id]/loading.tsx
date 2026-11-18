import { Bone, RoomBodySkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="container-page space-y-8 py-14">
      <Bone className="h-3 w-24" />
      <RoomBodySkeleton />
    </div>
  );
}
