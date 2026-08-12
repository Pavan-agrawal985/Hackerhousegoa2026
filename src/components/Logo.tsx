export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hhg-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="55%" stopColor="#ff9d3d" />
          <stop offset="100%" stopColor="#ff6b35" />
        </linearGradient>
        <linearGradient id="hhg-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a7fa3" />
          <stop offset="100%" stopColor="#063d58" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill="url(#hhg-sea)" stroke="#14b8a6" strokeWidth="1.5" />
      <circle cx="38" cy="24" r="10" fill="url(#hhg-sun)" />
      <path
        d="M0 40 C 10 34, 18 34, 28 40 S 46 46, 64 40 V 64 H 0 Z"
        fill="#052b3d"
        opacity="0.9"
      />
      <path
        d="M4 44c8-5 16-5 24 0s16 5 24 0"
        fill="none"
        stroke="#5ee6d0"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M14 63c0-10 2-17 6-22"
        fill="none"
        stroke="#3c1e05"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <g stroke="#0f6e32" strokeWidth="1.8" strokeLinecap="round" fill="none">
        <path d="M20 41c-6-1-10-5-12-9" />
        <path d="M20 41c-5 1-10-1-14 2" />
        <path d="M20 41c-3 4-8 5-13 8" />
        <path d="M20 41c0 4 2 8 1 13" />
        <path d="M20 41c3 3 4 7 3 12" />
      </g>
    </svg>
  );
}
