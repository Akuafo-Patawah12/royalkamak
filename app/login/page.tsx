import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { safeNext } from "@/lib/format";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Partner sign in" };

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <div className="container-page max-w-md space-y-8 py-20">
      <div className="space-y-3 text-center">
        <p className="eyebrow">Partners</p>
        <h1 className="display text-4xl">Welcome back</h1>
        <p className="text-sm text-muted">
          Use the email and password of your Royal Kamak partner account.
        </p>
        <p className="text-sm text-muted">
          Not a partner?{" "}
          <Link href="/" className="text-brand underline-offset-4 hover:underline">
            Book as a guest
          </Link>{" "}
          or{" "}
          <Link href="/my-booking" className="text-brand underline-offset-4 hover:underline">
            find your booking
          </Link>
          .
        </p>
      </div>
      <Suspense fallback={<LoginForm next="/reservations" />}>
        <LoginFormWithNext searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function LoginFormWithNext({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  const { next } = await searchParams;
  return <LoginForm next={safeNext(next)} />;
}
