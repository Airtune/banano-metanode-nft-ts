// types
import { TAccount, TBlockHash, TPrivateKey } from "../types/banano";

// src
import { AccountCache } from "../account-cache";
import { generateMintAndSendBlock } from "../block-generators/mint";
import { generateSignature } from "../lib/generate-signature";
import { generateWork } from "../lib/generate-work";
import { processBlock } from "../lib/process-block";

// Create send#mint block and process it on the Banano network.
export const mintAndSendCmd = async (accountCache: AccountCache, privateKey: TPrivateKey, metadataRepresentative: TAccount, recipient: TAccount): Promise<TBlockHash> => {
  const workPromise: Promise<string> = generateWork(accountCache.cachedFrontier);

  // Process send#mint block on the Banano ledger.
  const balance: bigint = accountCache.cachedBalance - BigInt("1");
  const block = generateMintAndSendBlock(metadataRepresentative, accountCache.account, recipient, accountCache.cachedFrontier, balance);
  block.signature = await generateSignature(privateKey, block);
  block.work      = await workPromise;

  // dup mint block and convert balance to string for request
  const mintBlockRequest: any = Object.assign({}, block);
  mintBlockRequest.balance = block.balance.toString(10);
  const mintBlockHash = await processBlock(mintBlockRequest, "send", "send#mint");
  accountCache.updateInfo(mintBlockHash, balance, "ready");

  return mintBlockHash;
};