import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const IconBase = ({ children, className = 'h-4 w-4', ...props }: IconProps & { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className={className}
    {...props}
  >
    {children}
  </svg>
);

export const ActivityIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M22 12h-4l-3 7-6-14-3 7H2" />
  </IconBase>
);

export const AlertIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
    <path d="M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
  </IconBase>
);

export const BookOpenIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M12 7v14" />
    <path d="M3 5.8A2.8 2.8 0 0 1 5.8 3H12v18H5.8A2.8 2.8 0 0 1 3 18.2Z" />
    <path d="M21 5.8A2.8 2.8 0 0 0 18.2 3H12v18h6.2a2.8 2.8 0 0 0 2.8-2.8Z" />
  </IconBase>
);

export const BellIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </IconBase>
);

export const CalendarIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18" />
  </IconBase>
);

export const CheckCircleIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M9 12.5 11.2 15 16 9" />
    <circle cx="12" cy="12" r="9" />
  </IconBase>
);

export const CircleIcon = (props: IconProps) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="9" />
  </IconBase>
);

export const CloudIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M17.5 19H8a5 5 0 1 1 .7-9.95A6 6 0 0 1 20 11.5 3.8 3.8 0 0 1 17.5 19Z" />
  </IconBase>
);

export const CodeIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="m8 9-4 3 4 3" />
    <path d="m16 9 4 3-4 3" />
    <path d="m14 5-4 14" />
  </IconBase>
);

export const DownloadIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M12 3v11" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 21h14" />
  </IconBase>
);

export const DumbbellIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="m6.5 6.5 11 11" />
    <path d="m21 14-7 7" />
    <path d="m10 3-7 7" />
    <path d="m18 11 3-3" />
    <path d="m13 6 3-3" />
    <path d="m8 21 3-3" />
    <path d="m3 16 3-3" />
  </IconBase>
);

export const FlagIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M5 21V4" />
    <path d="M5 4h11l-1 5 1 5H5" />
  </IconBase>
);

export const HeartPulseIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 0 1 7.1-7.1l.4.4.4-.4a5 5 0 0 1 7.1 7.1Z" />
    <path d="M3.3 12H8l1.6-3.2L12 16l1.8-4h3" />
  </IconBase>
);

export const MobilityIcon = (props: IconProps) => (
  <IconBase {...props}>
    <rect x="4" y="6" width="16" height="14" rx="2" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M4 12h16" />
  </IconBase>
);

export const NoteIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M6 3h9l3 3v15H6Z" />
    <path d="M14 3v4h4" />
    <path d="M9 12h6" />
    <path d="M9 16h6" />
  </IconBase>
);

export const PlusIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </IconBase>
);

export const RunnerIcon = (props: IconProps) => (
  <IconBase {...props}>
    <circle cx="13" cy="4" r="2" />
    <path d="m5 21 4-5" />
    <path d="m16 21-3-6-4-2 3-5" />
    <path d="m7 9 5-1 4 3 3-1" />
  </IconBase>
);

export const SettingsIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
    <path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1 1.63V21a2 2 0 1 1-4 0v-.09a1.8 1.8 0 0 0-1-1.63 1.8 1.8 0 0 0-2 .36l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.63-1H3a2 2 0 1 1 0-4h.09a1.8 1.8 0 0 0 1.63-1 1.8 1.8 0 0 0-.36-2l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.8 1.8 0 0 0 2 .36 1.8 1.8 0 0 0 1-1.63V3a2 2 0 1 1 4 0v.09a1.8 1.8 0 0 0 1 1.63 1.8 1.8 0 0 0 2-.36l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.63 1H21a2 2 0 1 1 0 4h-.09a1.8 1.8 0 0 0-1.51 1Z" />
  </IconBase>
);

export const TrashIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M4 7h16" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M6 7l1 14h10l1-14" />
    <path d="M9 7V4h6v3" />
  </IconBase>
);

export const UploadIcon = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M12 21V10" />
    <path d="m7 14 5-5 5 5" />
    <path d="M5 3h14" />
  </IconBase>
);
