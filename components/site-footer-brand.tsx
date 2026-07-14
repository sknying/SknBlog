import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";
import { SITE_NAME } from "@/lib/site-config";

export function SiteFooterBrand() {
  return (
    <Link className="site-footer-brand" href="/" aria-label={`返回 ${SITE_NAME} 首页`}>
      <SiteLogo />
      <strong>{SITE_NAME}</strong>
    </Link>
  );
}
