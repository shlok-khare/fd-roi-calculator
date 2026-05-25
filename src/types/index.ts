export interface CalcState {
  fdAmount: number;
  monthlySpend: number;
  scenarioId: 'A' | 'B';
  cycleId: 'd45' | 'd30';
  years: 1 | 2 | 3 | 5;
}

export interface Scenario {
  id: 'A' | 'B';
  label: string;
  sub: string;
  cashback: number;
  annualizedLabel: string;
}

export interface Cycle {
  id: 'd45' | 'd30';
  days: number;
  rotations: number;
  label: string;
  sub: string;
}

export interface ProjectionRow {
  year: number;
  fdInterest: number;
  cashback: number;
  total: number;
  cumulative: number;
}

export interface DerivedResults {
  scenario: Scenario;
  cycle: Cycle;
  cardLimit: number;
  annualSpend: number;
  annualCashback: number;
  annualFDInterest: number;
  annualTotal: number;
  ror: number;
  fdRor: number;
  cashbackRor: number;
  projection: ProjectionRow[];
  horizon: ProjectionRow;
}
