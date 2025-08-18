import 'server-only';
import PostDetailClient from "@/app/post/[postId]/PostDetailClient";
import PostDetailBodyServer from "@/app/post/[postId]/PostDetailBodyServer";

export default async function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  return (
    <article className="w-full p-8 lg:px-40">
      {/* CSR 부분 */}
      <PostDetailClient postId={postId} />

      {/* SSR 본문 */}
      <PostDetailBodyServer postId={postId} />
    </article>
  );
}