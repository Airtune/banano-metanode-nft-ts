import { IBananoChange } from "../interfaces/banano-change"

// Validates if it's the correct data format without checking if it would be valid on-chain.
export const validateChangeBlockFormat = async (block: IBananoChange) => {
  if (block.link !== "0000000000000000000000000000000000000000000000000000000000000000") {
    throw Error(`ArgumentError: Unexpected link for change block. Got: ${typeof block.link}, expected: 0000000000000000000000000000000000000000000000000000000000000000`);
  }
}
