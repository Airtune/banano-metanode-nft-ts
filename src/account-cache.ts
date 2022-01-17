import { parseSupplyRepresentative } from "./block-parsers/supply";
import { getAccountInfo } from "./lib/get-account-info";
import { getBlock } from "./lib/get-block";
import { TAccountState } from "./types/account-state";
import { TAccount, TBlockHash } from "./types/banano";

// Caches the state of an account to avoid requesting the same data multiple times
export class AccountCache {
  private _account: TAccount;
  private _frontier: TBlockHash;
  private _balance: bigint;
  private _accountState: TAccountState;

  constructor(account: TAccount) {
    this._account = account
  }

  async updateInfoFromBananode() {
    const accountInfo = await getAccountInfo(this._account);
    const frontierBlock = await getBlock(this._account, accountInfo.frontier);
    this._frontier = accountInfo.frontier;
    this._balance = BigInt(accountInfo.balance);
    
    const representative = frontierBlock.representative as TAccount;
    const supplyInfo = parseSupplyRepresentative(representative);
    if (supplyInfo) {
      this._accountState = "supply_awaiting_mint";
    } else {
      this._accountState = "ready";
    }
  }

  updateInfo(frontier: TBlockHash, balance: bigint, accountState: TAccountState) {
    this._frontier = frontier;
    this._balance = balance;
    this._accountState = accountState;
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

  // Cached value (can be uninitialized)
  public get cachedBalance() {
    return this._balance;
  }

  // Cached value (can be uninitialized)
  public get cachedFrontier() {
    return this._frontier;
  }

  public get account() {
    return this._account;
  }

  public get accountState() {
    return this._accountState;
  }
}
