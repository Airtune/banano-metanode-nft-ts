
import { AccountCache } from '../account-cache';
import { generateSupplyBlock } from "../block-generators/supply"
import { IBananoChange } from '../interfaces/banano-change';
import { bananoIpfs } from '../lib/banano-ipfs';
import { generateSignature } from '../lib/generate-signature';
import { generateWork } from '../lib/generate-work';
import { getBananoAccount } from '../lib/get-banano-account';
import { getPublicKey } from '../lib/get-public-key';
import { processBlock } from '../lib/process-block';
import { TAccount, TBlockHash, TPrivateKey, TPublicKey } from '../types/banano';

// Supply and Mint command to generate blocks, sign them, generate work,
// and finally process them on the Banano network.
export const supplyCmd = async (accountCache: AccountCache, maxSupply: bigint): Promise<TBlockHash> => {
  // Generate change#supply block.
  const previous: TBlockHash = await accountCache.getFrontier();
  const balanceRaw: bigint   = await accountCache.getBalance();
  const representative: TAccount = await accountCache.getRepresentative();
  const block: IBananoChange = generateSupplyBlock(accountCache.account, previous, balanceRaw, maxSupply);

  // Generate work and signature for change#supply block.
  const workPromise: Promise<string> = generateWork(previous);
  const signPromise: Promise<string> = generateSignature(accountCache.privateKey, block);
  block.signature = await signPromise;
  block.work      = await workPromise;

  const supplyBlockHash = await processBlock(block, "change", "change#supply");
  accountCache.updateInfo(supplyBlockHash, balanceRaw, "supply_awaiting_mint", representative);
  
  return supplyBlockHash;
};
