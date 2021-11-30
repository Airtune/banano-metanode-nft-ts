import { bananode } from '../bananode';

export const getAccountInfo = async (account: string) => {
  return bananode.getAccountInfo(account);
}
