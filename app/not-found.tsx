import type { Metadata } from "next";
import { ErrorState } from "@/components/error-state";

export const metadata: Metadata = {
  title: "页面未找到 | SknBlog",
  description: "请求的页面不存在，返回 SknBlog 首页或文章归档。"
};

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      title="这页走丢了"
      message="地址可能写错了。"
      hint="也可能已经搬家。"
    />
  );
}
