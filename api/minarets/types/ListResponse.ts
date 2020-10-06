export interface ListResponse<T> {
  items: T[];
  items_per_page: number;
  page: number;
  total: number;
}
