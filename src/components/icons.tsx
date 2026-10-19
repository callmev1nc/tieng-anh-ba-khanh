import type { ReactNode, SVGProps } from 'react'

/* Lucide-style icon set: stroke, currentColor, rounded caps.
 * One consistent visual language instead of mixed emoji rendering. */

interface IconProps {
  className?: string
  size?: number
}

function Base({
  size = 20,
  className = '',
  children,
  ...rest
}: IconProps & { children: ReactNode } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export function HomeIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
    </Base>
  )
}

export function BookIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2Z" />
      <path d="M19 17H6a2 2 0 0 0-2 2" />
      <path d="M9 7h6" />
    </Base>
  )
}

export function RepeatIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </Base>
  )
}

export function LettersIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 18 8.3 6h1.4L14 18" />
      <path d="M12.6 14H5.4" />
      <path d="M20.5 18v-6.5a2.3 2.3 0 0 0-4.4-1" />
      <path d="M15.5 15.7a1.9 1.9 0 1 0 3.7.6c.6-1.4-.3-2.5-1.8-2.5-1.1 0-1.9.7-1.9 1.9Z" />
    </Base>
  )
}

export function FlameIcon(p: IconProps) {
  return (
    <Base {...p} fill="currentColor" stroke="none">
      <path d="M12.5 2c.3 3.4-1.6 4.9-3.3 6.5C7.5 10.2 6 11.9 6 14.8A6.2 6.2 0 0 0 12.2 21 6.2 6.2 0 0 0 18.5 14.8c0-1.4-.5-2.6-1.3-3.9-.4.9-1 1.6-1.9 2-.2-3.6-.4-7.5-2.8-10.9Z" />
    </Base>
  )
}

export function StarIcon(p: IconProps) {
  return (
    <Base {...p} fill="currentColor" stroke="none">
      <path d="M12 2.5l2.9 5.9 6.5.96-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.96Z" />
    </Base>
  )
}

export function SpeakerIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M11 5 6 9H3v6h3l5 4Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </Base>
  )
}

export function TurtleIcon(p: IconProps) {
  return (
    <Base {...p}>
      <ellipse cx="11" cy="12.5" rx="6.5" ry="5.5" />
      <path d="M6.5 11.5h9M8 15h6" />
      <circle cx="19" cy="14" r="2.4" />
      <path d="M20.6 12.9c.9-.5 1.6-1.4 1.6-2.4" />
      <path d="M6.5 17.8v1.7M11 18v1.5M15.5 17.8v1.7" />
    </Base>
  )
}

export function MicIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </Base>
  )
}

export function ChatIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12Z" />
    </Base>
  )
}

export function CheckIcon(p: IconProps) {
  return (
    <Base {...p} strokeWidth={3}>
      <path d="m4.5 12.5 5 5L19.5 7" />
    </Base>
  )
}

export function XIcon(p: IconProps) {
  return (
    <Base {...p} strokeWidth={3}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Base>
  )
}

export function ChevronRightIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="m9 5 7 7-7 7" />
    </Base>
  )
}

export function PlayIcon(p: IconProps) {
  return (
    <Base {...p} fill="currentColor" stroke="none">
      <path d="M7.5 4.6c0-1 1.1-1.6 2-1.1l11 6.4c.9.5.9 1.7 0 2.2l-11 6.4c-.9.5-2-.1-2-1.1Z" />
    </Base>
  )
}

export function ScissorsIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="6" cy="6" r="2.6" />
      <circle cx="6" cy="18" r="2.6" />
      <path d="M8.2 7.6 20 18M8.2 16.4 20 6" />
    </Base>
  )
}

export function TrophyIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M8 4h8v6a4 4 0 0 1-8 0Z" />
      <path d="M8 5H4.5A3.3 3.3 0 0 0 8 9.5M16 5h3.5a3.3 3.3 0 0 1-3.5 4.5" />
      <path d="M12 14v3M8.5 20c0-1.7 1.6-3 3.5-3s3.5 1.3 3.5 3Z" />
    </Base>
  )
}

export function CalendarIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="3.5" y="5" width="17" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </Base>
  )
}

export function EarIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M6.5 9a5.5 5.5 0 1 1 11 0c0 2-.9 3-1.9 4.2-1 1.1-2.1 2.3-2.1 4.3a3.6 3.6 0 0 1-7.1.8" />
      <path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.9-1.5 2.3-1.5 4" />
    </Base>
  )
}

export function GiftIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M12 11v10M4 11h16M7.5 11h9" />
      <path d="M12 11S9.5 6.5 7.6 7.6s.9 3.4 4.4 3.4zm0 0s2.5-4.5 4.4-3.4-.9 3.4-4.4 3.4z" />
    </Base>
  )
}
