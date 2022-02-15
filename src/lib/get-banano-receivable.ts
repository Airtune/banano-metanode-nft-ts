import { bananode } from "../bananode";
import { getBananodeVersion } from "./get-bananode-version";

export const getBananoReceivable = async (account: string): Promise<string[]> => {
  const { major } = await getBananodeVersion();
                                  // Unlike Nano, Banano V23.0 doesn't use receivable yet >:[
  const requestAction = "pending";//(major >= 23 ? "receivable" : "pending");

  const response = await bananode.jsonRequest({
    action: requestAction,
    account: account
  });
  if (typeof response !== 'object') {
    throw Error(`BananoNodeRPCError: Unexpected response for action '${requestAction}', got: ${response}`);
  }
  if (response["error"]) {
    throw Error(`BananoNodeRPCError: Got response with error: ${response["error"]}`);
  }

  const sendBlockHashes = response["blocks"];
  if (!sendBlockHashes) {
    throw Error(`BananoNodeRPCError: Expected blocks in response. Got: ${sendBlockHashes}`);
  }
  if (sendBlockHashes == "") {
    return [];
  }

  return sendBlockHashes;
};
