import { mockCategories } from "@/mocks/categories";

export function getCategoryPath(categoryId: number) {
  for (const parent of mockCategories) {
    const child = parent.children.find((c) => c.id === categoryId);
    if (child) {
      return `${parent.name} > ${child.name}`;
    }
  }
  return "알 수 없음";
}