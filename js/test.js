class Test {
  constructor() {
    this.testAPI();
  }

  async testAPI() {
    fetch('https://api.pro.coinbase.com/products/BTC-USD/candles?start=2020-11-01&end=2020-11-02&granularity=86400')
      .then(res => res.json())
      .then(res => {
        console.log('got res', res);
      });
  }
}

new Test();
