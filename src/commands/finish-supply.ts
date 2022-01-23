
import { AccountCache } from '../account-cache';
import { generateFinishSupplyBlock } from '../block-generators/finish-supply';
import { IBananoChange } from '../interfaces/banano-change';
import { generateSignature } from '../lib/generate-signature';
import { generateWork } from '../lib/generate-work';
import { processBlock } from '../lib/process-block';
import { TAccount, TBlockHash } from '../types/banano';

export const finishSupplyCmd = async (accountCache: AccountCache, supplyBlockHeight: bigint): Promise<TBlockHash> => {
  // Generate change#finish_supply block.
  const previous: TBlockHash = await accountCache.getFrontier();
  const balanceRaw: bigint   = await accountCache.getBalance();
  const representative: TAccount = await accountCache.getRepresentative();
  const block: IBananoChange = generateFinishSupplyBlock(accountCache.account, previous, balanceRaw, supplyBlockHeight);

  // Generate work and signature for change#supply block.
  const workPromise: Promise<string> = generateWork(previous);
  const signPromise: Promise<string> = generateSignature(accountCache.privateKey, block);
  block.signature = await signPromise;
  block.work      = await workPromise;

  const finishSupplyBlockHash = await processBlock(block, "change", "change#finish_supply");
  accountCache.updateInfo(finishSupplyBlockHash, balanceRaw, "ready", representative);
  
  return finishSupplyBlockHash;
};
