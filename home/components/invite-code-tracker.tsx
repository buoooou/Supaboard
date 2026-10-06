"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function InviteCodeTracker() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || searchParams.get("ref");

  useEffect(() => {
    if (code) {
      localStorage.setItem("xboard_invite_code", code);
    }
  }, [code]);

  return null;
}
