import { validateBananoReceiveBlockFormat } from '../block-validators/banano-receive';
import { IBananoReceive } from '../interfaces/banano-receive';
import { TAccount, TBlockHash } from '../types/banano';

// Generates Banano receive block without work, and signature
export const generateBananoReceiveBlock = (account: TAccount, balance: bigint, link: TBlockHash, representative: TAccount, previous: TBlockHash): IBananoReceive => {
  const block: IBananoReceive = {
    "type": "state",
    "account": account,
    "previous": previous,
    "representative": representative,
    "balance": balance,
    "link": link
  };

  validateBananoReceiveBlockFormat(block);

  return block;
};
