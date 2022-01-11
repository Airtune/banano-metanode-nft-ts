import { getAccountInfo } from "../lib/get-account-info";

export const fetchBananoFrontier = async (account) => {
  const accountInfo = await getAccountInfo(account);

  if (accountInfo == undefined) {
      throw Error("BananoRPCError: Can't retrieve account information.");
  }
  if (typeof accountInfo.error == "string") {
      throw Error(`BananoRPCError: Request 'account_info' received error from banano node: ${accountInfo.error}`);
  }

  const previous: string = accountInfo.frontier;
  return previous;
}
