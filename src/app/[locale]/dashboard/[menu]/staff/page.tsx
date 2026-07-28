"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import Loader from "@/components/Global/Loader";

/** Staff moved to the account level; keep old links working. */
export default function MenuStaffRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/staff");
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader />
    </div>
  );
}
