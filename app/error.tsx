"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";

export default function ErrorPage({
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
    <ErrorState
      code="500"
      title="页面暂时罢工"
      message="不是你的问题。"
      hint="刷新通常能解决。"
      onRetry={unstable_retry}
    />
  );
}
