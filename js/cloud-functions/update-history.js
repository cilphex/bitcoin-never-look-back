async function updateHistory() {
  const res = await fetch('https://api.pro.coinbase.com/products/BTC-USD/stats');
  const data = await res.json();

  console.log('got data', data);
}

// exports = {
//   updateHistory,
// };

window.updateHistory = updateHistory;