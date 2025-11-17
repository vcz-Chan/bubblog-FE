// components/ImageUploader.tsx
'use client';

import { useState, ChangeEvent, DragEvent, useCallback } from 'react';
import { getPresignedUrl, uploadToS3 } from '@/apis/uploadApi';
import { CheckCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface Props {
  onUploaded: (s3Url: string) => void;
  folder: string;
}

export default function ImageUploader({ onUploaded, folder }: Props) {
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // 공통 업로드 로직
  const uploadFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setUploadProgress(0);
      setUploadSuccess(false);

      try {
        // 진행률 시뮬레이션
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        const timestamp = Date.now();
        const sanitizedFilename = file.name.replace(/\s+/g, '_');
        const key = `${folder}/${timestamp}_${sanitizedFilename}`;
        const { fileUrl: s3Url, uploadUrl: presignedUrl } = await getPresignedUrl(key, file.type);
        await uploadToS3(presignedUrl, file);

        clearInterval(progressInterval);
        setUploadProgress(100);
        setUploadSuccess(true);

        // 성공 애니메이션 후 콜백 실행
        setTimeout(() => {
          onUploaded(s3Url);
          setUploadSuccess(false);
        }, 1000);
      } catch (err: any) {
        console.error(err);
        alert(err.message || '이미지 업로드 중 오류가 발생했습니다.');
        setUploadProgress(0);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
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
    <div className="w-full">
      {/* 드래그 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center
          w-full min-h-40 border-2 border-dashed rounded-xl
          transition-all duration-300
          ${dragOver
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
        `}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            {/* 업로드 아이콘 */}
            <CloudArrowUpIcon className={`h-12 w-12 ${uploadSuccess ? 'text-green-500' : 'text-blue-500'} transition-colors`} />

            {/* 진행률 바 */}
            <div className="w-48 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${uploadSuccess ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            {/* 진행률 텍스트 */}
            <div className="flex items-center gap-2">
              {uploadSuccess ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">업로드 완료!</span>
                </>
              ) : (
                <span className="text-sm text-gray-600">{uploadProgress}% 업로드 중...</span>
              )}
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-3 cursor-pointer py-6 px-4">
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400" />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                이미지를 여기에 드래그하거나{' '}
                <span className="text-blue-600 font-medium underline">클릭하여 선택</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, GIF 형식 지원
              </p>
            </div>
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