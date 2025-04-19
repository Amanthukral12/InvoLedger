const a = [
  "",
  "one ",
  "two ",
  "three ",
  "four ",
  "five ",
  "six ",
  "seven ",
  "eight ",
  "nine ",
  "ten ",
  "eleven ",
  "twelve ",
  "thirteen ",
  "fourteen ",
  "fifteen ",
  "sixteen ",
  "seventeen ",
  "eighteen ",
  "nineteen ",
];
const b = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

export function inWords(num: number): string | undefined {
  let n;
  const numStr = num.toString();
  if (numStr.length > 9) return "overflow";
  // eslint-disable-next-line prefer-const
  n = ("000000000" + num)
    .substr(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  let str = "";
  str +=
    Number(n[1]) != 0
      ? (a[Number(n[1])] || b[Number(n[1][0])] + " " + a[Number(n[1][1])]) +
        "crore "
      : "";
  str +=
    Number(n[2]) != 0
      ? (a[Number(n[2])] || b[Number(n[2][0])] + " " + a[Number(n[2][1])]) +
        "lakh "
      : "";
  str +=
    Number(n[3]) != 0
      ? (a[Number(n[3])] || b[Number(n[3][0])] + " " + a[Number(n[3][1])]) +
        "thousand "
      : "";
  str +=
    Number(n[4]) != 0
      ? (a[Number(n[4])] || b[Number(n[4][0])] + " " + a[Number(n[4][1])]) +
        "hundred "
      : "";
  str +=
    Number(n[5]) != 0
      ? (str != "" ? "and " : "") +
        (a[Number(n[5])] || b[Number(n[5][0])] + " " + a[Number(n[5][1])]) +
        "only "
      : "";
  return str;
}
