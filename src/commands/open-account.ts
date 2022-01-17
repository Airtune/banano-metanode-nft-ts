// types
import { TAccount, TBlockHash, TPublicKey } from "../types/banano";

// src
import { config } from "../config";
import { generateBananoReceiveBlock } from "../block-generators/banano-receive";
import { safeGetAccountInfo } from "../lib/get-account-info";
import { getBananoReceivable } from "../lib/get-banano-receivable";
import { getBlockInfo } from "../lib/get-block-info";
import { AccountCache } from "../account-cache";
import { getPublicKey } from "../lib/get-public-key";
import { getBananoAccount } from "../lib/get-banano-account";
import { processBlock } from "../lib/process-block";
import { generateWork } from "../lib/generate-work";
import { generateSignature } from "../lib/generate-signature";

// Open account command to find receivable, generate the open block, sign it, generate work,
// and finally process it on the Banano ledger.
export const openAccountCmd = async (privateKey: string): Promise<{ openBlockHash: TBlockHash, openAccountCache: AccountCache }> => {
  const publicKey: TPublicKey = getPublicKey(privateKey);
  const account: TAccount     = getBananoAccount(publicKey);
  const previous: TBlockHash  = "0000000000000000000000000000000000000000000000000000000000000000";
  const accountInfo = await safeGetAccountInfo(account);

  if (typeof accountInfo === "object" && !accountInfo["error"]) {
    throw Error(`AccountAlreadyOpenError: Expected error on 'account_info' but got nothing. Is the account: ${account} already open?`);
  }

  const link = await getOpenLink(account);
  const representative = config.defaultRepresentative;
  const balance: bigint = await getOpenBlockBalance(account, link);
  const openBlock = generateBananoReceiveBlock(account, balance, link, representative, previous);

  // Generate work and signature for open block.
  const workPromise: Promise<string> = generateWork(openBlock.previous);
  const signPromise: Promise<string> = generateSignature(privateKey, openBlock);
  openBlock.signature = await signPromise;
  openBlock.work      = await workPromise;
  
  let openBlockRequest: any = Object.assign({}, openBlock);
  openBlockRequest.balance = openBlockRequest.balance.toString(10);

  const openBlockHash = await processBlock(openBlockRequest, "open", "open");
  const openAccountCache: AccountCache = new AccountCache(account);
  openAccountCache.updateInfo(openBlockHash, openBlock.balance, "ready");

  return { openBlockHash, openAccountCache };
};

// Find receivable
const getOpenLink = async (account: string): Promise<string> => {
  const sendBlockHashes = await getBananoReceivable(account);
  const link: string = sendBlockHashes[0];
  if (!link) {
    throw Error(`Unable to open account: ${account}. Does it have any receivable transactions?`);
  }

  return link;
};

const getOpenBlockBalance = async (account:string, link: string): Promise<bigint> => {
  const sendBlock = await getBlockInfo(link);

  if (typeof sendBlock !== "object") {
    throw Error(`Unable to open account: ${account} with link: ${link}`);
  }

  const balance = BigInt(sendBlock["amount"]);
  if (balance <= BigInt(0)) {
    throw Error(`Unable to open account with balance: ${balance}`);
  }

  return balance;
};
