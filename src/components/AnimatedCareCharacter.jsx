function GlassesCharacter() {
  return (
    <svg
      className="care-mascot-art care-mascot-glasses"
      viewBox="0 0 240 190"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="glasses-frame" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#8ee8ff" />
          <stop offset="0.48" stopColor="#28a9d8" />
          <stop offset="1" stopColor="#12618f" />
        </linearGradient>
        <linearGradient id="glasses-lens" x1="0" x2="0.9" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e4f6ff" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="166" rx="76" ry="10" fill="#160c22" opacity=".18" />
      <g className="care-mascot-fall">
        <path d="M37 67 18 58c-4-2-8 1-7 5l4 15 24 6M203 67l19-9c4-2 8 1 7 5l-4 15-24 6" fill="url(#glasses-frame)" />
        <rect x="34" y="46" width="79" height="76" rx="27" fill="url(#glasses-lens)" stroke="url(#glasses-frame)" strokeWidth="12" />
        <rect x="127" y="46" width="79" height="76" rx="27" fill="url(#glasses-lens)" stroke="url(#glasses-frame)" strokeWidth="12" />
        <path d="M113 70c4-7 10-7 14 0" fill="none" stroke="#1683b3" strokeWidth="9" strokeLinecap="round" />
        <path d="M45 58c13-14 40-15 54-1" fill="none" stroke="#d7f8ff" strokeWidth="5" strokeLinecap="round" opacity=".8" />
        <path d="M138 58c13-14 40-15 54-1" fill="none" stroke="#d7f8ff" strokeWidth="5" strokeLinecap="round" opacity=".8" />
        <g className="care-mascot-eyes">
          <ellipse cx="74" cy="83" rx="16" ry="21" fill="#fff" />
          <ellipse cx="166" cy="83" rx="16" ry="21" fill="#fff" />
          <ellipse cx="78" cy="86" rx="7" ry="10" fill="#26354d" />
          <ellipse cx="170" cy="86" rx="7" ry="10" fill="#26354d" />
          <circle cx="80" cy="82" r="2.7" fill="#fff" />
          <circle cx="172" cy="82" r="2.7" fill="#fff" />
        </g>
        <circle cx="50" cy="125" r="6" fill="#f3a5ab" opacity=".7" />
        <circle cx="190" cy="125" r="6" fill="#f3a5ab" opacity=".7" />
        <path d="M105 134c9 12 21 12 30 0" fill="none" stroke="#3b2852" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function ToothCharacter() {
  return (
    <svg
      className="care-mascot-art care-mascot-tooth"
      viewBox="0 0 240 210"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tooth-shade" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".62" stopColor="#fffefb" />
          <stop offset="1" stopColor="#d9d4e5" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="188" rx="64" ry="9" fill="#160c22" opacity=".15" />
      <g className="care-mascot-fall">
        <path d="M73 105c-15 8-24 16-31 31" fill="none" stroke="#fff" strokeWidth="11" strokeLinecap="round" />
        <path d="M167 104c14 8 22 17 28 31" fill="none" stroke="#fff" strokeWidth="11" strokeLinecap="round" />
        <g className="care-mascot-wave">
          <path d="M188 132c6-11 12-19 18-21 4-1 7 2 6 6 5-4 10-2 9 2 4-1 7 3 4 7 3 2 2 6-2 8-8 5-17 7-25 5z" fill="#fff" stroke="#d3cfdf" strokeWidth="2" strokeLinejoin="round" />
        </g>
        <path
          d="M120 32c-25-20-62-6-64 25-2 24 10 38 14 63 4 22 2 53 18 56 13 3 18-31 32-31s19 34 32 31c16-3 14-34 18-56 4-25 16-39 14-63-2-31-39-45-64-25Z"
          fill="url(#tooth-shade)"
          stroke="#c8c2d7"
          strokeWidth="3"
        />
        <path d="M77 51c8-12 21-16 32-12" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity=".85" />
        <g className="care-mascot-eyes">
          <ellipse cx="97" cy="83" rx="7" ry="11" fill="#302741" />
          <ellipse cx="143" cy="83" rx="7" ry="11" fill="#302741" />
          <circle cx="99" cy="79" r="2.5" fill="#fff" />
          <circle cx="145" cy="79" r="2.5" fill="#fff" />
        </g>
        <circle cx="82" cy="102" r="7" fill="#f3a5ab" opacity=".62" />
        <circle cx="158" cy="102" r="7" fill="#f3a5ab" opacity=".62" />
        <path d="M104 108c10 12 22 12 32 0" fill="none" stroke="#7f4352" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default function AnimatedCareCharacter({ type }) {
  return (
    <div className={`care-mascot-stage care-mascot-stage-${type}`} aria-hidden="true">
      {type === 'glasses' ? <GlassesCharacter /> : <ToothCharacter />}
    </div>
  );
}
