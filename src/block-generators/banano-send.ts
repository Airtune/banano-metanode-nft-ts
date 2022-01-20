import { IBananoSend } from '../interfaces/banano-send';
import { validateBananoSendBlockFormat } from '../block-validators/banano-send';
import { TAccount, TBlockHash, TPublicKey } from '../types/banano';
import { getBananoAccountPublicKey } from '../lib/get-banano-account-public-key';

// Generates Banano send block without work, and signature
export const generateBananoSendBlock = (sender: TAccount, recipient: TAccount, amount: bigint, previous: TBlockHash, previousBalance: bigint, representative: TAccount): IBananoSend => {
  const link: TPublicKey = getBananoAccountPublicKey(recipient);
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
