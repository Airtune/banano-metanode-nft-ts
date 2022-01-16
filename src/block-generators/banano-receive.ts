import { validateBananoReceiveBlockFormat } from '../block-validators/banano-receive';
import { TAccount, TBlockHash } from '../types/banano';

// Generates Banano receive block without work, and signature
export const generateBananoReceiveBlock = async (account: TAccount, balance: bigint, link: TBlockHash, representative: string, previous: TBlockHash) => {
  const block = {
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
