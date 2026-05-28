export type AudioKey =
  | "first"
  | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
  | "muoi" | "lam" | "mot"
  | "tram" | "nghin" | "trieu" | "ty"
  | "dong";

function readTens(tens: number, units: number): AudioKey[] {
  if (tens === 0 && units === 0) return [];

  if (tens === 0) {
    return [String(units) as AudioKey];
  }

  if (tens === 1) {
    const files: AudioKey[] = ["10"];
    if (units === 5) files.push("lam");
    else if (units > 0) files.push(String(units) as AudioKey);
    return files;
  }

  const files: AudioKey[] = [String(tens) as AudioKey, "muoi"];
  if (units === 1) files.push("mot");
  else if (units === 5) files.push("lam");
  else if (units > 0) files.push(String(units) as AudioKey);
  return files;
}

function readThreeDigits(n: number, showLeadingZero: boolean): AudioKey[] {
  const files: AudioKey[] = [];
  const hundreds = Math.floor(n / 100);
  const tens = Math.floor((n % 100) / 10);
  const units = n % 10;

  if (hundreds > 0 || showLeadingZero) {
    files.push(String(hundreds) as AudioKey);
    files.push("tram");
  }

  files.push(...readTens(tens, units));
  return files;
}

export function moneyToFileSequence(amount: number): AudioKey[] {
  const files: AudioKey[] = ["first"];

  if (amount <= 0) {
    files.push("0", "dong");
    return files;
  }

  const ty = Math.floor(amount / 1_000_000_000);
  const afterTy = amount % 1_000_000_000;
  const trieu = Math.floor(afterTy / 1_000_000);
  const afterTrieu = afterTy % 1_000_000;
  const nghin = Math.floor(afterTrieu / 1_000);
  const donvi = afterTrieu % 1_000;

  if (ty > 0) {
    files.push(...readThreeDigits(ty, false));
    files.push("ty");
  }

  if (trieu > 0) {
    files.push(...readThreeDigits(trieu, ty > 0));
    files.push("trieu");
  }

  if (nghin > 0) {
    files.push(...readThreeDigits(nghin, trieu > 0 || ty > 0));
    files.push("nghin");
  }

  if (donvi > 0) {
    files.push(...readThreeDigits(donvi, nghin > 0 || trieu > 0 || ty > 0));
  }

  files.push("dong");
  return files;
}
