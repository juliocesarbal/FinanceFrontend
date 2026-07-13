/** Stub de compatibilidad: el login ahora es un modal sobre la landing.
 *  Deep-links y redirects viejos a /login siguen funcionando. */
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Spinner } from "@/components/ui/primitives";
import { useSession } from "@/lib/queries";

export default function LoginPage() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.isPending) return;
    if (session.data?.authenticated) router.replace("/dashboard");
    else router.replace("/?auth=login");
  }, [session.isPending, session.data, router]);

  return <Spinner className="h-5 w-5" />;
}
