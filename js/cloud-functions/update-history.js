async function getCurrentData() {

}

async function getExchangeStats() {
  const res = await fetch('https://api.pro.coinbase.com/products/BTC-USD/stats');
  const data = await res.json();
  console.log('got data', data);
}

async function updateHistory() {
  let data;
  let file;

  await getCurrentData();
  await getExchangeStats();
}

export default {
  updateHistory,
};