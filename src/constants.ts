export const META_NODE_VERSION = '0.0.0';
export const META_PROTOCOL_VERSION = '0.1.0';

export const BLOCK_HASH_PATTERN = /^[0-9A-F]{64}$/i;
export const ADDRESS_PATTERN = /^ban_.+$/i

// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/atomic_swap.md
export const ATOMIC_SWAP_HEX_PATTERN = /^23559C159E22C(?<assetHeight>[0-9A-F]{10})(?<receiveHeight>[0-9A-F]{10})(?<minRaw>[0-9A-F]{31})$/i
// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/supply_block.md
export const SUPPLY_HEX_PATTERN = /^51BACEED6078000000(?<major>[0-9A-F]{10})(?<minor>[0-9A-F]{10})(?<patch>[0-9A-F]{10})(?<maxSupply>[0-9A-F]{16})$'/i;
export const FINISH_SUPPLY_HEX_PATTERN = /^3614865E0051BA0033BB581E(?<supplyBlockHeight>[0-9A-F]{40})$'/i;

// Used following an NFT supply block in place of the first mint block.
export const CANCEL_SUPPLY_REPRESENTATIVE = 'ban_1nftsupp1ycance1111oops1111that1111was1111my1111bad1hq5sjhey';

export const MAX_NANO_BLOCK_TRACE_LENGTH = 10000;
