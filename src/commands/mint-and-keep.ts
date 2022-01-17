// types
import { TAccount, TBlockHash, TPrivateKey } from "../types/banano";

// src
import { AccountCache } from "../account-cache";
import { generateMintAndKeepBlock } from "../block-generators/mint";
import { generateSignature } from "../lib/generate-signature";
import { generateWork } from "../lib/generate-work";
import { processBlock } from "../lib/process-block";

// Create change#mint block and process it on the Banano network.
export const mintAndKeepCmd = async (accountCache: AccountCache, privateKey: TPrivateKey, metadataRepresentative: TAccount): Promise<TBlockHash> => {
  const workPromise: Promise<string> = generateWork(accountCache.cachedFrontier);

  // Process change#mint block on the Banano ledger.
  const balance: bigint = accountCache.cachedBalance;
  const block = generateMintAndKeepBlock(metadataRepresentative, accountCache.account, accountCache.cachedFrontier, balance);
  block.signature = await generateSignature(privateKey, block);
  block.work      = await workPromise;

  // dup mint block and convert balance to string for request
  const mintBlockRequest: any = Object.assign({}, block);
  mintBlockRequest.balance = block.balance.toString(10);
  const mintBlockHash = await processBlock(mintBlockRequest, "change", "change#mint");
  accountCache.updateInfo(mintBlockHash, accountCache.cachedBalance, "ready");

  return mintBlockHash;
};
