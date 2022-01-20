// types
import { TAccount, TBlockHash, TPrivateKey } from "../types/banano";

// src
import { AccountCache } from "../account-cache";
import { generateMintAndKeepBlock } from "../block-generators/mint";
import { generateSignature } from "../lib/generate-signature";
import { generateWork } from "../lib/generate-work";
import { processBlock } from "../lib/process-block";

// Create change#mint block and process it on the Banano network.
export const mintAndKeepCmd = async (accountCache: AccountCache, metadataRepresentative: TAccount): Promise<TBlockHash> => {
  const previous: string = await accountCache.getFrontier();
  const workPromise: Promise<string> = generateWork(previous);

  // Process change#mint block on the Banano ledger.
  const balanceRaw: bigint = await accountCache.getBalance();
  const block = generateMintAndKeepBlock(metadataRepresentative, accountCache.account, previous, balanceRaw);
  block.signature = await generateSignature(accountCache.privateKey, block);
  block.work      = await workPromise;

  // TODO: Validate it locally first before processing on-chain
  const mintBlockHash = await processBlock(block, "change", "change#mint");
  accountCache.updateInfo(mintBlockHash, balanceRaw, "ready");

  return mintBlockHash;
};
