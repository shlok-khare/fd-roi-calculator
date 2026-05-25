import { Box, Text } from '@razorpay/blade/components';
import type { CalcState } from '../types';
import { SCENARIOS, CYCLES, LIMIT_RATIO, formatINR } from '../utils/calculator';
import { track } from '../utils/tracking';
import { NumberSlider } from './NumberSlider';

interface CalcInputPanelProps {
  state: CalcState;
  set: (patch: Partial<CalcState>) => void;
}

interface SegmentedOption {
  value: string;
  label: string;
  sub?: string;
}

function Segmented({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SegmentedOption[];
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={{ display: 'flex', gap: 4, padding: 4, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              border: selected ? '1px solid #e2e8f0' : '1px solid transparent',
              borderRadius: 6,
              padding: '10px 12px',
              cursor: 'pointer',
              background: selected ? 'white' : 'transparent',
              boxShadow: selected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              textAlign: 'center',
              transition: 'background 120ms ease',
            }}
          >
            <Text
              size="small"
              weight={selected ? 'semibold' : 'medium'}
              color={selected ? 'surface.text.gray.normal' : 'surface.text.gray.subtle'}
            >
              {opt.label}
            </Text>
            {opt.sub && (
              <Text size="xsmall" color="surface.text.gray.muted">
                {opt.sub}
              </Text>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function CalcInputPanel({ state, set }: CalcInputPanelProps) {
  const { fdAmount, monthlySpend, scenarioId, cycleId, years } = state;
  const cardLimit = fdAmount * LIMIT_RATIO;
  const maxSpend = Math.max(50000, Math.round(fdAmount / 50000) * 50000);

  return (
    <Box
      as="section"
      aria-label="Calculator inputs"
      backgroundColor="surface.background.gray.intense"
      borderWidth="thin"
      borderColor="surface.border.gray.muted"
      borderRadius="large"
      padding="spacing.7"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      gap="spacing.5"
      height="100%"
    >
      <Box display="flex" flexDirection="column" gap="spacing.1">
        <Text size="xsmall" weight="semibold" color="surface.text.gray.muted">
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your numbers</span>
        </Text>
        <span className="panel-heading" style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
          Tell us about your spend
        </span>
      </Box>

      <NumberSlider
        label="FD amount"
        hint="Lien-marked with the issuing bank"
        value={fdAmount}
        min={500000}
        max={20000000}
        step={50000}
        format={(v) => formatINR(v, { compact: true })}
        onChange={(v) => set({ fdAmount: v })}
        onChangeEnd={(v) => track.fdAmountChanged(v)}
        meta={<>Card limit <strong>{formatINR(cardLimit, { compact: true })}</strong> · 90% of FD</>}
      />

      <NumberSlider
        label="Monthly spend"
        hint="Run-rate across the card"
        value={monthlySpend}
        min={50000}
        max={maxSpend}
        step={25000}
        format={(v) => formatINR(v, { compact: true })}
        onChange={(v) => set({ monthlySpend: v })}
        onChangeEnd={(v) => track.monthlySpendChanged(v)}
        accentColor="#6366f1"
        meta={<>Annualized <strong>{formatINR(monthlySpend * 12, { compact: true })}</strong></>}
      />

      <Box display="flex" flexDirection="column" gap="spacing.3">
        <Text size="medium" weight="medium" color="surface.text.gray.subtle">
          Spend profile
        </Text>
        <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.values(SCENARIOS).map((s) => {
            const selected = s.id === scenarioId;
            return (
              <button
                key={s.id}
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  set({ scenarioId: s.id });
                  track.scenarioSelected(s.id);
                }}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: selected ? '#eff6ff' : 'white',
                  border: `1px solid ${selected ? '#3b82f6' : '#e2e8f0'}`,
                  boxShadow: selected ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
                  transition: 'background 120ms, border-color 120ms, box-shadow 120ms',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: `2px solid ${selected ? '#3b82f6' : '#cbd5e1'}`,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {selected && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                  )}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Text size="small" weight="semibold" color="surface.text.gray.normal">
                    Scenario {s.id} · {s.label}
                  </Text>
                  <Text size="xsmall" color="surface.text.gray.muted">{s.sub}</Text>
                </span>
                <span style={{ fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: selected ? '#2563eb' : '#64748b' }}>
                  {(s.cashback * 100).toFixed(1).replace(/\.0$/, '')}%
                </span>
              </button>
            );
          })}
        </div>
      </Box>

      <Box display="flex" flexDirection="column" gap="spacing.2">
        <Text size="medium" weight="medium" color="surface.text.gray.subtle">Credit cycle</Text>
        <Segmented
          ariaLabel="Credit cycle"
          value={cycleId}
          onChange={(v) => {
            set({ cycleId: v as CalcState['cycleId'] });
            track.cycleSelected(v);
          }}
          options={[
            { value: 'd45', label: CYCLES.d45.label, sub: CYCLES.d45.sub },
            { value: 'd30', label: CYCLES.d30.label, sub: CYCLES.d30.sub },
          ]}
        />
      </Box>

      <Box display="flex" flexDirection="column" gap="spacing.2">
        <Text size="medium" weight="medium" color="surface.text.gray.subtle">Time horizon</Text>
        <Segmented
          ariaLabel="Time horizon"
          value={String(years)}
          onChange={(v) => {
            set({ years: parseInt(v) as CalcState['years'] });
            track.horizonSelected(parseInt(v));
          }}
          options={[
            { value: '1', label: '1 yr' },
            { value: '2', label: '2 yrs' },
            { value: '3', label: '3 yrs' },
            { value: '5', label: '5 yrs' },
          ]}
        />
      </Box>
    </Box>
  );
}
