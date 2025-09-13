# 마크다운 에디터 및 뷰어 개선

## 현재 상태

- **에디터**: `textarea`와 커스텀 `EditorToolbar`의 조합. (`src/components/Post/ReactMDEEditor.tsx`, `src/components/Post/EditorToolbar.tsx`)
- **뷰어**: `react-markdown` 라이브러리 사용. (`src/components/Post/MarkdownViewer.tsx`)
- **이미지 업로드**: `EditorToolbar` 또는 드래그앤드롭을 통해 `getPresignedUrl` API를 호출하여 S3에 직접 업로드.
- **문제점**:
    - 에디터의 편의 기능(툴바)과 UI가 분리되어 있어 유지보수가 번거롭고 확장성이 떨어짐.
    - 전반적인 UI/UX가 최신 트렌드에 비해 부족함.
    - 직접 구현된 로직이 많아 잠재적인 버그 발생 가능성이 높음.

## 개선 제안

`@uiw/react-md-editor` 라이브러리를 도입하여, 분리되어 있는 에디터, 툴바, 뷰어, 이미지 업로드 로직을 통합하고 고도화합니다.

### 선정이유

- **통합된 올인원(All-in-One) 솔루션**: 세련된 UI의 툴바, 에디터, 미리보기를 한 번에 제공하여 개발 경험과 사용자 경험을 모두 향상시킵니다.
- **간결한 이미지 업로드 연동**: `onImageUpload` 핸들러를 제공하여 기존의 S3 업로드 로직(`getPresignedUrl` -> `uploadToS3`)을 손쉽게 통합할 수 있습니다.
- **높은 확장성 및 커스터마이징**: 코드 하이라이팅, 테마 변경(다크 모드 등), 툴바 버튼 커스터마이징 등 다양한 기능을 지원하여 프로젝트 요구사항에 맞게 조정이 용이합니다.

## 구체적인 실행 계획

1.  **라이브러리 설치**
    ```bash
    npm install @uiw/react-md-editor
    ```

2.  **신규 `MarkdownEditor` 컴포넌트 생성**
    - `src/components/Post/` 경로에 `MarkdownEditor.tsx` 파일을 새로 생성합니다.
    - 이 컴포넌트는 `@uiw/react-md-editor`를 래핑(wrapping)하여 프로젝트 전용 에디터로 만듭니다.

    ```tsx
    // src/components/Post/MarkdownEditor.tsx
    'use client';

    import MDEditor, { ContextStore, MDEditorProps } from '@uiw/react-md-editor';
    import rehypeHighlight from 'rehype-highlight';
    import { getPresignedUrl, uploadToS3 } from '@/apis/uploadApi';

    // 이미지 업로드 핸들러
    const onImageUpload = async (file: File): Promise<string> => {
      try {
        const timestamp = Date.now();
        const key = `content-images/${timestamp}_${file.name.replace(/\s+/g, '_')}`;
        
        // 1. Presigned URL 요청
        const { fileUrl: s3Url, uploadUrl: presignedUrl } = await getPresignedUrl(key, file.type);
        
        // 2. S3에 파일 업로드
        await uploadToS3(presignedUrl, file);
        
        // 3. 업로드된 이미지의 S3 URL 반환
        return s3Url;
      } catch (err: any) {
        console.error('이미지 업로드 실패:', err);
        // 사용자에게 에러를 알리는 로직을 추가할 수 있습니다.
        // 에디터는 반환된 문자열을 ![에러](에러메시지) 형태로 보여줍니다.
        return `이미지 업로드 실패: ${err.message}`;
      }
    };

    // MDEditor의 props를 그대로 받아서 사용
    export default function MarkdownEditor(props: MDEditorProps) {
      return (
        <div data-color-mode="light">
          <MDEditor
            {...props}
            height={500}
            preview="live" // 실시간 미리보기
            components={{
              // rehype-highlight를 사용한 코드 하이라이팅
              code: ({ children = '', className, ...rest }) => {
                if (typeof children === 'string' && /language-(\w+)/.test(className || '')) {
                  return (
                    <rehypeHighlight>
                      <code {...rest} className={className}>{children}</code>
                    </rehypeHighlight>
                  );
                }
                return <code {...rest} className={className}>{children}</code>;
              },
            }}
            // 이미지 붙여넣기 및 드래그앤드롭 처리
            onDrop={async (event: React.DragEvent<HTMLDivElement>, commands: ContextStore['commands']) => {
              if (!event.dataTransfer.files || event.dataTransfer.files.length < 1) return;
              const file = event.dataTransfer.files[0];
              if (!file.type.startsWith('image/')) return;
              
              const url = await onImageUpload(file);
              commands.insertImage({ url, alt: file.name });
            }}
            // 툴바의 이미지 버튼 클릭 시 처리
            onImageUpload={onImageUpload}
          />
        </div>
      );
    }
    ```

3.  **글 작성 페이지(`WritePostClient.tsx`) 수정**
    - 기존의 `ReactMDEEditor`, `EditorToolbar` 및 관련 로직(`handleEditorDrop`, `insertTextAtCursor` 등)을 모두 제거합니다.
    - 새로 만든 `MarkdownEditor` 컴포넌트를 가져와 사용합니다.

    ```tsx
    // src/app/write/WritePostClient.tsx (일부)
    // ... imports
    import MarkdownEditor from '@/components/Post/MarkdownEditor'; // 새로 만든 에디터 import

    export default function WritePostClient({ postId, initialData }: Props) {
      // ... 기존 state 및 로직
      // const textareaRef = useRef<HTMLTextAreaElement>(null); // 제거
      // const imageInputRef = useRef<HTMLInputElement | null>(null); // 제거

      // ... handleSave, 기타 로직은 유지

      // insertTextAtCursor, handleEditorDrop 등은 모두 제거

      return (
        <div className="w-full p-8 lg:px-40 ">
          {/* ... 제목, 요약, 썸네일, 카테고리 등 기존 UI ... */}
          
          {/* EditorToolbar 제거 */}
          {/* <EditorToolbar ... /> */}

          {/* 기존 ReactMDEEditor를 MarkdownEditor로 교체 */}
          <MarkdownEditor
            value={markdown}
            onChange={(val) => setMarkdown(val || '')}
          />
          
          {/* ... 저장하기 버튼 ... */}
        </div>
      );
    }
    ```

4.  **게시글 상세 페이지 뷰어 교체 (`PostDetail/Body.tsx`)**
    - `react-markdown`을 사용하던 `MarkdownViewer` 대신, `@uiw/react-md-editor`의 뷰어 컴포넌트인 `Markdown`을 사용하도록 수정합니다.

    ```tsx
    // src/components/PostDetail/Body.tsx (수정 예시)
    'use client';

    import Markdown from '@uiw/react-md-editor/markdown';
    import rehypeHighlight from 'rehype-highlight';

    export default function Body({ content }: { content: string }) {
      return (
        <div data-color-mode="light" className="prose prose-sm sm:prose-base max-w-none">
          <Markdown
            source={content}
            rehypePlugins={[[rehypeHighlight, { detect: true }]]}
          />
        </div>
      );
    }
    ```

5.  **기존 컴포넌트 삭제**
    - 리팩토링이 완료되고 정상 동작이 확인되면, 더 이상 사용하지 않는 아래 파일들을 삭제합니다.
      - `src/components/Post/ReactMDEEditor.tsx`
      - `src/components/Post/EditorToolbar.tsx`
      - `src/components/Post/MarkdownViewer.tsx`