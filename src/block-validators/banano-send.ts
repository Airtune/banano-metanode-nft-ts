import { ADDRESS_PATTERN, PUBLIC_KEY_PATTERN } from '../constants';
import { IBananoSend } from '../interfaces/banano-blocks';

// Validates if it's the correct data format without checking if it would be valid on-chain.
export const validateBananoSendBlockFormat = (block: IBananoSend) => {
  if (typeof block.previous !== 'string') {
    throw Error(`ArgumentError: Unexpected type for previous. Expected string, got: ${typeof block.previous}`);
  }

  if (typeof block.balance !== "bigint") {
    throw Error(`ArgumentError: Unexpected type for balance. Expected bigint, got: ${typeof block.balance}`);
  }

  if (typeof block.account !== "string") {
    throw Error(`ArgumentError: Unexpected type for account. Expected string, got: ${typeof block.account}`);
  }

  if (!block.account.match(ADDRESS_PATTERN)) {
    throw Error(`ArgumentError: Unexpected format for account: ${block.account}`);
  }

  if (typeof block.link !== "string") {
    throw Error(`ArgumentError: Unexpected type for link. Expected string, got: ${typeof block.link}`);
  }

  if (block.link === "0000000000000000000000000000000000000000000000000000000000000000") {
    throw Error(`ArgumentError: Unexpected type for link. Expected public key, got: ${typeof block.link}`);
  }

  if (!block.link.match(PUBLIC_KEY_PATTERN)) {
    throw Error(`ArgumentError: Unexpected type for link. Expected public key, got: ${typeof block.link}`);
  }
};
