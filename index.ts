import { getBlock } from './src/lib/get-block';
import { AssetCrawler } from './src/asset-crawler';
import { bananode } from './src/bananode';
import { TAccount, TBlockHash } from './src/types/banano';
import { INanoBlock } from 'nano-account-crawler/dist/nano-interfaces';
import { IAssetBlock } from './src/interfaces/asset-block';

const express = require('express');
const app = express();
const port = 1919;

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
      locked:     frontier.locked
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
    const frontier: IAssetBlock = assetCrawler.assetChain[height];

    const reponse: string = JSON.stringify({
      block_hash: frontier.nanoBlock.hash,
      account:    frontier.account,
      owner:      frontier.owner,
      locked:     frontier.locked
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
        block_hash: assetBlock.nanoBlock.hash
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

