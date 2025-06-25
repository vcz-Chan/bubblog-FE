'use client'

import Link from 'next/link'
import { Button } from "@/components/Common/Button"
import {
  PencilIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

export function BlogControls({userId}: { userId?: string }) {
  return (
    <div className="flex gap-4">
      <Link href="/write">
        <Button
          variant='outline'
        >
          <PencilIcon className="h-5 w-5 mr-2" />
          새 글 작성
        </Button>
      </Link>
      <Link href={`/settings/${userId}`}>
        <Button
          variant='outline'
        >
          <Cog6ToothIcon className="h-5 w-5 mr-2" />
          블로그 설정
        </Button>
      </Link>
    </div>
  )
}