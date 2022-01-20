import { parseSupplyRepresentative } from "./block-parsers/supply";
import { getAccountInfo } from "./lib/get-account-info";
import { getBananoAccount } from "./lib/get-banano-account";
import { getBlock } from "./lib/get-block";
import { getPublicKey } from "./lib/get-public-key";
import { TAccountState } from "./types/account-state";
import { TAccount, TBlockHash, TPrivateKey, TPublicKey } from "./types/banano";

// Caches the state of an account to avoid requesting the same data multiple times
export class AccountCache {
  private _account: TAccount;
  private _frontier: TBlockHash;
  private _balance: bigint;
  private _accountState: TAccountState;
  private _privateKey: TPrivateKey;
  private _publicKey: TPublicKey;
  private _representative: TAccount;

  constructor(privateKey: TBlockHash, publicKey: TPublicKey, account: TAccount) {
    this._privateKey = privateKey;
    this._publicKey = publicKey;
    this._account = account;
  }

  async updateInfoFromBananode() {
    const accountInfo = await getAccountInfo(this._account);
    const frontierBlock = await getBlock(this._account, accountInfo.frontier);
    this._frontier = accountInfo.frontier;
    this._balance = BigInt(accountInfo.balance);
    
    this._representative = frontierBlock.representative as TAccount;

    const supplyInfo = parseSupplyRepresentative(this._representative);
    if (supplyInfo) {
      this._accountState = "supply_awaiting_mint";
    } else {
      this._accountState = "ready";
    }
  }

  updateInfo(frontier: TBlockHash, balance: bigint, accountState: TAccountState, representative: TAccount) {
    this._frontier = frontier;
    this._balance = balance;
    this._accountState = accountState;
    this._representative = representative;
  }

  // Lazy updateInfoFromBananode
  public async getBalance() {
    if (!this._balance) { await this.updateInfoFromBananode(); }
    return this._balance;
  }

  // Lazy updateInfoFromBananode
  public async getFrontier() {
    if (!this._balance) { await this.updateInfoFromBananode(); }
    return this._frontier;
  }

  // Lazy updateInfoFromBananode
  public async getRepresentative() {
    if (!this._representative) { await this.updateInfoFromBananode(); }
    return this._representative;
  }

  // Cached value (can be uninitialized)
  public get cachedBalance() {
    return this._balance;
  }

  // Cached value (can be uninitialized)
  public get cachedFrontier() {
    return this._frontier;
  }

  public get privateKey() {
    return this._privateKey;
  }

  public get publicKey() {
    return this._publicKey;
  }

  public get account() {
    return this._account;
  }

  public get accountState() {
    return this._accountState;
  }
}
