import { IBananoBlock, ISignedBananoBlock } from "../interfaces/banano-block";
import { generateSignature } from "../lib/generate-signature";
import { TAccount, TBlockHash, TPrivateKey } from "../types/banano";
import { generateBananoChangeBlock } from "./banano-change";

// Generate abort blocks seen in the diagram:
// https://github.com/Airtune/73-meta-tokens/blob/main/diagrams/atomic-swap.png
// and described as change#abort_receive_atomic_swap and change#abort_payment in the spec:
// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/atomic_swap.md
// They are simply blocks that are invalid for the atomic swap.
export const generateAtomicSwapAbortBlocks = async (recipientPrivateKey: TPrivateKey, recipient: TAccount, recipientPrevious: TBlockHash, recipientBalanceRaw: bigint, sendRaw: bigint, atomicSwapReceiveBlockHash: TBlockHash, representative: TAccount): Promise<{ abortReceiveAtomicSwapBlock: ISignedBananoBlock, abortPaymentBlock: ISignedBananoBlock }> => {
  const abortReceiveAtomicSwapBlock: IBananoBlock = generateBananoChangeBlock(recipient, representative, recipientPrevious, recipientBalanceRaw);
  const abortPaymentBlock:           IBananoBlock = generateBananoChangeBlock(recipient, representative, atomicSwapReceiveBlockHash, recipientBalanceRaw + sendRaw);

  const abortReceiveSignaturePromise = generateSignature(recipientPrivateKey, abortReceiveAtomicSwapBlock);
  const abortPaymentSignaturePromise = generateSignature(recipientPrivateKey, abortPaymentBlock);

  abortReceiveAtomicSwapBlock.signature = await abortReceiveSignaturePromise;
  abortPaymentBlock.signature           = await abortPaymentSignaturePromise;

  return {
    abortReceiveAtomicSwapBlock: abortReceiveAtomicSwapBlock as ISignedBananoBlock,
    abortPaymentBlock: abortPaymentBlock as ISignedBananoBlock
  };
};
