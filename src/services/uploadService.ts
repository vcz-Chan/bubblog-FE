import { apiClient } from './apiClient';

interface PresignedResponse {
  url: string;        // presigned URL
  key: string;        // S3에 실제 저장될 객체 키 (예: images/1637851234_my.png)
}

// 1) Presigned URL 요청하기
export async function getPresignedUrl(
  fileName: string,
  contentType: string
): Promise<PresignedResponse> {
  // fileName과 contentType은 URL 인코딩한 상태여야 합니다.
  const res = await apiClient<PresignedResponse>(
    `/uploads/presigned-url?fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}`
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