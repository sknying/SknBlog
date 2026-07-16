import Image from "next/image";
import { SPRING_ASSETS } from "@/themes/spring/theme";

type SiteLogoProps = {
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function SiteLogo({ className = "site-logo-icon", priority = false, sizes = "28px" }: SiteLogoProps) {
  return (
    <Image
      className={className}
      src={SPRING_ASSETS.logo}
      alt=""
      width={512}
      height={512}
      sizes={sizes}
      priority={priority}
    />
  );
}
