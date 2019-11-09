const moneyFormat = (num) => {
  const formatted = num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
  return `$${formatted}`
}

export {
  moneyFormat
}
