import Image from "next/image";

type SiteLogoProps = {
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function SiteLogo({ className = "site-logo-icon", priority = false, sizes = "28px" }: SiteLogoProps) {
  return (
    <Image
      className={className}
      src="/images/sknblog-logo-icon.svg"
      alt=""
      width={512}
      height={512}
      sizes={sizes}
      priority={priority}
    />
  );
}
