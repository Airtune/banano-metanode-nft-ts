export function toFixedLengthPositiveHex(value: bigint, length: number): string {
  const hex = value.toString(16).padStart(length, "0");

  if (value < BigInt(0)) {
    throw Error(`HexError: Unexpected value. Expected 0 or above, got: ${value}`);
  }

  if (hex.length !== length) {
    throw Error(`HexError: Unexpected hex length. Expected ${length} characters, got: '${hex}'`);
  }

  return hex;
}