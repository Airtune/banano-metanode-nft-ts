import { TBlockHash } from "../types/banano";

export interface IBananoProcessResponse {
  hash: TBlockHash | undefined,
  error?: string
}
