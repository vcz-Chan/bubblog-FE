// src/mocks/posts.ts

export interface Post {
    id: number;
    title: string;
    summary: string;
    content: string;
    author: string;
    createdAt: string;
    categoryId: number;
  }
  
  // 🔥 id별로 절대적으로 내용 일치시킴
  
  const postTemplates: Record<number, Post> = {
    1: {
      id: 1,
      title: "알고리즘 공부",
      summary: "정렬, 탐색 알고리즘 정리",
      content: `# 제목1
  
  **굵게 텍스트**  
  - 리스트 아이템1
  - 리스트 아이템2
  
  > 인용구
  
  \`\`\`ts
  const hello = "world";
  \`\`\`
  `,
      author: "123",
      createdAt: "2025-04-26",
      categoryId: 2, // 공부 > 알고리즘
    },
    2: {
      id: 2,
      title: "오늘의 일기",
      summary: "벚꽃 구경 다녀옴",
      content: "## 일상 기록\n봄이다.",
      author: "123",
      createdAt: "2025-04-25",
      categoryId: 6, // 일상 > 학교
    },
    3: {
      id: 3,
      title: "일상 기록",
      summary: "오늘은 날씨가 좋았다.",
      content: "## 일상 기록\n맑은 날씨였다.",
      author: "123",
      createdAt: "2025-04-24",
      categoryId: 6, // 일상 > 학교
    },
    10: {
      id: 10,
      title: "내 포스트 1",
      summary: "내 글 요약",
      content: "## 내 포스트 1 내용\n열심히 썼다.",
      author: "123",
      createdAt: "2025-04-23",
      categoryId: 2,
    },
    11: {
      id: 11,
      title: "내 포스트 2",
      summary: "내 두 번째 글 요약",
      content: "## 내 포스트 2 내용\n두 번째 글입니다.",
      author: "123",
      createdAt: "2025-04-22",
      categoryId: 2,
    },
  };
  
  // ✨ popularPosts
  export const popularPosts: Post[] = [
    postTemplates[1],
    postTemplates[2],
    postTemplates[3],
  ];
  
  // ✨ myPosts
  export const myPosts: Post[] = [
    postTemplates[10],
    postTemplates[11],
    postTemplates[1],
    postTemplates[2],
    postTemplates[3],
  ];
  
  // ✨ mockPosts
  export const mockPosts: Post[] = [
    postTemplates[1],
    postTemplates[2],
  ];