# Bubblog REST API 문서

이 문서는 Bubblog 백엔드 서비스에서 제공하는 모든 REST API를 정리합니다. 모든 응답은 `SuccessResponse<T>` 또는 `ErrorResponse<T>` 래퍼로 전달되며, 필드 구조는 아래 **공통 응답 포맷**을 참고하세요. `SecurityConfig` 상에서 명시된 엔드포인트를 제외하면 JWT 액세스 토큰(`Authorization: Bearer <token>`)이 필요합니다.

## 공통 응답 포맷

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `success` | `boolean` | 성공 여부. 성공 시 `true`, 실패 시 `false`. |
| `code` | `int` | HTTP 상태 코드. |
| `message` | `string` | 처리 결과 메시지. 기본값은 "성공했습니다." 또는 오류 메시지. |
| `data` | `T or null` | 응답 데이터. `Void` 응답은 `null`. |

검증 실패 시 `ErrorResponse<List<FieldErrorDto>>`로 내려가며, `FieldErrorDto`는 `field`, `rejectedValue`, `reason`을 포함합니다.

## 인증 & 토큰 관리

### POST `/api/auth/signup`
- **인증**: 불필요
- **설명**: 신규 사용자 등록
- **요청 본문 (`SignupRequestDTO`)**
  | 필드 | 타입 | 필수 | 설명 |
  | --- | --- | --- | --- |
  | `email` | `string` | ✓ | 이메일 형식, 중복 불가 |
  | `password` | `string` | ✓ | 8~20자 |
  | `nickname` | `string` | ✓ | 최대 30자, 중복 불가 |
  | `profileImageUrl` | `string` |  | 프로필 이미지 URL |
- **성공 응답**: `SuccessResponse<Void>`

### POST `/api/auth/login`
- **인증**: 불필요
- **설명**: 로그인 및 토큰 발급
- **요청 본문 (`LoginRequestDTO`)**: `email`, `password`
- **성공 응답**: `SuccessResponse<LoginResponseDTO>` (`accessToken`, `userId`)
- **부가사항**: `refreshToken`을 Secure, HttpOnly, SameSite=None 쿠키로 전송

### POST `/api/auth/logout`
- **인증**: JWT
- **설명**: Redis에 저장된 리프레시 토큰 삭제 및 만료 쿠키 반환
- **요청**: 쿠키 `refreshToken`
- **성공 응답**: `SuccessResponse<Void>`

### POST `/api/auth/reissue`
- **인증**: 쿠키 `refreshToken`
- **설명**: 리프레시 토큰 검증 후 액세스/리프레시 토큰 재발급
- **성공 응답**: `SuccessResponse<ReissueResponseDTO>` (`accessToken`, `userId`)

## 사용자 정보

### GET `/api/users/{userId}`
- **인증**: 불필요
- **설명**: 특정 사용자 공개 정보 조회
- **성공 응답**: `SuccessResponse<UserInfoDTO>` (`userId`, `nickname`, `profileImageUrl`)

### PUT `/api/users/me`
- **인증**: JWT
- **설명**: 본인 정보 수정 (닉네임/프로필 이미지)
- **요청 본문 (`UserUpdateDTO`)**
  | 필드 | 타입 | 설명 |
  | --- | --- | --- |
  | `nickname` | `string` | 변경할 닉네임(최대 30자). null이면 유지 |
  | `profileImageUrl` | `string` | 변경할 이미지. null이면 제거 |
- **성공 응답**: `SuccessResponse<Void>`

### GET `/api/users/me/posts/{postId}`
- **인증**: JWT
- **설명**: 내 게시글 상세 조회(공개·비공개 포함)
- **성공 응답**: `SuccessResponse<BlogPostDetailDTO>`

### GET `/api/users/me/posts`
- **인증**: JWT
- **설명**: 내 게시글 목록 조회 (공개/비공개)
- **쿼리 파라미터**: `categoryId`, `page`, `size`, `sort`
- **성공 응답**: `SuccessResponse<UserPostsResponseDTO>`

### GET `/api/users/me/posts/comments`
- **인증**: JWT
- **설명**: 내가 작성한 게시글 중 댓글이 달린 게시글 목록
- **성공 응답**: `SuccessResponse<Page<BlogPostSummaryDTO>>`

### GET `/api/users/me/likes/posts`
- **인증**: JWT
- **설명**: 내가 좋아요 누른 게시글 목록 페이징 조회
- **성공 응답**: `SuccessResponse<Page<BlogPostSummaryDTO>>`

### GET `/api/users/me/comments/posts`
- **인증**: JWT
- **설명**: 내가 댓글을 단 게시글 목록
- **성공 응답**: `SuccessResponse<Page<BlogPostSummaryDTO>>`

### GET `/api/users/me/comments`
- **인증**: JWT
- **설명**: 내가 작성한 댓글 목록 (루트/대댓글 포함)
- **쿼리 파라미터**: `page`, `size`, `sort=createdAt,DESC`
- **성공 응답**: `SuccessResponse<Page<CommentResponseDTO>>`

## 게시글

### POST `/api/posts`
- **인증**: JWT
- **설명**: 새 게시글 작성. 카테고리 소유권 검증 후 태그 저장 및 AI 임베딩 요청
- **요청 본문 (`BlogPostRequestDTO`)**
  | 필드 | 타입 | 필수 | 설명 |
  | --- | --- | --- | --- |
  | `title` | `string` | ✓ | 1~100자 |
  | `content` | `string` | ✓ | 본문 |
  | `summary` | `string` |  | 최대 255자 |
  | `categoryId` | `long` | ✓ | 본인 소유 카테고리 |
  | `publicVisible` | `boolean` | ✓ | 공개 여부 |
  | `thumbnailUrl` | `string` |  | 썸네일 |
  | `tags` | `string[]` | ✓ | 태그 이름 목록 (빈 배열 가능) |
- **성공 응답**: `SuccessResponse<BlogPostDetailDTO>`

### GET `/api/posts/{postId}`
- **인증**: 불필요
- **설명**: 공개 게시글 상세 조회, 비공개 시 404
- **성공 응답**: `SuccessResponse<BlogPostDetailDTO>`

### GET `/api/posts`
- **인증**: 불필요
- **설명**: 공개 게시글 전체 조회 + 키워드 검색
- **쿼리 파라미터**: `keyword`, `page`, `size`, `sort`
- **성공 응답**: `SuccessResponse<Page<BlogPostSummaryDTO>>`

### GET `/api/posts/users/{userId}`
- **인증**: 불필요
- **설명**: 특정 사용자의 공개 게시글 조회, 선택적 카테고리 필터
- **쿼리 파라미터**: `categoryId`, `page`, `size`, `sort`
- **성공 응답**: `SuccessResponse<UserPostsResponseDTO>`

### GET `/api/posts/tags/{tagId}`
- **인증**: 불필요
- **설명**: 태그 기반 공개 게시글 조회
- **쿼리 파라미터**: `page`, `size`, `sort`
- **성공 응답**: `SuccessResponse<Page<BlogPostSummaryDTO>>`

### PUT `/api/posts/{postId}`
- **인증**: JWT
- **설명**: 게시글 수정. 제목/본문 변경 시 AI 임베딩 재요청, 태그 전량 재설정
- **요청 본문**: `BlogPostRequestDTO`
- **성공 응답**: `SuccessResponse<Void>`

### DELETE `/api/posts/{postId}`
- **인증**: JWT
- **설명**: 게시글 삭제 (연관 댓글·태그 cascade)
- **성공 응답**: `SuccessResponse<Void>`

### PUT `/api/posts/{postId}/like`
- **인증**: JWT
- **설명**: 게시글 좋아요 토글. 좋아요 생성/삭제 및 카운트 업데이트
- **성공 응답**: `SuccessResponse<Boolean>` (`true`=좋아요 추가, `false`=취소)

### PUT `/api/posts/{postId}/view`
- **인증**: 불필요
- **설명**: 조회수 +1 (단순 카운터)
- **성공 응답**: `SuccessResponse<Void>`

### POST `/api/posts/{postId}/comments`
- **인증**: JWT
- **설명**: 댓글 생성. `parentId` 지정 시 대댓글, 대댓글의 자식은 제한됨
- **요청 본문 (`CreateCommentDTO`)**
  | 필드 | 타입 | 필수 | 설명 |
  | --- | --- | --- | --- |
  | `content` | `string` | ✓ | 1~1000자 |
  | `parentId` | `long` |  | 루트 댓글 ID (null이면 루트) |
- **성공 응답**: `SuccessResponse<CommentResponseDTO>`

### GET `/api/posts/{postId}/comments`
- **인증**: 불필요
- **설명**: 루트 댓글 목록 조회 (작성 시간 오름차순)
- **성공 응답**: `SuccessResponse<CommentResponseDTO[]>`

### GET `/api/posts/{postId}/comments/count`
- **인증**: 불필요
- **설명**: 게시글 전체 댓글 수 (대댓글 포함)
- **성공 응답**: `SuccessResponse<Long>`

## 댓글

### GET `/api/comments/{commentId}`
- **인증**: 불필요
- **설명**: 댓글 단건 상세 조회. 루트면 `replyCount` 포함
- **성공 응답**: `SuccessResponse<CommentResponseDTO>`

### GET `/api/comments/{commentId}/children`
- **인증**: 불필요
- **설명**: 루트 댓글의 자식 댓글 페이징 조회
- **쿼리 파라미터**: `page`, `size`, `sort=createdAt`
- **성공 응답**: `SuccessResponse<Page<CommentResponseDTO>>`

### GET `/api/comments/{commentId}/thread`
- **인증**: 불필요
- **설명**: 루트 댓글과 모든 자식 댓글 스레드 조회
- **성공 응답**: `SuccessResponse<CommentThreadResponseDTO>`

### PUT `/api/comments/{commentId}`
- **인증**: JWT
- **설명**: 본인 댓글 수정
- **요청 본문 (`UpdateCommentDTO`)**: `content`
- **성공 응답**: `SuccessResponse<CommentResponseDTO>`

### DELETE `/api/comments/{commentId}`
- **인증**: JWT
- **설명**: 본인 댓글 Soft delete
- **성공 응답**: `SuccessResponse<Void>`

## 댓글 좋아요

### POST `/api/comments/{commentId}/likes`
- **인증**: JWT
- **설명**: 댓글 좋아요 토글. 삭제된 댓글에는 예외 발생
- **성공 응답**: `SuccessResponse<Void>`

## 태그

### GET `/api/tags`
- **인증**: JWT 필요 (SecurityConfig 상)
- **설명**: 전체 태그 목록 조회
- **성공 응답**: `SuccessResponse<TagResponseDTO[]>`

### GET `/api/tags/{id}`
- **인증**: JWT 필요
- **설명**: 단일 태그 조회
- **성공 응답**: `SuccessResponse<TagResponseDTO>`

## 카테고리

### POST `/api/categories`
- **인증**: JWT
- **설명**: 새 카테고리 생성. Closure Table 관계 생성
- **요청 본문 (`CategoryCreateDTO`)**: `name`, `parentId`
- **성공 응답**: `SuccessResponse<CategoryDTO>`

### PUT `/api/categories/{id}`
- **인증**: JWT
- **설명**: 카테고리명/부모 변경. 루트 이동 시 `newParentId=0`
- **요청 본문 (`CategoryUpdateDTO`)**: `name`, `newParentId`
- **성공 응답**: `SuccessResponse<Void>`

### DELETE `/api/categories/{id}`
- **인증**: JWT
- **설명**: 카테고리 및 하위 삭제
- **성공 응답**: `SuccessResponse<Void>`

### GET `/api/categories`
- **인증**: JWT
- **설명**: 내 카테고리 목록 (리스트)
- **성공 응답**: `SuccessResponse<CategoryDTO[]>`

### GET `/api/categories/{userId}/tree`
- **인증**: JWT
- **설명**: 특정 사용자의 카테고리 트리 조회
- **성공 응답**: `SuccessResponse<CategoryTreeDTO[]>`

## 페르소나

### POST `/api/personas`
- **인증**: JWT
- **설명**: 말투 생성
- **요청 본문 (`PersonaRequestDTO`)**: `name`, `description`
- **성공 응답**: `SuccessResponse<PersonaResponseDTO>`

### GET `/api/personas/{personaId}`
- **인증**: 불필요
- **설명**: 말투 단건 조회
- **성공 응답**: `SuccessResponse<PersonaResponseDTO>`

### GET `/api/personas`
- **인증**: 불필요
- **설명**: 말투 전체 목록
- **성공 응답**: `SuccessResponse<PersonaResponseDTO[]>`

### GET `/api/personas/users/{userId}`
- **인증**: 불필요
- **설명**: 사용자별 말투 목록
- **성공 응답**: `SuccessResponse<PersonaResponseDTO[]>`

### PUT `/api/personas/{personaId}`
- **인증**: JWT
- **설명**: 말투 수정 (현재 구현 기준 소유자 검증 필요 시 추가 고려)
- **요청 본문**: `PersonaRequestDTO`
- **성공 응답**: `SuccessResponse<PersonaResponseDTO>`

### DELETE `/api/personas/{personaId}`
- **인증**: JWT
- **설명**: 말투 삭제 (소유자만 가능)
- **성공 응답**: `SuccessResponse<Void>`

## 이미지 업로드

### POST `/api/uploads/presigned-url`
- **인증**: JWT
- **설명**: S3 업로드용 Presigned PUT URL 발급
- **요청 본문 (`S3UploadRequestDTO`)**: `fileName`, `contentType`
- **성공 응답**: `SuccessResponse<PresignedUrlDTO>` (`uploadUrl`, `fileUrl`)

## DTO 스키마 상세 (댓글 & 태그)

### 댓글 DTO

#### 요청 DTO

##### `CreateCommentDTO`

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `content` | `string` | ✓ | 댓글 본문 (1~1000자) |
| `parentId` | `long` |  | 루트 댓글 ID. null이면 루트 댓글 생성 |

```json
{
  "content": "오늘 경기 너무 재밌었어요!",
  "parentId": null
}
```

##### `UpdateCommentDTO`

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `content` | `string` | ✓ | 수정할 본문 (1~1000자) |

```json
{
  "content": "댓글 수정 완료!"
}
```

#### 응답 DTO

##### `CommentResponseDTO`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `long` | 댓글 ID |
| `content` | `string` | 댓글 내용. Soft delete 시 "삭제된 댓글입니다."로 마스킹 |
| `deleted` | `boolean` | Soft delete 여부 |
| `writerNickname` | `string` | 작성자 닉네임 |
| `writerProfileImage` | `string` | 작성자 프로필 이미지 URL (null 가능) |
| `likeCount` | `int` | 좋아요 수 |
| `createdAt` | `string (ISO-8601)` | 작성 시간 |
| `updatedAt` | `string (ISO-8601)` | 수정 시간 (없으면 null) |
| `parentId` | `long` | 부모 댓글 ID. 루트는 null |
| `replyCount` | `long` | 루트 댓글의 자식 수. 자식 댓글은 null |

##### `CommentThreadResponseDTO`

```json
{
  "root": {
    "id": 1,
    "content": "루트 댓글",
    "deleted": false,
    "writerNickname": "작성자",
    "writerProfileImage": "https://...",
    "likeCount": 3,
    "createdAt": "2024-05-01T12:00:00",
    "updatedAt": "2024-05-01T12:30:00",
    "parentId": null,
    "replyCount": 2
  },
  "children": [
    {
      "id": 2,
      "content": "대댓글 1",
      "deleted": false,
      "writerNickname": "다른 사용자",
      "writerProfileImage": null,
      "likeCount": 0,
      "createdAt": "2024-05-01T12:10:00",
      "updatedAt": null,
      "parentId": 1,
      "replyCount": null
    }
  ]
}
```

루트 댓글과 그 자식 전체를 반환합니다. `root.replyCount`는 포함된 자식 수와 일치합니다.

### 태그 DTO

#### 요청 DTO

##### `TagRequestDTO`

> 현재 API는 조회만 제공하며, 게시글 생성/수정 시 `tags` 문자열 배열을 사용합니다. 추후 태그 생성 API를 사용할 경우 아래 구조를 따릅니다.

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `name` | `string` | ✓ | 태그 이름 |

```json
{
  "name": "spring"
}
```

#### 응답 DTO

##### `TagResponseDTO`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `long` | 태그 ID |
| `name` | `string` | 태그 이름 |

#### 태그 연관 처리
- 게시글 생성/수정 시 `tags` 문자열 배열을 전달하면 존재하지 않는 태그는 자동 생성됩니다.
- 게시글과 태그는 `PostTag` 엔티티로 연결되며, 게시글 수정 시 기존 연결을 모두 삭제 후 새 목록으로 재생성합니다.

—

추가적인 예시나 응답 샘플이 필요하면 알려주세요.
