import { useState } from 'react';
import { Box, Text, Button, Divider } from '@razorpay/blade/components';
import type { CalcState, DerivedResults, ProjectionRow } from '../types';
import { formatINR, formatPct, buildSignupUrl } from '../utils/calculator';
import { track } from '../utils/tracking';

interface CalcResultsPanelProps {
  state: CalcState;
  derived: DerivedResults;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Text size="xsmall" weight="semibold" color="surface.text.gray.muted">
      <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>{children}</span>
    </Text>
  );
}

function HeroMetric({ r, years }: { r: DerivedResults; fdAmount?: number; years: number }) {
  const horizonTotal = years === 1 ? r.annualTotal : r.horizon.cumulative;
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid rgba(67,75,81,0.1)',
      borderRadius: 16,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Quarter circle: center sits at the top-right corner; overflow:hidden clips it to a quarter */}
      <div aria-hidden style={{ position: 'absolute', right: -110, top: -110, width: 220, height: 220, borderRadius: '50%', background: '#eff6ff', pointerEvents: 'none' }} />
      {/* Scenario label at the centroid of the visible quarter (4R/3π ≈ 47px from each edge) */}
      <div style={{
        position: 'absolute',
        right: 47,
        top: 47,
        transform: 'translate(50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563eb', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
          Scenario {r.scenario.id}
        </span>
      </div>

      <Box display="flex" alignItems="center">
        <Eyebrow>{years === 1 ? 'Total return · Year 1' : `Total return · ${years} years`}</Eyebrow>
      </Box>

      <Box>
        <span className="display-num" style={{ fontSize: 'clamp(40px, 7vw, 72px)', lineHeight: 1, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#0f172a', display: 'block' }}>
          {formatINR(horizonTotal)}
        </span>

        <Box display="flex" flexWrap="wrap" gap="spacing.4" alignItems="center" marginTop="spacing.4">
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8, padding: '8px 14px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 9999 }}>
            <Text size="xsmall" weight="medium" color="feedback.text.positive.intense">
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>RoR</span>
            </Text>
            <span style={{ fontSize: 20, fontWeight: 600, color: '#166534', fontVariantNumeric: 'tabular-nums' }}>
              {formatPct(r.ror)}
            </span>
            <Text size="xsmall" color="feedback.text.positive.intense">per year</Text>
          </div>
          <Text size="xsmall" color="surface.text.gray.muted">
            = {formatPct(r.fdRor, 2)} FD interest + {formatPct(r.cashbackRor)} cashback
          </Text>
        </Box>
      </Box>
    </div>
  );
}

function ReturnCard({ tone, eyebrow, value, rate, formula, footnote }: {
  tone: 'positive' | 'information';
  eyebrow: string;
  value: string;
  rate: string;
  formula: string;
  footnote?: string;
}) {
  const isPositive = tone === 'positive';
  return (
    <div style={{
      background: isPositive ? '#ecfdf5' : '#eff6ff',
      border: `1px solid ${isPositive ? '#6ee7b7' : '#bfdbfe'}`,
      borderRadius: 12,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minWidth: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: isPositive ? '#10b981' : '#3b82f6' }} />
      <Eyebrow>{eyebrow}</Eyebrow>
      <span className="display-num" style={{ fontSize: 'clamp(28px, 3.4vw, 36px)', fontWeight: 600, lineHeight: 1.05, color: isPositive ? '#064e3b' : '#1e3a8a', fontVariantNumeric: 'tabular-nums', display: 'block' }}>
        {value}
      </span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <Text size="small" weight="semibold" color={isPositive ? 'feedback.text.positive.intense' : 'interactive.text.primary.normal'}>
          {rate}
        </Text>
        <Text size="xsmall" color="surface.text.gray.muted">
          <span style={{ fontFamily: 'monospace' }}>· {formula}</span>
        </Text>
      </div>
      {footnote && <Text size="xsmall" color="surface.text.gray.muted">{footnote}</Text>}
    </div>
  );
}

function MathRow({ label, expr, value, tone, strong, divider }: {
  label: string;
  expr: string;
  value: string;
  tone?: 'positive' | 'information';
  strong?: boolean;
  divider?: boolean;
}) {
  const valColor = tone === 'positive' ? '#059669' : tone === 'information' ? '#2563eb' : '#0f172a';
  return (
    <tr style={{ borderTop: divider ? '1px solid #f1f5f9' : 'none' }}>
      <td style={{ padding: '8px 0', width: '40%' }}>
        <Text size="xsmall" weight={strong ? 'semibold' : 'regular'} color={strong ? 'surface.text.gray.normal' : 'surface.text.gray.subtle'}>
          {label}
        </Text>
      </td>
      <td style={{ padding: '8px 12px 8px 0', width: '32%', fontFamily: 'monospace' }}>
        <Text size="xsmall" color="surface.text.gray.muted">{expr}</Text>
      </td>
      <td style={{ padding: '8px 0', textAlign: 'right' }}>
        <span style={{ fontSize: strong ? 14 : 12, fontWeight: strong ? 600 : 500, color: valColor, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
      </td>
    </tr>
  );
}

function MathBreakdown({ r, fdAmount, monthlySpend }: { r: DerivedResults; fdAmount: number; monthlySpend: number }) {
  const [open, setOpen] = useState(true);
  return (
    <Box
      backgroundColor="surface.background.gray.intense"
      borderWidth="thin"
      borderColor="surface.border.gray.muted"
      borderRadius="large"
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          all: 'unset',
          cursor: 'pointer',
          width: '100%',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Eyebrow>The math, line-by-line</Eyebrow>
          <Text size="small" color="surface.text.gray.subtle">
            No fine-print surprises — here's exactly how we got there.
          </Text>
        </div>
        <div aria-hidden style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#f8fafc', display: 'grid', placeItems: 'center',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 120ms ease', flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {open && (
        <Box paddingX="spacing.5" paddingBottom="spacing.5">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <MathRow label="FD principal" expr="F" value={formatINR(fdAmount)} />
              <MathRow label="Card limit" expr="F × 90%" value={formatINR(r.cardLimit)} />
              <MathRow label="Monthly spend" expr="M" value={formatINR(monthlySpend)} />
              <MathRow label="Annual spend" expr="M × 12" value={formatINR(r.annualSpend)} />
              <MathRow divider label="FD interest (Year 1)" expr={`F × ${formatPct(r.fdRor, 2)}`} value={formatINR(r.annualFDInterest)} tone="positive" />
              <MathRow label={`Cashback @ ${(r.scenario.cashback * 100).toFixed(1).replace(/\.0$/, '')}%`} expr={`M × 12 × ${(r.scenario.cashback * 100).toFixed(1).replace(/\.0$/, '')}%`} value={formatINR(r.annualCashback)} tone="information" />
              <MathRow strong label="Total annual return" expr="FD interest + Cashback" value={formatINR(r.annualTotal)} />
              <MathRow strong label="Rate of return" expr="Total ÷ F" value={formatPct(r.ror)} />
            </tbody>
          </table>
          <Box
            marginTop="spacing.4"
            padding="spacing.3"
            backgroundColor="surface.background.gray.moderate"
            borderRadius="small"
          >
            <Text size="xsmall" color="surface.text.gray.subtle">
              <strong>Plus interest-free credit.</strong>{' '}
              With a {r.cycle.label.toLowerCase()}, the same limit can be reused ~{r.cycle.rotations}× a year — that's working capital you'd otherwise borrow against.
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function ProjectionTable({ r, years }: { r: DerivedResults; years: number }) {
  const rows: ProjectionRow[] = r.projection;
  const maxCum = rows[rows.length - 1].cumulative;
  return (
    <Box
      backgroundColor="surface.background.gray.intense"
      borderWidth="thin"
      borderColor="surface.border.gray.muted"
      borderRadius="large"
      padding="spacing.5"
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-end" marginBottom="spacing.4" gap="spacing.3" flexWrap="wrap">
        <Box>
          <Eyebrow>5-year projection</Eyebrow>
          <Box marginTop="spacing.1">
            <span className="panel-heading" style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', lineHeight: 1.2, display: 'block', marginTop: 4 }}>
              How your FD pays you twice, every year
            </span>
          </Box>
        </Box>
        <Text size="xsmall" color="surface.text.gray.muted">
          FD interest compounds · cashback paid out
        </Text>
      </Box>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 540, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {(['Year', 'FD interest', 'Cashback', 'Annual', 'Cumulative'] as const).map((h, i) => (
                <th key={h} style={{ textAlign: i === 0 || i === 4 ? 'left' : 'right', padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>
                  <Text size="xsmall" weight="semibold" color="surface.text.gray.muted">
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
                  </Text>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const hi = row.year === years;
              return (
                <tr key={row.year}>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid #f1f5f9' }}>
                    <Text size="small" weight={hi ? 'semibold' : 'medium'} color={hi ? 'interactive.text.primary.normal' : 'surface.text.gray.normal'}>
                      Year {row.year}
                    </Text>
                  </td>
                  {[row.fdInterest, row.cashback, row.total].map((v, i) => (
                    <td key={i} style={{ padding: '14px 12px', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>
                      <Text size="small" weight={i === 2 ? 'semibold' : 'regular'} color="surface.text.gray.subtle">
                        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatINR(v)}</span>
                      </Text>
                    </td>
                  ))}
                  <td style={{ padding: '10px 12px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 6, background: hi ? '#dbeafe' : '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ width: `${(row.cumulative / maxCum) * 100}%`, height: '100%', background: hi ? '#3b82f6' : '#94a3b8', borderRadius: 9999, transition: 'width 300ms ease' }} />
                      </div>
                      <Text size="small" weight="semibold" color={hi ? 'interactive.text.primary.normal' : 'surface.text.gray.normal'}>
                        <span style={{ fontVariantNumeric: 'tabular-nums', display: 'block', minWidth: 80, textAlign: 'right' }}>{formatINR(row.cumulative)}</span>
                      </Text>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Box>
  );
}

/** Summary panel — sticky right column on desktop.
 *  Contains: Total Return + FD Interest + Card Cashback + Math breakdown. */
export function CalcResultsPanel({ state, derived }: CalcResultsPanelProps) {
  const r = derived;

  return (
    <Box as="section" display="flex" flexDirection="column" gap="spacing.4">
      <HeroMetric r={r} fdAmount={state.fdAmount} years={state.years} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <ReturnCard
          tone="positive"
          eyebrow="FD interest"
          value={formatINR(r.annualFDInterest)}
          rate={`${formatPct(r.fdRor, 2)} yearly`}
          formula={`${formatINR(state.fdAmount, { compact: true })} × ${formatPct(r.fdRor, 2)}`}
          footnote="Your principal keeps earning — untouched."
        />
        <ReturnCard
          tone="information"
          eyebrow="Card cashback"
          value={formatINR(r.annualCashback)}
          rate={`${(r.scenario.cashback * 100).toFixed(1).replace(/\.0$/, '')}% per spend`}
          formula={`${formatINR(state.monthlySpend, { compact: true })}/mo × 12 × ${(r.scenario.cashback * 100).toFixed(1).replace(/\.0$/, '')}%`}
          footnote={`≈ ${r.scenario.annualizedLabel} annualized on monthly spend`}
        />
      </div>

      <MathBreakdown r={r} fdAmount={state.fdAmount} monthlySpend={state.monthlySpend} />
    </Box>
  );
}

/** Full-width section below the two-column grid on desktop.
 *  Contains: 5-Year Projection + CTA + Disclaimer. */
export function CalcResultsFullWidth({ state, derived }: CalcResultsPanelProps) {
  const r = derived;

  const handlePrimaryCta = () => {
    track.ctaClicked('Get a callback', state);
    window.open(buildSignupUrl(state), '_blank', 'noopener');
  };

  return (
    <Box display="flex" flexDirection="column" gap="spacing.4">
      <ProjectionTable r={r} years={state.years} />

      <div className="cta-section" style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          <span className="panel-heading" style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', lineHeight: 1.2, display: 'block' }}>
            Ready to put your idle capital to work?
          </span>
          <Box marginTop="spacing.1">
            <Text size="small" color="surface.text.gray.subtle">
              Talk to someone who's set this up for 500+ businesses. We'll show you how to maximise your returns and get you started.
            </Text>
          </Box>
        </div>
        <div className="cta-section-buttons">
          <Button variant="primary" onClick={handlePrimaryCta}>
            Get a callback
          </Button>
        </div>
      </div>

      <Divider />

      <Text size="xsmall" color="surface.text.gray.muted">
        Illustrative figures. FD interest uses YES Bank annualised yield rates w.e.f. 5th March 2026 (6.82% for 1 yr, 7.19% for 2–3 yrs, 6.92% for 5 yrs); actual rates vary by bank and tenure.
        Cashback rates and credit cycles per the YES Bank / RBL Bank RazorpayX Corporate Card programs.
        Card is issued in partnership with the bank; credit at sole discretion of the issuer.
      </Text>
    </Box>
  );
}

/** Mobile-only preview: Total Return + FD Interest + Card Cashback + nudge.
 *  Sits above the input panel. Hidden on tablet/desktop via CSS. */
export function CalcResultsMobilePreview({ state, derived }: CalcResultsPanelProps) {
  const r = derived;
  return (
    <div className="calc-mobile-preview" style={{ flexDirection: 'column', gap: 12 }}>
      <HeroMetric r={r} years={state.years} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <ReturnCard
          tone="positive"
          eyebrow="FD interest"
          value={formatINR(r.annualFDInterest)}
          rate={`${formatPct(r.fdRor, 2)} yearly`}
          formula={`${formatINR(state.fdAmount, { compact: true })} × ${formatPct(r.fdRor, 2)}`}
          footnote="Your principal keeps earning — untouched."
        />
        <ReturnCard
          tone="information"
          eyebrow="Card cashback"
          value={formatINR(r.annualCashback)}
          rate={`${(r.scenario.cashback * 100).toFixed(1).replace(/\.0$/, '')}% per spend`}
          formula={`${formatINR(state.monthlySpend, { compact: true })}/mo × 12 × ${(r.scenario.cashback * 100).toFixed(1).replace(/\.0$/, '')}%`}
          footnote={`≈ ${r.scenario.annualizedLabel} annualized on monthly spend`}
        />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '10px 14px',
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: 8,
      }}>
        <span style={{ fontSize: 13, color: '#0369a1', lineHeight: 1.5 }}>
          ↓ These are example numbers — adjust your FD amount and monthly spend below to see your actual returns.
        </span>
      </div>
    </div>
  );
}
