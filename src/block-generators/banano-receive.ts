import { validateBananoReceiveBlockFormat } from '../block-validators/banano-receive';

// Generates Banano receive block without hash, work, and signature
export const generateBananoReceiveBlock = async (account: string, balance: bigint, link: string, representative: string, previous: string) => {
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
