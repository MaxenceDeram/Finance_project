export function calculatePercentChange(current: number, previous: number) {
  if (!Number.isFinite(previous) || previous === 0) {
    return 0;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function calculateWeight(value: number, total: number) {
  if (!Number.isFinite(total) || total <= 0) {
    return 0;
  }
  return (value / total) * 100;
}

export function calculateDrawdown(values: number[]) {
  let peak = values[0] ?? 0;
  let maxDrawdown = 0;

  for (const value of values) {
    peak = Math.max(peak, value);
    if (peak > 0) {
      maxDrawdown = Math.min(maxDrawdown, ((value - peak) / peak) * 100);
    }
  }

  return Math.abs(maxDrawdown);
}
