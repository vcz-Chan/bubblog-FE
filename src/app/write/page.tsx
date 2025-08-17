import { getBlogById } from '@/apis/blogApi';
import WritePostClient from './WritePostClient';

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ postId?: string }>;  
}) {
  const params = await searchParams;
  const postId = params.postId; 

  let blog = null;
  if (postId) {
    try {
      blog = await getBlogById(Number(postId));
    } catch (e) {
    }
  }

  return <WritePostClient postId={postId} initialData={blog} />;
}