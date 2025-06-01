'use client'

import { useState } from 'react'
import ImageUploader from '../Common/ImageUploader'

interface Props {
  onChange: (thumbnailUrl: string) => void
  initialUrl?: string
}

export default function ThumbnailUploader({ onChange, initialUrl }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialUrl)

  return (
    <div className="flex flex-col items-start gap-2">
      {previewUrl && (
        <img
          src={previewUrl}
          alt="썸네일 미리보기"
          className="w-32 h-32 object-cover rounded-md border"
        />
      )}
      <ImageUploader
        folder="thumbnails"
        onUploaded={url => {
          setPreviewUrl(url)
          onChange(url)
        }}
      />
    </div>
  )
}