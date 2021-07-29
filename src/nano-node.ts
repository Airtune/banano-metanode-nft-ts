export class NanoNode {
  private nodeApiUrl: string;
  private _fetch: Function;

  constructor(nodeApiUrl: string, _fetch: Function) {
    this.nodeApiUrl = nodeApiUrl;
    this._fetch = _fetch;
  }

  async getHistoryAfterHead(account: string, head: string): Promise<any> {
    const request = {
      action: 'account_history',
      account: account,
      head: head,
      count: -1,
      offset: "1",
      reverse: "true",
      raw: true
    };
    const response = await this.jsonRequest(request);
    this.validateIsAccountHistory(response);
    this.validateAccount(account, response);

    return response;
  }

  async getAccountInfo(account): Promise<any> {
    const request = {
      action: 'account_info',
      account: account
    };

    const response = await this.jsonRequest(request);
    this.validateIsAccountInfo(response);

    return response;
  }

  hasMoreHistory(history: any, confirmationHeight: BigInt): boolean {
    return !this.historyIsEmpty(history) && this.historyFrontierIsBehind(history, confirmationHeight);
  }

  historyIsEmpty(history: any): boolean {
    return history.length === 0 || history.length === undefined;
  }

  /////////////
  // private //
  /////////////

  private async jsonRequest(jsonRequest: any): Promise<any> {
    const request = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(jsonRequest)
    };
  
    const response = await this._fetch(this.nodeApiUrl, request);
    const jsonResponse = await response.json();
  
    return jsonResponse;
  }

  private validateIsAccountHistory(accountHistory) {
    if (typeof(accountHistory) !== 'object') {
      throw Error(`UnexpectedNanoNodeResponse: Unexpected accountHistory. Expected type to be 'object', got: ${typeof(accountHistory)}`);
    }

    if (accountHistory.hasOwnProperty('error')) {
      throw Error(`NanoNodeError: ${accountHistory['error']}`);
    }

    if (typeof(accountHistory['account']) !== 'string') {
      throw Error(`UnexpectedNanoNodeResponse: Unexpected accountHistory['account']. Expected type to be 'string', got: ${typeof(accountHistory['account'])}`);
    }

    if (!accountHistory.hasOwnProperty('history')) {
      throw Error("UnexpectedNanoNodeResponse: accountHistory doesn't have property 'history'");
    }

    const _prototype: string = Object.prototype.toString.call(accountHistory['history']);
    if (!(_prototype === '[object String]' || _prototype === '[object Array]')) {
      throw Error(`UnexpectedNanoNodeResponse: accountHistory['history'] not of type object or string. Got: ${_prototype}`);
    }
  }

  private validateIsAccountInfo(accountInfo) {
    if (typeof(accountInfo) !== 'object') {
      throw Error(`UnexpectedNanoNodeResponse: Unexpected accountInfo. Expected type to be 'object', got: ${typeof(accountInfo)}`);
    }

    if (accountInfo.hasOwnProperty('error')) {
      throw Error(`NanoNodeError: ${accountInfo['error']}`);
    }

    if (typeof(accountInfo['confirmation_height']) !== 'string') {
      throw Error(`UnexpectedNanoNodeResponse: Unexpected accountInfo['confirmation_height']. Expected type to be 'string', got: ${typeof(accountInfo['confirmation_height'])}`);
    }
  }

  private validateAccount(account: string, accountHistory) {
    // Warning: Nano node returns history for templatePrevious block ignoring if there's an issuer account mismatch.
    if (account !== accountHistory['account']) {
      throw Error(`AccountMismatch: requested info for account '${account}' but head was for account '${accountHistory['account']}'`);
    }
  };

  private historyFrontierIsBehind(history: any, confirmationHeight: BigInt): boolean {
    const historyLastBlock = history[history.length - 1];
    const historyHeight: BigInt = BigInt('' + historyLastBlock['height']);

    return historyHeight > BigInt('0') && historyHeight < confirmationHeight
  }
}
