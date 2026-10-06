import { Metadata } from "next";

import { staticPages } from "@/config/pages";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(staticPages.tutorial);

export default function TutorialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
