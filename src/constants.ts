export const metaNodeVersion = '0.0.0';
export const metaProtocolVersion = '0.1.0';

export const blockHashPattern = /^[0-9A-F]{64}$/i;
export const addressPattern = /^ban_.+$/i
// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/nft_supply_block.md
export const nftSupplyHexPattern = /^51BACEED6078000000(?<major>[0-9A-F]{10})(?<minor>[0-9A-F]{10})(?<patch>[0-9A-F]{10})(?<maxSupply>[0-9A-F]{16})$'/i;

// Used following an NFT supply block in place of the first mint block.
export const cancelRepresentative = 'ban_1nftsupp1ycance1111oops1111that1111was1111my1111bad1hq5sjhey';
