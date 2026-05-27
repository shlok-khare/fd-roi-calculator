import { useState, useEffect, useMemo } from 'react';
import { Box, Text, Button, Link } from '@razorpay/blade/components';
import type { CalcState } from './types';
import { LIMIT_RATIO, computeReturns } from './utils/calculator';
import { track } from './utils/tracking';
import { buildSignupUrl } from './utils/calculator';
import { Header } from './components/Header';
import { HeroCardVisual } from './components/HeroCardVisual';
import { CalcInputPanel } from './components/CalcInputPanel';
import { CalcResultsPanel, CalcResultsMobilePreview, CalcResultsFullWidth } from './components/CalcResultsPanel';

const DEFAULT_STATE: CalcState = {
  fdAmount: 1000000,
  monthlySpend: 1000000,
  scenarioId: 'A',
  cycleId: 'd45',
  years: 2,
};

function parseUrlState(): Partial<CalcState> {
  const p = new URLSearchParams(window.location.search);
  const out: Partial<CalcState> = {};
  const fd = Number(p.get('fd'));
  if (fd >= 500000 && fd <= 20000000) out.fdAmount = fd;
  const spend = Number(p.get('spend'));
  if (spend >= 50000) out.monthlySpend = spend;
  const scenario = p.get('scenario');
  if (scenario === 'A' || scenario === 'B') out.scenarioId = scenario;
  const cycle = p.get('cycle');
  if (cycle === 'd45' || cycle === 'd30') out.cycleId = cycle;
  const years = Number(p.get('years'));
  if (years === 1 || years === 2 || years === 3 || years === 5) out.years = years;
  return out;
}

function stateToUrl(s: CalcState): string {
  const p = new URLSearchParams({
    fd: String(s.fdAmount),
    spend: String(s.monthlySpend),
    scenario: s.scenarioId,
    cycle: s.cycleId,
    years: String(s.years),
  });
  return `${window.location.pathname}?${p.toString()}`;
}

const containerStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: '0 auto',
  width: '100%',
};

export function App() {
  const [state, setState] = useState<CalcState>(() => {
    const urlPatch = parseUrlState();
    const merged = { ...DEFAULT_STATE, ...urlPatch };
    const maxSpend = Math.round(merged.fdAmount / 50000) * 50000;
    if (merged.monthlySpend > maxSpend) merged.monthlySpend = maxSpend;
    return merged;
  });

  const set = (patch: Partial<CalcState>) =>
    setState((s) => {
      const next = { ...s, ...patch };
      const maxSpend = Math.round(next.fdAmount / 50000) * 50000;
      if (next.monthlySpend > maxSpend) next.monthlySpend = maxSpend;
      return next;
    });

  const derived = useMemo(() => computeReturns(state), [state]);

  useEffect(() => {
    track.pageView();
  }, []);

  useEffect(() => {
    window.history.replaceState(null, '', stateToUrl(state));
  }, [state]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Header state={state} />

      {/* Hero */}
      <div style={containerStyle}>
        <Box
          paddingX={{ base: 'spacing.4', m: 'spacing.8' }}
          paddingTop="spacing.8"
          paddingBottom="spacing.4"
          display="flex"
          flexDirection={{ base: 'column', l: 'row' }}
          alignItems={{ base: 'stretch', l: 'flex-start' }}
          gap="spacing.8"
        >
          <div className="hero-text-col" style={{ flex: '1 1 0', minWidth: 0 }}>
            <Text size="small" weight="semibold" color="surface.text.gray.muted">
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                FD-Backed Corporate Card · Value Maximizer
              </span>
            </Text>
            <h1 style={{
              fontSize: 'clamp(28px, 4.4vw, 44px)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              fontWeight: 600,
              margin: '12px 0 0',
              color: '#0f172a',
            }}>
              Your FD earns up to 7%.
              <br />
              Your card earns cashback.
              <br />
              <span style={{ color: '#2563eb' }}>See what both do together.</span>
            </h1>
            <div className="hero-description" style={{ marginTop: 16, maxWidth: 500 }}>
              <Text size="medium" color="surface.text.gray.subtle">
                Park an FD, unlock a card limit up to 90% of it. Your principal keeps earning
                interest while every business spend earns cashback. Move the sliders to see
                the math for your business.
              </Text>
            </div>

            {/* Mobile-only CTA buttons — shown below hero text, hidden on tablet/desktop */}
            <div className="hero-mobile-cta">
              <Link
                href="https://razorpay.com/x/corporate-cards/"
                target="_blank"
                rel="noopener"
                onClick={() => track.ctaClicked('Know more', state)}
              >
                Know more
              </Link>
              <Button
                variant="primary"
                size="medium"
                onClick={() => {
                  track.ctaClicked('Apply now', state);
                  window.open(buildSignupUrl(state), '_blank', 'noopener');
                }}
              >
                Apply now
              </Button>
            </div>
          </div>

          <div className="hero-card-col" style={{ flexShrink: 0, width: '100%', maxWidth: 420 }}>
            <HeroCardVisual fdAmount={state.fdAmount} cardLimit={state.fdAmount * LIMIT_RATIO} fdRate={derived.fdRor / 100} />
          </div>
        </Box>
      </div>

      {/* Calculator grid + full-width below */}
      <div style={containerStyle}>
        <Box
          paddingX={{ base: 'spacing.4', m: 'spacing.8' }}
          paddingBottom="spacing.4"
          display="flex"
          flexDirection="column"
          gap="spacing.6"
        >
          {/* Two-column grid: inputs (left) | results summary (right, sticky) */}
          <div className="calc-grid">
            {/* Mobile only: preview sits above inputs */}
            <CalcResultsMobilePreview state={state} derived={derived} />

            <div className="calc-input-sticky">
              <CalcInputPanel state={state} set={set} />
            </div>

            <div className="calc-results-col">
              <CalcResultsPanel state={state} derived={derived} />
            </div>
          </div>

          {/* Full-width below grid: 5-year projection + CTA + disclaimer */}
          <CalcResultsFullWidth state={state} derived={derived} />
        </Box>
      </div>

      <footer style={{ padding: '8px 24px 24px', textAlign: 'center' }}>
        <Text size="xsmall" color="surface.text.gray.muted">
          © RazorpayX 2026. All Rights Reserved.
        </Text>
      </footer>
    </div>
  );
}
