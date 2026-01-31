'use client';

import { parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs";

export const PER_PAGE = 10;

export const searchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(PER_PAGE),
  keyword: parseAsString,
  // gender: parseAsString,
  // category: parseAsString,
  // advanced filter
  // filters: getFiltersSateParser().withDefault([]),
  // joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
}
