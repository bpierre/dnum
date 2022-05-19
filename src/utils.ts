export function divideAndRound(dividend: bigint, divisor: bigint) {
  const invertSign = dividend < 0n ? -1n : 1n;
  return (dividend * invertSign + divisor / 2n) / divisor * invertSign;
}

export function splitNumber(number: string) {
  let [whole, fraction = "0"] = number.split(".");
  if (whole === "") {
    whole = "0";
  }

  // trim trailing zeros
  fraction = fraction.replace(/(?!^)0*$/, "");

  return [whole, fraction];
}
