export const roundCurrency = (amount: number) => {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};
