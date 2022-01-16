// Caches the state of an account to avoid requesting the same data multiple times
export class AccountState {
  private _frontier: string;
  private _balance: bigint;

  public get balance() {
    return this._balance;
  }
}
