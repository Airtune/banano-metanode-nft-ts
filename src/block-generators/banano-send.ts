import * as bananojs from '@bananocoin/bananojs';
import { ADDRESS_PATTERN, PUBLIC_KEY_PATTERN } from '../constants';

export const generateBananoSendBlock = async (balance: bigint, representative: string, sender: string, recipient: string, previous: string = undefined, previousBalance: bigint = undefined) => {
  if (typeof previous !== 'string') {
    throw Error(`ArgumentError: Unexpected type for previous. Expected string, got: ${typeof previous}`);
  }

  if (typeof previousBalance !== "bigint") {
    throw Error(`ArgumentError: Unexpected type for previousBalance. Expected bigint, got: ${typeof previousBalance}`);
  }

  if (typeof sender !== "string") {
    throw Error(`ArgumentError: Unexpected type for sender. Expected string, got: ${typeof sender}`);
  }

  if (!sender.match(ADDRESS_PATTERN)) {
    throw Error(`ArgumentError: Unexpected format for sender: ${sender}`);
  }

  if (typeof recipient !== "string") {
    throw Error(`ArgumentError: Unexpected type for recipient. Expected string, got: ${typeof recipient}`);
  }

  let recipientPublicKey: string;

  if (recipient.match(ADDRESS_PATTERN)) {
    recipientPublicKey = bananojs.getAccountPublicKey(recipient);
  } else if (recipient.match(PUBLIC_KEY_PATTERN)) {
    recipientPublicKey = recipient;
  } else {
    throw Error(`ArgumentError: Unexpected format for recipient: ${recipient}`);
  }

  return {
    "type": "state",
    "account": sender,
    "previous": previous,
    "representative": representative,
    "balance": balance,
    "link": recipientPublicKey
  }
}
