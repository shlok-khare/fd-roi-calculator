import { Box, Text } from '@razorpay/blade/components';
import { formatINR } from '../utils/calculator';

interface HeroCardVisualProps {
  fdAmount: number;
  cardLimit: number;
  fdRate: number;
}

function HeroStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Box
      backgroundColor="surface.background.gray.intense"
      padding="spacing.4"
      display="flex"
      flexDirection="column"
      gap="spacing.1"
    >
      <Text size="xsmall" weight="semibold" color="surface.text.gray.muted">
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
      </Text>
      <span className="display-num" style={{
        fontSize: 22,
        fontWeight: 600,
        color: '#0f172a',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
      }}>
        {value}
      </span>
      <Text size="xsmall" color="surface.text.gray.muted">{sub}</Text>
    </Box>
  );
}

export function HeroCardVisual({ fdAmount, cardLimit, fdRate }: HeroCardVisualProps) {
  return (
    <Box display="flex" flexDirection="column" gap="spacing.4">
      <img
        src="/finance-team-card.png"
        alt="RazorpayX Corporate Card"
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: 12,
          display: 'block',
          boxShadow: '0 24px 48px -20px rgba(12,38,81,0.35), 0 2px 6px rgba(12,38,81,0.12)',
        }}
      />

      <div
        role="group"
        aria-label="Card stats"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
          background: '#e2e8f0',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <HeroStat label="Card limit" value={formatINR(cardLimit)} sub="90% of FD" />
        <HeroStat label="FD on lien" value={formatINR(fdAmount)} sub={`Earning ${(fdRate * 100).toFixed(2)}% p.a.`} />
      </div>
    </Box>
  );
}
