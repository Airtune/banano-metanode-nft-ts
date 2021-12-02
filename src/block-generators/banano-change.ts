import * as bananojs from '@bananocoin/bananojs';

// generate a change block without hash, work or signature
export const generateBananoChangeBlock = async (account: string, representative: string, previous: string, balance: string) => {
  const changeBlock = {
    "type": "state",
    "account": account,
    "previous": previous,
    "representative": representative,
    "balance": balance,
    "link": "0000000000000000000000000000000000000000000000000000000000000000"
  }
}

export const validateChangeBlock = async (block) => {

}
