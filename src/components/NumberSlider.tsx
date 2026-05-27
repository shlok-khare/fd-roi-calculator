import { useMemo, useState, useRef } from 'react';
import { Box, Text } from '@razorpay/blade/components';

interface NumberSliderProps {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  onChangeEnd?: (v: number) => void;
  accentColor?: string;
  meta?: React.ReactNode;
}

const DISPLAY_FONT = "'TASA Orbiter', 'TASA Orbiter Fallback Arial', Arial, sans-serif";

function toIndianRupees(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

export function NumberSlider({
  label,
  hint,
  value,
  min,
  max,
  step,
  format,
  onChange,
  onChangeEnd,
  accentColor = '#2563eb',
  meta,
}: NumberSliderProps) {
  const id = useMemo(() => `ns-${Math.random().toString(36).slice(2, 8)}`, []);
  const pct = ((value - min) / (max - min)) * 100;

  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [confirmedValue, setConfirmedValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync confirmed value when slider moves externally (e.g. via range input)
  const idleDisplay = toIndianRupees(confirmedValue);

  const handleFocus = () => {
    setInputVal(String(value));
    setFocused(true);
  };

  const commit = (raw: string) => {
    const parsed = parseFloat(raw.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed) && parsed > 0) {
      const clamped = Math.max(min, Math.min(max, parsed));
      const snapped = Math.round(clamped / step) * step;
      onChange(snapped);
      onChangeEnd?.(snapped);
      setConfirmedValue(snapped);
    }
  };

  const handleBlur = () => {
    commit(inputVal);
    setFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit(inputVal);
      setFocused(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleRangeChange = (v: number) => {
    onChange(v);
    setConfirmedValue(v);
  };

  const typingDisplay = inputVal
    ? '₹' + Number(inputVal).toLocaleString('en-IN')
    : '₹';
  const displayValue = focused ? typingDisplay : idleDisplay;

  return (
    <Box display="flex" flexDirection="column" gap="spacing.2">
      <Box display="flex" justifyContent="space-between" alignItems="flex-end" gap="spacing.3">
        <label htmlFor={id}>
          <Text size="medium" weight="medium" color="surface.text.gray.subtle">{label}</Text>
        </label>
        {hint && <Text size="xsmall" color="surface.text.gray.muted">{hint}</Text>}
      </Box>

      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onFocus={handleFocus}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onChange={(e) => {
            const digits = e.target.value.replace(/^₹/, '').replace(/[^0-9]/g, '');
            setInputVal(digits);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            fontSize: 32,
            fontWeight: 600,
            fontFamily: DISPLAY_FONT,
            fontVariantNumeric: 'tabular-nums',
            color: '#0f172a',
            lineHeight: 1.05,
            border: 'none',
            borderBottom: `2px solid ${focused ? accentColor : hovered ? '#94a3b8' : '#e2e8f0'}`,
            outline: 'none',
            padding: '0 0 4px',
            background: 'transparent',
            width: '100%',
            minWidth: 0,
            cursor: 'text',
            caretColor: accentColor,
            transition: 'border-color 150ms ease',
          }}
        />
        {!focused && (
          <span style={{
            position: 'absolute',
            right: 0,
            bottom: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10,
            fontWeight: 400,
            fontFamily: "'Inter', 'Inter Fallback Arial', Arial, sans-serif",
            letterSpacing: '0em',
            lineHeight: '14px',
            color: hovered ? '#2563eb' : 'rgb(97, 109, 117)',
            background: hovered ? '#eff6ff' : '#f1f5f9',
            border: `1px solid ${hovered ? '#bfdbfe' : '#e2e8f0'}`,
            borderRadius: 6,
            padding: '2px 8px',
            pointerEvents: 'none',
            transition: 'all 150ms ease',
            userSelect: 'none',
          }}>
            ✎ edit
          </span>
        )}
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => handleRangeChange(parseFloat(e.target.value))}
        onMouseUp={(e) => onChangeEnd?.(parseFloat((e.target as HTMLInputElement).value))}
        onTouchEnd={(e) => onChangeEnd?.(parseFloat((e.target as HTMLInputElement).value))}
        style={{
          width: '100%',
          height: 4,
          borderRadius: 9999,
          appearance: 'none',
          background: `linear-gradient(to right, ${accentColor} ${pct}%, #e2e8f0 ${pct}%)`,
          cursor: 'pointer',
          marginTop: 8,
          '--thumb-color': accentColor,
        } as React.CSSProperties}
      />

      <Box display="flex" justifyContent="space-between">
        <Text size="xsmall" color="surface.text.gray.muted">{format(min)}</Text>
        <Text size="xsmall" color="surface.text.gray.muted">{format(max)}</Text>
      </Box>

      {meta && <Text size="small" color="surface.text.gray.muted">{meta}</Text>}
    </Box>
  );
}
