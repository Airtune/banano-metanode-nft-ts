import { INanoAccountHistory, INanoBlock } from "nano-account-crawler/dist/nano-interfaces";
import { bananode } from "../bananode";

export const getBlockInfo = async (hash: string): Promise<any> => {
  return await bananode.jsonRequest({
    action: "block_info",
    hash: hash
  });
};
