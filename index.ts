import { getBlock } from './src/lib/get-block';
import { SupplyBlocksCrawler } from './src/supply-blocks-crawler';
import { MintBlocksCrawler } from './src/mint-blocks-crawler';
import { AssetCrawler } from './src/asset-crawler';
import { bananode } from './src/bananode';
import { TAccount, TBlockHash } from './src/types/banano';
import { INanoBlock } from 'nano-account-crawler/dist/nano-interfaces';
import { IAssetBlock } from './src/interfaces/asset-block';
import { bananoIpfs } from './src/lib/banano-ipfs';
import { parseSupplyRepresentative } from "./src/block-parsers/supply";


const express = require('express');
const app = express();
const port = 1919;

app.get('/supply_blocks', async (req, res) => {
  try {
    const issuer: TAccount = req.query['issuer'] as TAccount;

    const supplyBlocksCrawler = new SupplyBlocksCrawler(bananode, issuer);
    await supplyBlocksCrawler.crawl();

    let supplyBlocksResponse = [];

    for (let i = 0; i < supplyBlocksCrawler.supplyBlocks.length; i++) {
      const supplyBlock: INanoBlock          = supplyBlocksCrawler.supplyBlocks[i];
      const metadataRepresentative: TAccount = supplyBlocksCrawler.metadataRepresentatives[i];

      const supplyRepresentative: TAccount = supplyBlock.representative as TAccount;
      const { version, maxSupply } = parseSupplyRepresentative(supplyRepresentative);
      const ipfsCid = bananoIpfs.accountToIpfsCidV0(metadataRepresentative);

      supplyBlocksResponse.push({
        supply_block_hash: supplyBlock.hash,
        supply_block_height: supplyBlock.height,
        metadata_representative: metadataRepresentative,
        ipfs_cid: ipfsCid,
        max_supply: maxSupply.toString(),
        version: version
      })
    }

    const reponse: string = JSON.stringify({
      issuer: issuer,
      supply_blocks: supplyBlocksResponse
    });

    res.send(reponse);
  } catch(error) {
    res.send(JSON.stringify({
      status: 'error',
      error: error.toString()
    }));
  }
  console.log('\n');
});

app.get('/mint_blocks', async (req, res) => {
  try {
    const issuer: TAccount = req.query['issuer'] as TAccount;
    const supplyBlockHash: TBlockHash = req.query['supply_block_hash'] as TBlockHash;

    console.log(`/supply_blocks\nissuer: ${issuer}\n`);
    const mintBlocksCrawler = new MintBlocksCrawler(bananode, issuer, supplyBlockHash)
    await mintBlocksCrawler.crawl();

    let mints = [];

    for (let i = 0; i < mintBlocksCrawler.mintBlocks.length; i++) {
      const mintBlock: INanoBlock = mintBlocksCrawler.mintBlocks[i];
      mints.push({
        mint_number: (i+1).toString(),
        mint_block_hash: mintBlock.hash
      })
    }

    const reponse: string = JSON.stringify({

      mints: mints
    });

    res.send(reponse);
  } catch(error) {
    res.send(JSON.stringify({
      status: 'error',
      error: error.toString()
    }));
  }
  console.log('\n');
});

app.get('/get_asset_frontier', async (req, res) => {
  try {
    // TODO: validate params
    const issuer: TAccount = req.query['issuer'] as TAccount;
    const mintBlockHash: TBlockHash = req.query['mint_block_hash'] as TBlockHash;

    console.log(`/get_asset_frontier\nissuer: ${issuer}\nmint_block_hash: ${mintBlockHash}`);
    const mintBlock: INanoBlock = await getBlock(issuer, mintBlockHash);
    const assetCrawler = new AssetCrawler(bananode, issuer, mintBlock);
    await assetCrawler.crawl();
    const frontier: IAssetBlock = assetCrawler.frontier;

    const reponse: string = JSON.stringify({
      block_hash: frontier.nanoBlock.hash,
      account:    frontier.account,
      owner:      frontier.owner,
      locked:     frontier.locked,
      state:      frontier.state,
      type:       frontier.type
    });

    res.send(reponse);
  } catch(error) {
    res.send(JSON.stringify({
      status: 'error',
      error: error.toString()
    }));
  }
  console.log('\n');
});

app.get('/get_asset_at_height', async (req, res) => {
  try {
    // TODO: validate params
    const issuer: TAccount          = req.query['issuer'] as TAccount;
    const mintBlockHash: TBlockHash = req.query['mint_block_hash'] as TBlockHash;
    const height: number            = parseInt(req.query['height']);

    console.log(`/get_asset_at_height\nissuer: ${issuer}\nmint_block_hash: ${mintBlockHash}\nheight: ${height}`);
    const mintBlock: INanoBlock = await getBlock(issuer, mintBlockHash);
    const assetCrawler = new AssetCrawler(bananode, issuer, mintBlock);
    await assetCrawler.crawl();
    const assetBlock: IAssetBlock = assetCrawler.assetChain[height];

    const reponse: string = JSON.stringify({
      block_hash: assetBlock.nanoBlock.hash,
      account:    assetBlock.account,
      owner:      assetBlock.owner,
      locked:     assetBlock.locked,
      state:      assetBlock.state,
      type:       assetBlock.type
    });

    res.send(reponse);
  } catch(error) {
    res.send(JSON.stringify({
      status: 'error',
      error: error.toString()
    }));
  }
  console.log('\n');
});

app.get('/get_asset_chain', async (req, res) => {
  try {
    // TODO: validate params
    const issuer: TAccount          = req.query['issuer'] as TAccount;
    const mintBlockHash: TBlockHash = req.query['mint_block_hash'] as TBlockHash;

    console.log(`/get_asset_chain\nissuer: ${issuer}\nmint_block_hash: ${mintBlockHash}`);
    const mintBlock: INanoBlock = await getBlock(issuer, mintBlockHash);
    const assetCrawler = new AssetCrawler(bananode, issuer, mintBlock);
    await assetCrawler.crawl();

    const assetChain = assetCrawler.assetChain.map((assetBlock: IAssetBlock) => {
      return {
        account: assetBlock.account,
        owner: assetBlock.owner,
        locked: assetBlock.locked,
        block_hash: assetBlock.nanoBlock.hash,
        state:      assetBlock.state,
        type:       assetBlock.type
      };
    });

    const reponse: string = JSON.stringify({
      asset_chain: assetChain
    });

    res.send(reponse);
  } catch(error) {
    res.send(JSON.stringify({
      status: 'error',
      error: error.toString()
    }));
  }
  console.log('\n');
});

app.listen(port, () => {
  console.log(`Banano Meta Node listening at port ${port}`);
});

