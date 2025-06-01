import { getBlogById } from '@/services/blogService';
import WritePostClient from './WritePostClient';

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ postId?: string }>;  
}) {
  // searchParams 전체를 먼저 await
  const params = await searchParams;
  const postId = params.postId;  // 이제 에러 없음

  let blog = null;
  if (postId) {
    try {
      blog = await getBlogById(Number(postId));
    } catch (e) {
    }
  }

  return <WritePostClient postId={postId} initialData={blog} />;
}