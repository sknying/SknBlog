"use client";

import { Icon as IconifyIcon } from "@iconify/react/dist/offline";
import type { ComponentProps } from "react";
import { localIcons } from "@/lib/local-icons";

type LocalIconProps = ComponentProps<typeof IconifyIcon>;

export function Icon({ icon, ...props }: LocalIconProps) {
  const resolvedIcon = typeof icon === "string" && icon in localIcons
    ? localIcons[icon as keyof typeof localIcons]
    : icon;

  return <IconifyIcon icon={resolvedIcon} {...props} />;
}
