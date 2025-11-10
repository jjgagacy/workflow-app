export class QueryDto {
  page?: number;
  limit?: number;
}

export function getPaginationOptions(dto: { page?: number; limit?: number; }) {
  if (!dto) {
    return {};
  }
  if (typeof dto.page === 'undefined' || typeof dto.limit === 'undefined') {
    return {};
  }

  const skip = (dto.page! - 1) * dto.limit!;
  const take = dto.limit!;

  return {
    skip: skip || 0,
    take: take || 10
  };
}
