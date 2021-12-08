export const META_NODE_VERSION = '0.0.0';

export const META_PROTOCOL_MAJOR = BigInt('0');
export const META_PROTOCOL_MINOR = BigInt('1');
export const META_PROTOCOL_PATCH = BigInt('0');
export const META_PROTOCOL_VERSION = `${META_PROTOCOL_MAJOR}.${META_PROTOCOL_MINOR}.${META_PROTOCOL_PATCH}`;
export const META_PROTOCOL_SUPPORTED_VERSIONS = ["0.1.0"];

// Settings
export const NODE_RPC_URL = 'https://kaliumapi.appditto.com/api'
export const MAX_RPC_ITERATIONS = 1_000; // Max number of node RPC calls allowed to trace one NFT in a single request
export const MAX_TRACE_LENGTH = BigInt(690_000); // Trace length is an arbitrary mix of block counts and RPC call counts.

// Patterns
export const HEX_PATTERN = /^[0-9A-F]+$/i;
export const BLOCK_HASH_PATTERN = /^[0-9A-F]{64}$/i;
export const PUBLIC_KEY_PATTERN = /^[0-9A-F]{64}$/i;
export const ADDRESS_PATTERN = /^ban_[13]{1}[13456789abcdefghijkmnopqrstuwxyz]{59}$/

// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/atomic_swap.md
export const ATOMIC_SWAP_HEADER = "23559C159E22C"; // must be 13 chars
export const ATOMIC_SWAP_HEX_PATTERN = RegExp(`^${ATOMIC_SWAP_HEADER}(?<assetHeight>[0-9A-F]{10})(?<receiveHeight>[0-9A-F]{10})(?<minRaw>[0-9A-F]{31})$`, "i");

// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/supply_block.md
export const SUPPLY_HEX_HEADER = "51BACEED6078000000"; // must be 18 char hex
export const SUPPLY_HEX_PATTERN = RegExp(`^${SUPPLY_HEX_HEADER}(?<major>[0-9A-F]{10})(?<minor>[0-9A-F]{10})(?<patch>[0-9A-F]{10})(?<maxSupply>[0-9A-F]{16})$`, "i");
export const FINISH_SUPPLY_HEADER = "3614865E0051BA0033BB581E"; // must be 24 char hex
export const FINISH_SUPPLY_HEX_PATTERN = RegExp(`^${FINISH_SUPPLY_HEADER}(?<supplyBlockHeight>[0-9A-F]{40})$`, "i");
// Representative used to cancel NFT supply block with a change block in place of the first mint block.
export const CANCEL_SUPPLY_REPRESENTATIVE = 'ban_1nftsupp1ycance1111oops1111that1111was1111my1111bad1hq5sjhey';

export const BURN_ACCOUNTS = [
  "ban_1burnbabyburndiscoinferno111111111111111111111111111aj49sw3w", // official burn account
  "ban_1uo1cano1bot1a1pha1616161616161616161616161616161616p3s5tifp", // banano walker burn account
  "ban_1ban116su1fur16uo1cano16su1fur16161616161616161616166a1sf7xw", // volcano burn account
  "ban_1111111111111111111111111111111111111111111111111111hifc8npp" // nano burn account
]


// Validators
if (typeof ATOMIC_SWAP_HEADER !== "string" || ATOMIC_SWAP_HEADER.length !== 13 || !ATOMIC_SWAP_HEADER.match(HEX_PATTERN)) {
  throw Error(`ATOMIC_SWAP_HEADER must be 13 char hex`);
}

if (typeof SUPPLY_HEX_HEADER !== "string" || SUPPLY_HEX_HEADER.length !== 18 || !SUPPLY_HEX_HEADER.match(HEX_PATTERN)) {
  throw Error(`SUPPLY_HEX_HEADER must be 18 char hex`);
}

if (typeof FINISH_SUPPLY_HEADER !== "string" || FINISH_SUPPLY_HEADER.length !== 24 || !FINISH_SUPPLY_HEADER.match(HEX_PATTERN)) {
  throw Error(`SUPPLY_HEX_HEADER must be 24 char hex`);
}

if (typeof CANCEL_SUPPLY_REPRESENTATIVE !== "string" || CANCEL_SUPPLY_REPRESENTATIVE.match(ADDRESS_PATTERN)) {
  throw Error(`CANCEL_SUPPLY_REPRESENTATIVE must be a valid Banano address`);
}

import * as bananojs from '@bananocoin/bananojs';
// throws error on invalid checksum
bananojs.getAccountPublicKey(CANCEL_SUPPLY_REPRESENTATIVE);
