import { Prisma } from '@prisma/client';
export function buildQueryOptions<WhereType, OrderByType>(
  dto: any,
  searchFields: string[], // Model-specific searchable fields
): {
  where: WhereType;
  orderBy?: OrderByType;
  skip: number;
  take: number;
} {
  const { search, page, limit, sortBy, sortOrder, ...filters } = dto;

  // Construct `where` dynamically
  const where: Record<string, any> = { ...filters };

  if (search && searchFields.length > 0) {
    where.OR = searchFields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' },
    }));
  }

  // Construct `orderBy` dynamically
  const orderBy = sortBy
    ? [{ [sortBy]: sortOrder?.toLowerCase() as Prisma.SortOrder }]
    : undefined;

  // Pagination
  const skip = (page - 1) * limit;
  const take = limit;

  return {
    where: where as WhereType,
    orderBy: orderBy as OrderByType,
    skip,
    take,
  };
}
