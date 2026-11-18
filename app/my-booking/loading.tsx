import { FormCardSkeleton, TitleSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-md space-y-8">
        <TitleSkeleton center />
        <FormCardSkeleton />
      </div>
    </div>
  );
}
