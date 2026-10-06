import { Metadata } from "next";

import { staticPages } from "@/config/pages";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata(staticPages.download);

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
