"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";
import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body>
        <ErrorState
          code="500"
          title="网站暂时离线"
          message="核心页面出错了。"
          hint="稍后再来看看。"
          onRetry={unstable_retry}
        />
      </body>
    </html>
  );
}
