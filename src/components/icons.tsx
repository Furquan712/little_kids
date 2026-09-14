// Small hand-built icons that aren't part of lucide-react (brand marks + doodles).

export function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.44 1.33 4.93L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.5 0 9.96-4.46 9.96-9.96C22 6.46 17.54 2 12.04 2Zm0 18.2h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.53 3.69-8.22 8.24-8.22 2.2 0 4.27.86 5.82 2.42a8.17 8.17 0 0 1 2.41 5.81c0 4.54-3.69 8.23-8.22 8.23Zm4.51-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.81-.78.97-.15.16-.29.18-.53.06-.25-.12-1.05-.39-2-1.23a7.5 7.5 0 0 1-1.38-1.72c-.15-.24-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.24-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.24-.86.85-.86 2.08 0 1.22.89 2.4 1.02 2.57.12.16 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}

export function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 5.82c-.9-.9-1.4-2.13-1.4-3.4h-3.15v13.1a2.7 2.7 0 1 1-2.7-2.7c.24 0 .48.03.7.09V9.66a5.88 5.88 0 0 0-.7-.04A5.88 5.88 0 1 0 15.2 15.5V9.02a7.9 7.9 0 0 0 4.6 1.48V7.34a4.64 4.64 0 0 1-3.2-1.52Z" />
    </svg>
  );
}

export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M2 18c4-10 10-16 14-8s8 12 12 4 10-14 14-4 8 8 14 2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StarSpark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 2c1.2 7.6 3.4 9.8 11 11-7.6 1.2-9.8 3.4-11 11-1.2-7.6-3.4-9.8-11-11 7.6-1.2 9.8-3.4 11-11Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CurvedArrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 50" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 8c14 0 44-4 60 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M53 20c4 2 9 4 11 6-3 1-8 2-11 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Rainbow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 90" fill="none" className={className} aria-hidden="true">
      <path d="M10 90a70 70 0 0 1 140 0" stroke="var(--rose)" strokeWidth="10" />
      <path d="M25 90a55 55 0 0 1 110 0" stroke="var(--gold)" strokeWidth="10" />
      <path d="M40 90a40 40 0 0 1 80 0" stroke="var(--sage)" strokeWidth="10" />
      <path d="M55 90a25 25 0 0 1 50 0" stroke="var(--lavender)" strokeWidth="10" />
      <circle cx="14" cy="82" r="10" fill="#fff" />
      <circle cx="146" cy="82" r="10" fill="#fff" />
      <circle cx="4" cy="88" r="8" fill="#fff" />
      <circle cx="156" cy="88" r="8" fill="#fff" />
    </svg>
  );
}

export function TeddyBear({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 170" fill="none" className={className} aria-hidden="true">
      {/* ears */}
      <circle cx="34" cy="32" r="20" fill="#C89A72" />
      <circle cx="126" cy="32" r="20" fill="#C89A72" />
      <circle cx="34" cy="32" r="10" fill="#A9754D" />
      <circle cx="126" cy="32" r="10" fill="#A9754D" />
      {/* head */}
      <circle cx="80" cy="62" r="48" fill="#D9AE80" />
      {/* muzzle */}
      <ellipse cx="80" cy="76" rx="22" ry="16" fill="#F1DBBB" />
      <circle cx="80" cy="70" r="4" fill="#4A3527" />
      <path d="M80 74v6" stroke="#4A3527" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M70 86c4 4 16 4 20 0"
        stroke="#4A3527"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* eyes */}
      <circle cx="60" cy="56" r="4.5" fill="#4A3527" />
      <circle cx="100" cy="56" r="4.5" fill="#4A3527" />
      {/* body */}
      <ellipse cx="80" cy="140" rx="52" ry="40" fill="#D9AE80" />
      {/* arms hugging a heart */}
      <ellipse cx="34" cy="128" rx="16" ry="24" fill="#D9AE80" transform="rotate(-18 34 128)" />
      <ellipse cx="126" cy="128" rx="16" ry="24" fill="#D9AE80" transform="rotate(18 126 128)" />
      {/* heart */}
      <path
        d="M80 118c-8-10-24-6-24 5 0 10 14 18 24 27 10-9 24-17 24-27 0-11-16-15-24-5Z"
        fill="var(--rose)"
      />
      {/* belly patch */}
      <ellipse cx="80" cy="150" rx="24" ry="18" fill="#F1DBBB" />
    </svg>
  );
}
