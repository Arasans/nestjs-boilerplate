import { Types } from 'mongoose';

export interface CursorMeta {
  next_cursor: string;
  has_next_page: boolean;
  prev_cursor: string;
  has_prev_page: boolean;
}

export function buildCursorPagination<
  T extends { _id: Types.ObjectId | string },
>(
  rawData: T[],
  take: number,
  cursor?: string,
  direction: 'next' | 'prev' = 'next',
): { data: T[]; meta: CursorMeta } {
  const hasMore = rawData.length > take;
  const sliced = hasMore ? rawData.slice(0, take) : rawData;
  const data = direction === 'prev' ? sliced.reverse() : sliced;

  if (direction === 'prev') {
    const has_prev_page = hasMore;
    const prev_cursor =
      has_prev_page && data.length > 0
        ? (data[0]._id as Types.ObjectId).toString()
        : '';
    const has_next_page = !!cursor;
    const next_cursor =
      has_next_page && data.length > 0
        ? (data[data.length - 1]._id as Types.ObjectId).toString()
        : '';
    return {
      data,
      meta: { next_cursor, has_next_page, prev_cursor, has_prev_page },
    };
  }

  const has_next_page = hasMore;
  const next_cursor =
    has_next_page && data.length > 0
      ? (data[data.length - 1]._id as Types.ObjectId).toString()
      : '';
  const has_prev_page = !!cursor;
  const prev_cursor =
    has_prev_page && data.length > 0
      ? (data[0]._id as Types.ObjectId).toString()
      : '';
  return {
    data,
    meta: { next_cursor, has_next_page, prev_cursor, has_prev_page },
  };
}
