export interface ListResponse<T> {
  items: T[];
  itemsPerPage: number;
  page: number;
  total: number;
}
