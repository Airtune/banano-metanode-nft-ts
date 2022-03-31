import { INanoAccountInfo } from "nano-account-crawler/dist/nano-interfaces";
import { AccountCache } from "../account-cache";
import { AssetCrawler } from "../asset-crawler";
import { generateBananoSendBlock } from "../block-generators/banano-send";
import { generateSendAtomicSwapBlock } from "../block-generators/send-atomic-swap";
import { IAssetBlock } from "../interfaces/asset-block";
import { IAtomicSwapConditions } from "../interfaces/atomic-swap-conditions";
import { IBananoSend } from "../interfaces/banano-send";
import { generateSignature } from "../lib/generate-signature";
import { generateWork } from "../lib/generate-work";
import { getAccountInfo } from "../lib/get-account-info";
import { processBlock } from "../lib/process-block";
import { TAccount, TBlockHash } from "../types/banano";

// Create send#asset block and process it on the Banano network.
export const sendPaymentCmd = async (assetCrawler: AssetCrawler, accountCache: AccountCache, paymentAmount: bigint): Promise<TBlockHash> => {
  const previous: TBlockHash = await accountCache.getFrontier();
  const workPromise: Promise<string> = generateWork(previous);

  const payer: TAccount = accountCache.account;
  const representative: TAccount = await accountCache.getRepresentative();
  const seller: TAccount = assetCrawler.frontier.owner as TAccount; // TODO: verify this is a secure way to find seller
  const previousBalanceRaw: bigint = await accountCache.getBalance();

  // Find info about swap asset
  const assetFrontierBlock: IAssetBlock = assetCrawler.frontier;
  const assetHeight: bigint = BigInt(assetFrontierBlock.nanoBlock.height);
  const atomicSwapConditions: IAtomicSwapConditions = assetCrawler.currentAtomicSwapConditions();

  // guards
  if (accountCache.accountState === "supply_awaiting_mint") {
    // Not strictly neccassary but helps with avoiding dead supply blocks.
    throw Error("CmdError: Unexpected sendPaymentCmd. Following a supply block, make the first mint.");
  }
  if (assetCrawler.frontier.state !== "atomic_swap_payable") {
    throw Error(`CmdError: Unexpected state for assetCrawler. Expected "atomic_swap_payable", got: ${assetCrawler.frontier.state}`);
  }
  if (atomicSwapConditions === undefined) {
    // This shouldn't ever happen. If you see this error something is very wrong with the assetCrawler.
    throw Error(`CmdError: Unable to fetch atomicSwapConditions for payment after block: ${previous}`);
  }
  if (payer !== assetCrawler.frontier.nanoBlock.account) {
    throw Error(`CmdError: Expected paying account to match asset frontier block. Paying account: ${accountCache.account}. Frontier block: ${assetCrawler.frontier.nanoBlock.hash}`);
  }

  const block: IBananoSend = await generateBananoSendBlock(payer, seller, paymentAmount, previous, previousBalanceRaw, representative);

  block.signature = await generateSignature(accountCache.privateKey, block);
  block.work      = await workPromise;

  // TODO: Validate it locally first before processing on-chain
  const blockHash = await processBlock(block, "send", "send#payment");
  return blockHash;
};
