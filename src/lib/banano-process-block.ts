import { TBlockSubtype } from "../types/banano";

export const bananoProcessBlock = async (bananodeApi, block, action: TBlockSubtype) => {
  const processResponse = await bananodeApi.process(block, action);
    return processResponse;
};
