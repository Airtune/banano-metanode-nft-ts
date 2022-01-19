
import { AccountCache } from '../account-cache';
import { generateSupplyBlock } from "../block-generators/supply"
import { bananoIpfs } from '../lib/banano-ipfs';
import { generateSignature } from '../lib/generate-signature';
import { generateWork } from '../lib/generate-work';
import { getBananoAccount } from '../lib/get-banano-account';
import { getPublicKey } from '../lib/get-public-key';
import { processBlock } from '../lib/process-block';
import { TAccount, TPrivateKey, TPublicKey } from '../types/banano';
import { mintAndKeepCmd } from './mint-and-keep';
import { mintAndSendCmd } from './mint-and-send';

// Supply and Mint command to generate blocks, sign them, generate work,
// and finally process them on the Banano network.
export const supplyAndMintCmd = async (accountCache: AccountCache, privateKey: TPrivateKey, maxSupply: bigint, metadataIpfsCID: string, recipient: TAccount = undefined): Promise<{ supplyBlockHash: string, mintBlockHash: string }> => {
  // Get account.
  const publicKey: TPublicKey = await getPublicKey(privateKey);
  const account: TAccount     = getBananoAccount(publicKey);

  // Generate change#supply block.
  const supplyPrevious   = await accountCache.getFrontier();
  const supplyBalanceRaw = await accountCache.getBalance();
  const supplyBlock      = generateSupplyBlock(account, supplyPrevious, supplyBalanceRaw, maxSupply);

  // Generate work and signature for change#supply block.
  const supplyWorkPromise: Promise<string> = generateWork(supplyPrevious);
  const supplySignPromise: Promise<string> = generateSignature(privateKey, supplyBlock);
  supplyBlock.signature = await supplyWorkPromise;
  supplyBlock.work      = await supplySignPromise;

  // Process change#supply block on the Banano ledger.
  const supplyBlockRequest: any = Object.assign({}, supplyBlock);
  supplyBlockRequest.balance = supplyBlock.balance.toString(10);
  const supplyBlockHash = await processBlock(supplyBlockRequest, "change", "change#supply");
  accountCache.updateInfo(supplyBlockHash, supplyBalanceRaw, "supply_awaiting_mint");
  
  // Mint first NFT (required for change#supply block to be valid.)
  const metadataRepresentative = bananoIpfs.ifpsCidV0ToAccount(metadataIpfsCID) as TAccount;
  let mintBlockHash;
  if (recipient) {
    mintBlockHash = await mintAndSendCmd(accountCache, privateKey, metadataRepresentative, recipient);
  } else {
    mintBlockHash = await mintAndKeepCmd(accountCache, privateKey, metadataRepresentative);
  }
  
  return { supplyBlockHash, mintBlockHash };
};
