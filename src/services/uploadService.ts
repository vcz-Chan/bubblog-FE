import { apiClient } from './apiClient';

interface PresignedResponse {
  uploadUrl: string;        // presigned URL
  fileUrl: string;        // S3에 실제 저장될 객체 url
}

export async function getPresignedUrl(
  fileName: string,
  contentType: string
): Promise<PresignedResponse> {
  const res = await apiClient<PresignedResponse>(
    `/api/uploads/presigned-url`,
    {
      method: 'POST',
      body: JSON.stringify({ fileName, contentType }),
    }
  );
  if (!res.success || !res.data) {
    throw new Error(res.message || 'presigned URL을 가져오는데 실패했습니다.');
  }
  return res.data;
}

// 2) S3에 업로드하기 (PUT)
//    presignedUrl: getPresignedUrl()로 받은 url
//    file: 실제 업로드할 File 객체
export async function uploadToS3(presignedUrl: string, file: File) {
  const putRes = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error('S3 업로드에 실패했습니다.');
  }
}