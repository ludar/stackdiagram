/** The Sputnik mark from the Claude Design draft: orbit, satellite, three ground nodes. */
export default function Logo({ size = 34 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="104" r="74" fill="none" stroke="var(--sd-ink)" strokeWidth="9" />
            <line x1="118" y1="52" x2="60" y2="84" stroke="var(--sd-ink)" strokeWidth="10" />
            <line x1="126" y1="64" x2="74" y2="114" stroke="var(--sd-ink)" strokeWidth="10" />
            <line x1="136" y1="72" x2="104" y2="132" stroke="var(--sd-ink)" strokeWidth="10" />
            <circle cx="134" cy="48" r="32" fill="#cf3f2e" />
            <circle cx="134" cy="48" r="13" fill="#e0b83a" />
            <circle cx="56" cy="86" r="14" fill="#e0b83a" />
            <circle cx="70" cy="118" r="14" fill="#3f7a4e" />
            <circle cx="102" cy="136" r="14" fill="#cf3f2e" />
        </svg>
    );
}
