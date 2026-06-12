// Clean line-icon set (Feather-style) so the UI has no emoji.
// Usage: <Icon name="home" size={22} />  — inherits color via currentColor.

type IconName =
  | 'home'
  | 'reports'
  | 'concierge'
  | 'account'
  | 'bell'
  | 'document'
  | 'experts'
  | 'clients'
  | 'properties'
  | 'homewatch'
  | 'settings'
  | 'search'
  | 'plus'
  | 'logout'
  | 'bed'
  | 'bath'
  | 'ruler'
  | 'calendar'
  | 'phone'
  | 'mail'

const P: Record<IconName, JSX.Element> = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></>,
  reports: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M8.5 11h7" /><path d="M8.5 15h5" /></>,
  concierge: <><path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z" /><path d="M18 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></>,
  account: <><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c0-3.6 3.4-5.5 7.5-5.5s7.5 1.9 7.5 5.5" /></>,
  bell: <><path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.5 8-2.5 8h17S18 14.5 18 8.5" /><path d="M10.2 21a2.2 2.2 0 0 0 3.6 0" /></>,
  document: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h4" /></>,
  experts: <><path d="M15 5.2a4 4 0 0 0-5.4 5.2L3.5 16.5V20.5h4l6.1-6.1A4 4 0 0 0 18.8 9l-2.4 2.4-2.1-2.1z" /></>,
  clients: <><circle cx="9" cy="8.5" r="3.3" /><path d="M3.2 20c0-3.2 2.6-5 5.8-5s5.8 1.8 5.8 5" /><path d="M16 5.4a3.3 3.3 0 0 1 0 6.2" /><path d="M17.5 15.2c2.3.5 3.8 2.1 3.8 4.8" /></>,
  properties: <><path d="M4 21V9.5L12 4l8 5.5V21" /><path d="M9.5 21v-5h5v5" /><path d="M4 21h16" /></>,
  homewatch: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="m8.6 13 2 2 4-4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20.5 20.5-4.2-4.2" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  logout: <><path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" /><path d="m16 8 4 4-4 4" /><path d="M20 12H9" /></>,
  bed: <><path d="M3 17v-5h13a3 3 0 0 1 3 3v2" /><path d="M3 17v3M21 17v3M3 12V7M7 12V9.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 9.5V12" /></>,
  bath: <><path d="M4 12V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2" /><path d="M3 12h18v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" /><path d="M7 18v2M17 18v2" /></>,
  ruler: <><rect x="3" y="8" width="18" height="8" rx="1.5" transform="rotate(0 12 12)" /><path d="M7 8v3M11 8v4M15 8v3M19 8v4" /></>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 9h16M8 3v4M16 3v4" /></>,
  phone: <><path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
}

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {P[name]}
    </svg>
  )
}
