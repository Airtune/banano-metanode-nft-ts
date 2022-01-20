import { ADDRESS_PATTERN } from '../constants';

export const validateBananoReceiveBlockFormat = (block: any) => {
  if (typeof block.previous !== 'string') {
    throw Error(`BlockFormatError: Unexpected type for previous. Expected string, got: ${typeof block.previous}`);
  }
  if (typeof block.account !== "string") {
    throw Error(`BlockFormatError: Unexpected type for account. Expected string, got: ${typeof block.accountToIpfsCidV0}`);
  }

  if (!block.account.match(ADDRESS_PATTERN)) {
    throw Error(`BlockFormatError: Unexpected format for account: ${block.account}`);
  }

  if (typeof block.link !== "string") {
    throw Error(`BlockFormatError: Unexpected type for link. Expected string, got: ${typeof block.link}`);
  }
};
