// types
import { TAccount, TBlockHash, TPrivateKey } from "../types/banano";

// src
import { AccountCache } from "../account-cache";
import { generateMintAndSendBlock } from "../block-generators/mint";
import { generateSignature } from "../lib/generate-signature";
import { generateWork } from "../lib/generate-work";
import { processBlock } from "../lib/process-block";

// Create send#mint block and process it on the Banano network.
export const mintAndSendCmd = async (accountCache: AccountCache, metadataRepresentative: TAccount, recipient: TAccount): Promise<TBlockHash> => {
  const previous: string = await accountCache.getFrontier();
  const workPromise: Promise<string> = generateWork(previous);

  // Process send#mint block on the Banano ledger.
  const balanceRaw: bigint = await accountCache.getBalance();
  const block = generateMintAndSendBlock(metadataRepresentative, accountCache.account, recipient, previous, balanceRaw);
  block.signature = await generateSignature(accountCache.privateKey, block);
  block.work      = await workPromise;

  // TODO: Validate it locally first before processing on-chain
  const mintBlockHash = await processBlock(block, "send", "send#mint");
  if (mintBlockHash) {
    accountCache.updateInfo(mintBlockHash, balanceRaw - BigInt("1"), "ready", metadataRepresentative);
  }

  return mintBlockHash;
};
