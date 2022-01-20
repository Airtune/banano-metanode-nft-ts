import { ISignedBananoBlock } from "../interfaces/banano-block";
import { generateWork } from "../lib/generate-work";
import { processBlock } from "../lib/process-block";
import { TAccount, TBlockHash } from "../types/banano";

/*
export const abortAtomicSwapCmd: TBlockHash = async (recipient: TAccount, receiveBlockHash: TBlockHash, abortReceiveAtomicSwap: IBananoBlock, abortPayment: IBananoBlock): Promise<TBlockHash> => {
  // TODO: Call abortReceiveAtomicSwapCmd or abortPaymentCmd depending on asset state.
  return abortBlockHash;
}
*/

export const abortReceiveAtomicSwapCmd = async (recipient: TAccount, abortReceiveAtomicSwapBlock: ISignedBananoBlock): Promise<TBlockHash> => {
  // TODO: Check if the abort block is necessary with the asset crawler 
  abortReceiveAtomicSwapBlock.work = await generateWork(abortReceiveAtomicSwapBlock.previous);
  const abortBlockHash = await processBlock(abortReceiveAtomicSwapBlock, "change", "change#abort_receive_atomic_swap");
  return abortBlockHash;
}

export const abortPaymentCmd = async (recipient: TAccount, abortPaymentBlock: ISignedBananoBlock): Promise<TBlockHash> => {
  // TODO: Check if the abort block is necessary with the asset crawler 
  abortPaymentBlock.work = await generateWork(abortPaymentBlock.previous);
  const abortBlockHash = await processBlock(abortPaymentBlock, "change", "change#abort_payment");
  return abortBlockHash;
}