function moneyFormat(num) {
  const formatted = Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${formatted}`
}

function updateAllText(selector, text) {
  const elements = document.querySelectorAll(selector)
  elements.forEach((el) => el.textContent = text)
}

function updateAllStyles(selector, styleProperty, styleValue) {
  const elements = document.querySelectorAll(selector)
  elements.forEach((el) => el.style[styleProperty] = styleValue)
}

export {
  moneyFormat,
  updateAllText,
  updateAllStyles
}
