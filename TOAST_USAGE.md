# Toast 사용 가이드

프로젝트에 Toast 알림 시스템이 추가되었습니다. 사용자에게 성공, 오류, 정보, 경고 메시지를 우아하게 표시할 수 있습니다.

## 기본 사용법

```tsx
'use client'

import { useToast } from '@/contexts/ToastContext'

export function MyComponent() {
  const toast = useToast()

  const handleSuccess = () => {
    toast.success('저장되었습니다!')
  }

  const handleError = () => {
    toast.error('오류가 발생했습니다')
  }

  const handleInfo = () => {
    toast.info('알림: 새로운 메시지가 있습니다')
  }

  const handleWarning = () => {
    toast.warning('주의: 이 작업은 되돌릴 수 없습니다')
  }

  return (
    <div>
      <button onClick={handleSuccess}>성공 Toast</button>
      <button onClick={handleError}>에러 Toast</button>
      <button onClick={handleInfo}>정보 Toast</button>
      <button onClick={handleWarning}>경고 Toast</button>
    </div>
  )
}
```

## API

### `useToast()` Hook

컴포넌트에서 Toast를 사용하려면 `useToast()` hook을 import 합니다.

```tsx
const toast = useToast()
```

### 메서드

#### `toast.success(message, duration?)`
성공 메시지를 표시합니다 (초록색 아이콘).

```tsx
toast.success('게시글이 저장되었습니다')
toast.success('업로드 완료!', 3000) // 3초 후 자동 닫힘
```

#### `toast.error(message, duration?)`
에러 메시지를 표시합니다 (빨간색 아이콘).

```tsx
toast.error('로그인에 실패했습니다')
toast.error('네트워크 오류가 발생했습니다', 5000) // 5초 후 자동 닫힘
```

#### `toast.info(message, duration?)`
정보 메시지를 표시합니다 (파란색 아이콘).

```tsx
toast.info('로그인이 필요한 서비스입니다')
toast.info('새로운 버전이 출시되었습니다', 4000)
```

#### `toast.warning(message, duration?)`
경고 메시지를 표시합니다 (노란색 아이콘).

```tsx
toast.warning('변경사항이 저장되지 않았습니다')
toast.warning('세션이 곧 만료됩니다', 6000)
```

#### `toast.showToast(message, type, duration?)`
커스텀 Toast를 표시합니다.

```tsx
toast.showToast('커스텀 메시지', 'success', 3000)
```

### 매개변수

- **message** (string, 필수): 표시할 메시지
- **duration** (number, 선택): 자동으로 닫히기까지의 시간 (밀리초). 기본값: 4000ms (4초)
  - `0`으로 설정하면 자동으로 닫히지 않음

## 실제 사용 예시

### 1. 폼 제출 성공/실패

```tsx
const handleSubmit = async (data: FormData) => {
  try {
    await savePost(data)
    toast.success('게시글이 저장되었습니다')
    router.push('/posts')
  } catch (error) {
    toast.error('저장 중 오류가 발생했습니다')
  }
}
```

### 2. 로그인 상태 확인

```tsx
const handleProtectedAction = () => {
  if (!isLogin) {
    toast.info('로그인이 필요한 서비스입니다')
    router.push('/login')
    return
  }

  // 로그인된 경우 작업 수행
  performAction()
}
```

### 3. AI Chat 세션 저장

```tsx
sse.addEventListener('session_saved', (evt) => {
  const data = JSON.parse(evt.data)
  if (data.cached) {
    toast.info('이전 답변을 재사용했습니다')
  } else {
    toast.success('대화가 저장되었습니다')
  }
})

sse.addEventListener('session_error', (evt) => {
  toast.error('대화 저장에 실패했습니다')
})
```

### 4. 파일 업로드

```tsx
const handleFileUpload = async (file: File) => {
  try {
    const { presignedUrl, fileUrl } = await getPresignedUrl(file.name, file.type)
    await uploadToS3(presignedUrl, file)
    toast.success('이미지가 업로드되었습니다')
    return fileUrl
  } catch (error) {
    toast.error('업로드에 실패했습니다')
    throw error
  }
}
```

### 5. 복사하기 기능

```tsx
const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('클립보드에 복사되었습니다', 2000)
  } catch {
    toast.error('복사에 실패했습니다')
  }
}
```

## 디자인 특징

- ✨ Framer Motion을 사용한 부드러운 entrance/exit 애니메이션
- 🎨 4가지 타입별 색상 구분 (성공/에러/정보/경고)
- 🌙 다크모드 지원 (준비됨)
- 📱 반응형 디자인
- ♿ 접근성 고려 (aria-live, aria-atomic)
- 👆 닫기 버튼 제공
- ⏱️ 자동 닫힘 기능 (커스터마이징 가능)
- 📚 여러 Toast 스택 가능 (동시에 표시)

## 주의사항

- `useToast()`는 Client Component에서만 사용 가능합니다 (`'use client'` 필요)
- ToastProvider는 이미 `src/app/layout.tsx`에 설정되어 있습니다
- Toast는 화면 우측 상단에 표시됩니다
- 여러 Toast가 동시에 표시될 경우 위에서 아래로 쌓입니다

## 스타일 커스터마이징

Toast 컴포넌트는 `src/components/Common/Toast.tsx`에 있으며, 필요에 따라 색상이나 스타일을 수정할 수 있습니다.

```tsx
// Toast 색상 커스터마이징 예시
const toastConfig = {
  success: {
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-500',
    // ...
  },
  // ...
}
```
