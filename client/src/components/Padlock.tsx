interface PadlockProps {
  state: 'locked' | 'unlocked';
  animating: boolean;
}

export default function Padlock({ state, animating }: PadlockProps) {
  const isLocked = state === 'locked';
  const color = isLocked ? '#22c55e' : '#ef4444';
  const glowColor = isLocked ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)';

  // Shackle path: locked = arch up, unlocked = rotated open to the right
  const shackleD = isLocked
    ? 'M 38 52 L 38 30 A 22 22 0 0 1 82 30 L 82 52'
    : 'M 38 52 L 38 20 A 22 22 0 0 1 82 20 L 82 38';

  return (
    <svg
      viewBox="0 0 120 130"
      aria-label={`Door is ${state}`}
      style={{
        filter: `drop-shadow(0 0 18px ${glowColor})`,
        display: 'block',
        width: 'clamp(140px, 40vw, 220px)',
        height: 'clamp(140px, 40vw, 220px)',
      }}
    >
      {/* Shackle */}
      <path
        d={shackleD}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        style={{
          transition: animating ? 'd 0.4s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
        }}
      />

      {/* Body */}
      <rect x="18" y="52" width="84" height="68" rx="10" ry="10" fill={color} />

      {/* Keyhole circle */}
      <circle cx="60" cy="82" r="10" fill="#0f1117" />

      {/* Keyhole slot */}
      <rect x="56" y="88" width="8" height="16" rx="3" fill="#0f1117" />
    </svg>
  );
}
