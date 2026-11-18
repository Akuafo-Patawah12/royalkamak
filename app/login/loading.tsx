import { FormCardSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="container-page max-w-md space-y-8 py-20">
      <div className="space-y-3 text-center">
        <p className="eyebrow">Partners</p>
        <h1 className="display text-4xl">Welcome back</h1>
      </div>
      <FormCardSkeleton />
    </div>
  );
}
