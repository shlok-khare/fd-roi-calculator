import type { CalcState } from '../types';

// ---------------------------------------------------------------------------
// Superleap / analytics tracking layer
//
// Replace the body of `fireEvent` with the actual Superleap JS SDK call once
// the snippet is available. The interface below is stable — events and their
// properties won't change.
//
// Typical Superleap/Segment pattern:
//   window.analytics.track(eventName, properties);
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    analytics?: { track: (event: string, props: Record<string, unknown>) => void };
  }
}

function fireEvent(eventName: string, properties: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && window.analytics?.track) {
    window.analytics.track(eventName, properties);
  }
  // Dev logging — remove before final deploy
  if (import.meta.env.DEV) {
    console.info('[track]', eventName, properties);
  }
}

export const track = {
  pageView(): void {
    fireEvent('ROI Calculator Viewed', {
      page: 'fd_roi_calculator',
      product: 'corporate_card',
    });
  },

  fdAmountChanged(amount: number): void {
    fireEvent('ROI Calculator FD Amount Changed', {
      fd_amount: amount,
      product: 'corporate_card',
    });
  },

  monthlySpendChanged(spend: number): void {
    fireEvent('ROI Calculator Spend Changed', {
      monthly_spend: spend,
      product: 'corporate_card',
    });
  },

  scenarioSelected(scenarioId: string): void {
    fireEvent('ROI Calculator Scenario Selected', {
      scenario_id: scenarioId,
      product: 'corporate_card',
    });
  },

  cycleSelected(cycleId: string): void {
    fireEvent('ROI Calculator Cycle Selected', {
      cycle_id: cycleId,
      product: 'corporate_card',
    });
  },

  horizonSelected(years: number): void {
    fireEvent('ROI Calculator Horizon Selected', {
      years,
      product: 'corporate_card',
    });
  },

  ctaClicked(ctaLabel: string, state: CalcState): void {
    fireEvent('ROI Calculator CTA Clicked', {
      cta_label: ctaLabel,
      fd_amount: state.fdAmount,
      monthly_spend: state.monthlySpend,
      scenario_id: state.scenarioId,
      cycle_id: state.cycleId,
      years: state.years,
      product: 'corporate_card',
    });
  },
};
