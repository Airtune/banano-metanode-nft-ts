import { bananode } from '../bananode';

export const getAccountInfo = async (account: string) => {
  return bananode.getAccountInfo(account);
}

export const safeGetAccountInfo = async (account: string) => {
  try {
    return await bananode.getAccountInfo(account);
  } catch (error) {
    return undefined;
  }
}
