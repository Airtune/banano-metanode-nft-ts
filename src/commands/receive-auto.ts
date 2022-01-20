// types
import { TBlockHash } from "../types/banano";

// src
import { getBananoReceivable } from "../lib/get-banano-receivable";
import { AccountCache } from "../account-cache";
import { receiveBlockCmd } from "./receive-block";

// Find receivable on account and automatically receive them.
export const receiveAutoCmd = async (accountCache: AccountCache, maxReceiveCount: number = 10): Promise<TBlockHash[]> => {
  const sendBlockHashes = await getBananoReceivable(accountCache.account);

  let receivedBlockHashes: TBlockHash[] = [];
  for (const sendBlockHash of sendBlockHashes) {
    const receiveBlockHash = await receiveBlockCmd(accountCache, sendBlockHash);
    receivedBlockHashes.push(receiveBlockHash);

    if (receivedBlockHashes.length >= maxReceiveCount) { break; }
  }

  return receivedBlockHashes;
};
