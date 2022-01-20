// types
import { TAccount, TBlockHash } from "../types/banano";

// src
import { generateBananoReceiveBlock } from "../block-generators/banano-receive";
import { getBlockInfo } from "../lib/get-block-info";
import { AccountCache } from "../account-cache";
import { processBlock } from "../lib/process-block";
import { generateWork } from "../lib/generate-work";
import { generateSignature } from "../lib/generate-signature";

export const receiveBlockCmd = async (accountCache: AccountCache, link: TBlockHash, amount: bigint = undefined): Promise<TBlockHash> => {
  const previous: TBlockHash         = await accountCache.getFrontier();
  const workPromise: Promise<string> = generateWork(previous);

  const representative: TAccount = await accountCache.getRepresentative();
  const balanceRaw: bigint       = await accountCache.getBalance() + (amount || await getSendBlockAmount(link));
  const block = generateBananoReceiveBlock(accountCache.account, balanceRaw, link, representative, previous);

  // Generate work and signature for open block.
  const signPromise: Promise<string> = generateSignature(accountCache.privateKey, block);
  block.signature = await signPromise;
  block.work      = await workPromise;

  const blockHash = await processBlock(block, "receive", "receive");
  accountCache.updateInfo(blockHash, block.balance, "ready", representative);

  return blockHash;
};

const getSendBlockAmount = async (link: string): Promise<bigint> => {
  const sendBlock = await getBlockInfo(link);

  const amount = BigInt(sendBlock["amount"]);
  if (amount <= BigInt(0)) {
    throw Error(`Unable to receive block with amount: ${amount} for link: ${link}`);
  }

  return amount;
};
