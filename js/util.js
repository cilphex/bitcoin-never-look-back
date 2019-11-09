const moneyFormat = (num) => {
  const formatted = Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${formatted}`
}

export {
  moneyFormat
}
