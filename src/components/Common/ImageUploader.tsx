// components/ImageUploader.tsx
'use client';

import { useState, ChangeEvent, DragEvent, useCallback } from 'react';
import { getPresignedUrl, uploadToS3 } from '@/apis/uploadApi';

interface Props {
  onUploaded: (s3Url: string) => void;
  folder: string;
}

export default function ImageUploader({ onUploaded, folder }: Props) {
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // 공통 업로드 로직
  const uploadFile = useCallback(
    async (file: File) => {
      setLoading(true);
      try {
        const timestamp = Date.now();
        const sanitizedFilename = file.name.replace(/\s+/g, '_');
        const key = `${folder}/${timestamp}_${sanitizedFilename}`;
        const { fileUrl: s3Url, uploadUrl: presignedUrl } = await getPresignedUrl(key, file.type);
        await uploadToS3(presignedUrl, file);
        onUploaded(s3Url);
      } catch (err: any) {
        console.error(err);
        alert(err.message || '이미지 업로드 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [folder, onUploaded]
  );

  // input[type=file]로 선택할 때
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
      e.target.value = '';
    }
  };

  // 드래그가 컴포넌트 위로 진입했을 때
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  // 드래그가 컴포넌트에서 나갔을 때
  const handleDragLeave = () => {
    setDragOver(false);
  };

  // 파일을 드롭했을 때
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file);
    } else {
      alert('이미지 파일만 업로드할 수 있습니다.');
    }
  };

  return (
    <div>
      {/* 드래그 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center
          w-full h-32 border-2 border-dashed rounded-md
          ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-transparent'}
        `}
      >
        {loading ? (
          <span className="text-sm text-gray-500">업로드 중…</span>
        ) : (
          // ▼ 이 부분을 <label>로 감싸서, 클릭할 수 있는 영역을 텍스트에만 한정
          <label className="text-sm text-gray-500 cursor-pointer">
            이미지를 여기에 드래그하거나{' '}
            <span className="text-indigo-600 underline">여기를 클릭</span>해 선택하세요.
            <input
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              disabled={loading}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}