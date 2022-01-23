
import { AccountCache } from '../account-cache';
import { generateCancelSupplyBlock } from '../block-generators/cancel-supply';
import { IBananoChange } from '../interfaces/banano-change';
import { generateSignature } from '../lib/generate-signature';
import { generateWork } from '../lib/generate-work';
import { processBlock } from '../lib/process-block';
import { TAccount, TBlockHash } from '../types/banano';

export const cancelSupplyCmd = async (accountCache: AccountCache): Promise<TBlockHash> => {
  // Generate change#cancel_supply block.
  const previous: TBlockHash = await accountCache.getFrontier();
  const balanceRaw: bigint   = await accountCache.getBalance();
  const representative: TAccount = await accountCache.getRepresentative();
  const block: IBananoChange = generateCancelSupplyBlock(accountCache.account, previous, balanceRaw);

  // Generate work and signature for change#cancel_supply block.
  const workPromise: Promise<string> = generateWork(previous);
  const signPromise: Promise<string> = generateSignature(accountCache.privateKey, block);
  block.signature = await signPromise;
  block.work      = await workPromise;

  const supplyBlockHash = await processBlock(block, "change", "change#cancel_supply");
  accountCache.updateInfo(supplyBlockHash, balanceRaw, "ready", representative);
  
  return supplyBlockHash;
};
