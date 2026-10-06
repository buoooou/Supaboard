"use client";

import { useEffect } from "react";
import { siteConfig } from "@/config/site";

declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

export function CrispChat() {
  useEffect(() => {
    const crispId = siteConfig.crispId;
    if (!crispId) return;

    let loaded = false;
    const loadCrisp = () => {
      if (loaded) return;
      loaded = true;
      cleanup();

      window.$crisp = [];
      window.CRISP_WEBSITE_ID = crispId;

      const s = document.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = true;
      document.head.appendChild(s);
    };

    const cleanup = () => {
      window.removeEventListener("scroll", loadCrisp);
      window.removeEventListener("mousemove", loadCrisp);
      window.removeEventListener("touchstart", loadCrisp);
      window.removeEventListener("keydown", loadCrisp);
    };

    window.addEventListener("scroll", loadCrisp, { passive: true, once: true });
    window.addEventListener("mousemove", loadCrisp, { passive: true, once: true });
    window.addEventListener("touchstart", loadCrisp, { passive: true, once: true });
    window.addEventListener("keydown", loadCrisp, { passive: true, once: true });

    const timer = setTimeout(loadCrisp, 4000);

    return () => {
      cleanup();
      clearTimeout(timer);
    };
  }, []);

  return null;
}
