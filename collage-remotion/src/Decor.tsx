// Decorative vector elements only. They are graphics, not RE:SET products.

export const Heart: React.FC<{size: number; color: string; outline?: boolean}> = ({size, color, outline = true}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{display: 'block', overflow: 'visible'}}>
    <path
      d="M20 35 C 8 26, 3 19, 3 12.5 C 3 7.5, 7 4, 11.5 4 C 15 4, 18 6, 20 9.5 C 22 6, 25 4, 28.5 4 C 33 4, 37 7.5, 37 12.5 C 37 19, 32 26, 20 35 Z"
      fill={color}
      stroke={outline ? '#ffffff' : 'none'}
      strokeWidth={outline ? 4 : 0}
      strokeLinejoin="round"
      paintOrder="stroke"
    />
  </svg>
);

export const Sparkle: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{display: 'block', overflow: 'visible'}}>
    <path
      d="M20 2 C 21.5 13, 27 18.5, 38 20 C 27 21.5, 21.5 27, 20 38 C 18.5 27, 13 21.5, 2 20 C 13 18.5, 18.5 13, 20 2 Z"
      fill={color}
      stroke="rgba(217, 140, 163, 0.55)"
      strokeWidth={1.2}
    />
  </svg>
);
