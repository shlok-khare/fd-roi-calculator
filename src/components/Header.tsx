import { Box, Button, Link } from '@razorpay/blade/components';
import type { CalcState } from '../types';
import { buildSignupUrl } from '../utils/calculator';
import { track } from '../utils/tracking';

interface HeaderProps {
  state: CalcState;
}

export function Header({ state }: HeaderProps) {
  const handleApply = () => {
    track.ctaClicked('Apply now', state);
    window.open(buildSignupUrl(state), '_blank', 'noopener');
  };

  const handleKnowMore = () => {
    track.ctaClicked('Know more', state);
  };

  return (
    <Box
      as="header"
      backgroundColor="surface.background.gray.intense"
      borderBottomWidth="thin"
      borderBottomColor="surface.border.gray.muted"
    >
      <div className="header-inner" style={{
        maxWidth: 1280,
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 32px',
        gap: 16,
        flexWrap: 'wrap',
        boxSizing: 'border-box',
      }}>
        <picture aria-label="RazorpayX Corporate Cards">
          <source
            srcSet="/razorpayx-corp-card-logo-dark.png"
            media="(prefers-color-scheme: dark)"
          />
          <img
            src="/razorpayx-corp-card-logo-light.png"
            alt="RazorpayX Corporate Cards"
            style={{ height: 28, display: 'block' }}
          />
        </picture>

        <div className="header-nav-buttons" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            href="https://razorpay.com/x/corporate-cards/"
            target="_blank"
            rel="noopener"
            onClick={handleKnowMore}
          >
            Know more
          </Link>
          <Button
            variant="primary"
            size="medium"
            onClick={handleApply}
          >
            Apply now
          </Button>
        </div>
      </div>
    </Box>
  );
}
