import type { Response } from 'node-fetch';

export interface ErrorWithResponse extends Error {
  response?: Response;
}
