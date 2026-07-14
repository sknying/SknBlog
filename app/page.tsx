import { BlogHome } from "@/components/blog-home";
import { posts } from "@/lib/blog-data";

export default function Home() {
  return <BlogHome posts={posts} />;
}
