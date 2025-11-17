import SearchPageClient from '@/app/search/SearchPageClient';

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parseNumber(param: string | string[] | undefined): number | null {
  if (typeof param !== 'string') return null;
  const value = Number.parseInt(param, 10);
  return Number.isNaN(value) ? null : value;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const queryParam = params?.query;
  const pageParam = params?.page;
  const categoryParam = params?.categoryId ?? params?.category_id;

  const query = typeof queryParam === 'string' ? queryParam : '';
  const page = parseNumber(pageParam) ?? 0;
  const categoryId = parseNumber(categoryParam);

  return (
    <SearchPageClient
      query={query}
      page={page >= 0 ? page : 0}
      categoryId={categoryId}
    />
  );
}
