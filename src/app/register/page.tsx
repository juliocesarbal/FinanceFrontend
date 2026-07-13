/** Stub de compatibilidad: el registro ahora es un modal sobre la landing.
 *  Deep-links y redirects viejos a /register siguen funcionando. */
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Spinner } from "@/components/ui/primitives";
import { useSession } from "@/lib/queries";

export default function RegisterPage() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.isPending) return;
    if (session.data?.authenticated) router.replace("/dashboard");
    else router.replace("/?auth=register");
  }, [session.isPending, session.data, router]);

  return <Spinner className="h-5 w-5" />;
}
