
import { AccountState } from '../account-state';
import { bananode } from '../bananode';
import { generateMintAndKeepBlock } from '../block-generators/mint';
import { generateSupplyBlock } from "../block-generators/supply"
import { BLOCK_HASH_PATTERN } from '../constants';
import { bananoIpfs } from '../lib/banano-ipfs';
import { generateSignature } from '../lib/generate-signature';
import { generateWork } from '../lib/generate-work';
import { getAccountInfo } from '../lib/get-account-info';
import { getBananoAccount } from '../lib/get-banano-account';
import { getPublicKey } from '../lib/get-public-key';
import { TAccount, TBlockHash, TPrivateKey, TPublicKey } from '../types/banano';

export const supplyMintAndKeep = async (accountState: AccountState, privateKey: TPrivateKey, maxSupply: bigint, metadataIpfsCID: string) => {
  // Get account.
  const publicKey: TPublicKey = getPublicKey(privateKey);
  const account: TAccount     = getBananoAccount(publicKey);

  // Generate change#supply block.
  const accountInfo      = await getAccountInfo(account);
  const supplyPrevious   = accountInfo.frontier;
  const supplyBalanceRaw = BigInt(accountInfo.balance);
  const supplyBlock      = generateSupplyBlock(account, supplyPrevious, supplyBalanceRaw, maxSupply);

  // Generate work and signature for change#supply block.
  const workPromise: Promise<string> = generateWork(supplyPrevious);
  const signPromise: Promise<string> = generateSignature(privateKey, supplyBlock);
  
  supplyBlock.signature = await signPromise;
  supplyBlock.work      = await workPromise;

  // Process change#supply block on the Banano ledger.
  const supplyBlockRequest: any = Object.assign({}, supplyBlock);
  supplyBlockRequest.balance = supplyBlock.balance.toString(10);
  const supplyBlockHash = await processSupply(supplyBlockRequest);

  // Process change#mint block on the Banano ledger.
  const mintPrevious = supplyBlockHash;
  const metadataRepresentative = bananoIpfs.ifpsCidV0ToAccount(metadataIpfsCID) as TAccount;
  const mintBlock = generateMintAndKeepBlock(metadataRepresentative, account, mintPrevious, supplyBlock.balance);
  const mintBlockHash = await processMintAndKeep(mintBlock);
}

const processSupply = async (supplyBlockRequest: any): Promise<TBlockHash> => {
  const response = await bananode.jsonRequest({
    "action": "process",
    "json_block": "true",
    "subtype": "change",
    "block": supplyBlockRequest
  });

  if (typeof response !== "object") {
    throw Error(`BananoNodeRPCError: Unexpected response for process change#supply, got: ${response}`);
  }

  if (response["error"]) {
    throw Error(`BananoNodeRPCError: Process change#supply block returned error: ${response["error"]}`);
  }

  if (!("" + response["hash"]).match(BLOCK_HASH_PATTERN)) {
    throw Error(`BananoNodeRPCError: Process change#supply block returned error: ${response["error"]}`);
  }

  return response["hash"];
};

const processMintAndKeep = async (mintBlockRequest: any): Promise<TBlockHash> => {
  const response = await bananode.jsonRequest({
    "action": "process",
    "json_block": "true",
    "subtype": "change",
    "block": mintBlockRequest
  });

  if (typeof response !== "object") {
    throw Error(`BananoNodeRPCError: Unexpected response for process change#supply, got: ${response}`);
  }

  if (response["error"]) {
    throw Error(`BananoNodeRPCError: Process change#supply block returned error: ${response["error"]}`);
  }

  if (!("" + response["hash"]).match(BLOCK_HASH_PATTERN)) {
    throw Error(`BananoNodeRPCError: Process change#supply block returned error: ${response["error"]}`);
  }

  return response["hash"];
}