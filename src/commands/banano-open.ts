// interfaces
import { IBananoProcessResponse } from "../interfaces/banano-process-response";

// src
import { config } from "../config";
import { bananode } from "../bananode";
import { generateBananoReceiveBlock } from "../block-generators/banano-receive";
import { safeGetAccountInfo } from "../lib/get-account-info";
import { getBananoReceivable } from "../lib/get-banano-receivable";
import { getBlockInfo } from "../lib/get-block-info";
import { AccountState } from "../account-state";
import { TAccount, TBlockHash, TPublicKey } from "../types/banano";
import { getPublicKey } from "../lib/get-public-key";
import { getBananoAccount } from "../lib/get-banano-account";

export const bananoOpen = async (accountState: AccountState, privateKey: string): Promise<TBlockHash> => {
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
  const openBlock = await generateBananoReceiveBlock(account, balance, link, representative, previous);
  
  let openBlockRequest: any = Object.assign({}, openBlock);
  openBlockRequest.balance = openBlockRequest.balance.toString(10);

  const response: IBananoProcessResponse = await bananode.jsonRequest({
    "action": "process",
    "json_block": "true",
    "subtype": "open",
    "block": openBlockRequest
  });

  if (response.error) {
    throw Error(`BananodeRPCError: Process open account returned error: ${response.error}`);
  }

  return response.hash;
};

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
