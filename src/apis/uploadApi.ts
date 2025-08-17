// src/domains/uploads/api.ts

import { apiClientWithAuth } from '@/apis/apiClient';

export interface PresignedResponse {
  uploadUrl: string;   // presigned URL
  fileUrl: string;     // S3에 실제 저장될 객체 URL
}

/**
 * 1) presigned URL 발급받기 (JWT 인증 필요)
 */
export async function getPresignedUrl(
  fileName: string,
  contentType: string
): Promise<PresignedResponse> {
  const res = await apiClientWithAuth<PresignedResponse>(
    `/api/uploads/presigned-url`,
    {
      method: 'POST',
      body: JSON.stringify({ fileName, contentType }),
    }
  );
  if (!res.success || !res.data) {
    throw new Error(res.message || 'Presigned URL 발급에 실패했습니다.');
  }
  return res.data;
}

/**
 * 2) S3에 업로드하기 (PUT)
 *    presignedUrl: getPresignedUrl()로 받은 URL
 *    file: 실제 업로드할 File 객체
 */
export async function uploadToS3(
  presignedUrl: string,
  file: File
): Promise<void> {
  const putRes = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error('S3 업로드에 실패했습니다.');
  }
}