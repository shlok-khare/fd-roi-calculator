import type { CalcState, DerivedResults, Scenario, Cycle } from '../types';

/** Annualised yield from YES Bank FD table w.e.f. 5th March 2026, by tenure */
export const FD_RATES: Record<number, number> = {
  1: 0.0682, // 12 months → 6.82% annualised yield
  2: 0.0719, // 24 months to <35 months → 7.19%
  3: 0.0719, // 36 months to <60 months → 7.19%
  5: 0.0692, // 60 months → 6.92%
};
export const LIMIT_RATIO = 0.9;

export const SCENARIOS: Record<string, Scenario> = {
  A: {
    id: 'A',
    label: 'SaaS & Marketing heavy',
    sub: 'Ads, cloud, software tools',
    cashback: 0.01,
    annualizedLabel: '12%',
  },
  B: {
    id: 'B',
    label: 'Mixed with govt portals',
    sub: 'GST, utilities, statutory + other',
    cashback: 0.004,
    annualizedLabel: '5%',
  },
};

export const CYCLES: Record<string, Cycle> = {
  d45: { id: 'd45', days: 45, rotations: 8, label: '45-day cycle', sub: 'Limit rotates ~8×/yr' },
  d30: { id: 'd30', days: 30, rotations: 12, label: '30-day cycle', sub: 'Limit rotates ~12×/yr' },
};

export function formatINR(n: number, opts: { decimals?: number; compact?: boolean } = {}): string {
  const { decimals = 0, compact = false } = opts;
  if (!isFinite(n)) return '—';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (compact) {
    if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(abs >= 1e8 ? 0 : 2).replace(/\.00$/, '')} Cr`;
    if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(abs >= 1e6 ? 0 : 2).replace(/\.00$/, '')} L`;
    if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(0)}K`;
    return `${sign}₹${abs.toFixed(0)}`;
  }
  const fixed = abs.toFixed(decimals);
  const [whole, frac] = fixed.split('.');
  let out: string;
  if (whole.length <= 3) {
    out = whole;
  } else {
    const last3 = whole.slice(-3);
    const rest = whole.slice(0, -3);
    const restGrouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    out = `${restGrouped},${last3}`;
  }
  return `${sign}₹${out}${frac ? '.' + frac : ''}`;
}

export function formatPct(n: number, decimals = 1): string {
  if (!isFinite(n)) return '—';
  return `${n.toFixed(decimals)}%`;
}

export function computeReturns(state: CalcState): DerivedResults {
  const scen = SCENARIOS[state.scenarioId];
  const cycle = CYCLES[state.cycleId];
  const fdRate = FD_RATES[state.years] ?? FD_RATES[1];
  const cardLimit = state.fdAmount * LIMIT_RATIO;
  const annualSpend = state.monthlySpend * 12;
  const annualCashback = annualSpend * scen.cashback;
  const annualFDInterest = state.fdAmount * fdRate;
  const annualTotal = annualFDInterest + annualCashback;
  const ror = state.fdAmount > 0 ? (annualTotal / state.fdAmount) * 100 : 0;
  const fdRor = fdRate * 100;
  const cashbackRor = state.fdAmount > 0 ? (annualCashback / state.fdAmount) * 100 : 0;

  const projection = [];
  let fdBalance = state.fdAmount;
  let cumulativeFD = 0;
  let cumulativeCB = 0;
  for (let y = 1; y <= 5; y++) {
    // Each year uses the rate locked in for the chosen tenure
    const yearRate = FD_RATES[state.years] ?? FD_RATES[1];
    const fdInt = fdBalance * yearRate;
    fdBalance += fdInt;
    cumulativeFD += fdInt;
    cumulativeCB += annualCashback;
    projection.push({
      year: y,
      fdInterest: fdInt,
      cashback: annualCashback,
      total: fdInt + annualCashback,
      cumulative: cumulativeFD + cumulativeCB,
    });
  }

  const horizon = projection[Math.min(state.years, 5) - 1] || projection[0];

  return {
    scenario: scen,
    cycle,
    cardLimit,
    annualSpend,
    annualCashback,
    annualFDInterest,
    annualTotal,
    ror,
    fdRor,
    cashbackRor,
    projection,
    horizon,
  };
}

export function buildSignupUrl(state: CalcState): string {
  const base = 'https://x.razorpay.com/auth/signup/';
  const params = new URLSearchParams({
    intent: 'corporate_cards',
    utm_source: 'roi_calculator',
    utm_medium: 'embed',
    utm_campaign: 'fd_backed_card',
    fd_amount: String(state.fdAmount),
    monthly_spend: String(state.monthlySpend),
    scenario: state.scenarioId,
  });
  return `${base}?${params.toString()}`;
}
