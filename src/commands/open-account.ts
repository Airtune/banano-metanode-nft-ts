// types
import { TBlockHash } from "../types/banano";

// src
import { config } from "../config";
import { generateBananoReceiveBlock } from "../block-generators/banano-receive";
import { safeGetAccountInfo } from "../lib/get-account-info";
import { getBananoReceivable } from "../lib/get-banano-receivable";
import { getBlockInfo } from "../lib/get-block-info";
import { AccountCache } from "../account-cache";
import { processBlock } from "../lib/process-block";
import { generateWork } from "../lib/generate-work";
import { generateSignature } from "../lib/generate-signature";

// Open account command to find receivable, generate the open block, sign it, generate work,
// and finally process it on the Banano ledger.
export const openAccountCmd = async (accountCache: AccountCache): Promise<TBlockHash> => {
  const previous: TBlockHash  = "0000000000000000000000000000000000000000000000000000000000000000";

  const accountInfo = await safeGetAccountInfo(accountCache.account);

  if (typeof accountInfo === "object" && !accountInfo["error"]) {
    throw Error(`AccountAlreadyOpenError: Expected error on 'account_info' but got nothing. Is the account: ${accountCache.account} already open?`);
  }

  const link = await getOpenLink(accountCache.account);
  const representative = config.defaultRepresentative;
  const balanceRaw: bigint = await getOpenBlockBalance(accountCache.account, link);
  const block = generateBananoReceiveBlock(accountCache.account, balanceRaw, link, representative, previous);

  // Generate work and signature for open block.
  const workPromise: Promise<string> = generateWork(accountCache.publicKey);
  const signPromise: Promise<string> = generateSignature(accountCache.privateKey, block);
  block.signature = await signPromise;
  block.work      = await workPromise;

  const openBlockHash = await processBlock(block, "open", "open");
  accountCache.updateInfo(openBlockHash, block.balance, "ready");

  return openBlockHash;
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
