import { IBananoSend } from '../interfaces/banano-blocks';
import { getPublicKey } from '../lib/get-public-key';
import { validateBananoSendBlockFormat } from '../block-validators/banano-send';

// Generates Banano send block without hash, work, and signature
export const generateBananoSendBlock = (sender: string, recipient: string, amount: bigint, previous: string, previousBalance: bigint, representative: string): IBananoSend => {
  const link: string = getPublicKey(recipient);
  const balance: bigint = previousBalance - amount;
  const block: IBananoSend = {
    "type": "state",
    "account": sender,
    "previous": previous,
    "representative": representative,
    "balance": balance,
    "link": link
  };

  validateBananoSendBlockFormat(block);

  return block;
};
