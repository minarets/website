export interface ErrorWithResponse extends Error {
  response?: Response;
}
