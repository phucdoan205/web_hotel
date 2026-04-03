/**
 * Định dạng tiền tệ (Ví dụ: $45,200 hoặc 120.000 VND)
 */
export const formatCurrency = (value, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
};

/**
 * Định dạng phần trăm (Ví dụ: 78.5%)
 */
export const formatPercent = (value) => {
  return `${value}%`;
};

/**
 * Định dạng số lớn (Ví dụ: 1,200)
 */
export const formatNumber = (value) => {
  return new Intl.NumberFormat("en-US").format(value);
};
