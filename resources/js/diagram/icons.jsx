import {
    siPostgresql, siMysql, siSqlite, siMariadb, siMongodb, siRedis, siRabbitmq,
    siApachekafka, siNginx, siApache, siCloudflare, siLaravel, siPhp, siPython,
    siNodedotjs, siReact, siVuedotjs, siAngular, siSvelte, siDjango, siFlask,
    siRubyonrails, siRuby, siGo, siRust, siSpring, siDotnet, siKubernetes,
    siDocker, siGithub, siGitlab, siStripe, siGraphql, siPrisma, siTypescript,
    siJavascript, siElasticsearch, siSupabase, siFirebase, siVercel, siNetlify,
    siDigitalocean, siClickhouse, siApachecassandra, siMinio, siCelery,
    siAnthropic, siFastapi, siExpress, siNextdotjs, siKotlin, siSwift, siRay,
    siGooglecloud, siSocketdotio, siMailgun, siAuth0, siKeycloak, siGrafana,
    siPrometheus, siSentry, siVite, siDeno, siBun,
} from 'simple-icons';

const BRANDS = {
    postgresql: siPostgresql, mysql: siMysql, sqlite: siSqlite, mariadb: siMariadb,
    mongodb: siMongodb, redis: siRedis, rabbitmq: siRabbitmq, kafka: siApachekafka,
    nginx: siNginx, apache: siApache, cloudflare: siCloudflare, laravel: siLaravel,
    php: siPhp, python: siPython, node: siNodedotjs, react: siReact, vue: siVuedotjs,
    angular: siAngular, svelte: siSvelte, django: siDjango, flask: siFlask,
    rails: siRubyonrails, ruby: siRuby, go: siGo, rust: siRust, spring: siSpring,
    dotnet: siDotnet, kubernetes: siKubernetes, docker: siDocker, github: siGithub,
    gitlab: siGitlab, stripe: siStripe, graphql: siGraphql, prisma: siPrisma,
    typescript: siTypescript, javascript: siJavascript, elasticsearch: siElasticsearch,
    supabase: siSupabase, firebase: siFirebase, vercel: siVercel, netlify: siNetlify,
    digitalocean: siDigitalocean, clickhouse: siClickhouse, cassandra: siApachecassandra,
    minio: siMinio, celery: siCelery, anthropic: siAnthropic, fastapi: siFastapi,
    express: siExpress, nextjs: siNextdotjs, kotlin: siKotlin, swift: siSwift,
    ray: siRay, gcp: siGooglecloud, socketio: siSocketdotio, mailgun: siMailgun,
    auth0: siAuth0, keycloak: siKeycloak, grafana: siGrafana, prometheus: siPrometheus,
    sentry: siSentry, vite: siVite, deno: siDeno, bun: siBun,
};

const ALIASES = {
    postgres: 'postgresql', pg: 'postgresql', pgsql: 'postgresql',
    mongo: 'mongodb', k8s: 'kubernetes', nodejs: 'node', 'node.js': 'node',
    js: 'javascript', ts: 'typescript', 'vue.js': 'vue', 'next.js': 'nextjs',
    next: 'nextjs', rubyonrails: 'rails', 'ruby on rails': 'rails',
    golang: 'go', elastic: 'elasticsearch', es: 'elasticsearch',
    'apache kafka': 'kafka', amqp: 'rabbitmq', googlecloud: 'gcp',
    'google cloud': 'gcp', 'socket.io': 'socketio', csharp: 'dotnet',
    '.net': 'dotnet', claude: 'anthropic', reactjs: 'react',
};

/** "PostgreSQL 16" / "postgres" / "php 8.4" -> brand icon or null */
export function brandFor(tech) {
    if (!tech) return null;
    let key = tech.toLowerCase().trim();
    // strip trailing version-ish tokens: "postgres 16", "php8.4", "redis v7"
    key = key.replace(/[\s/-]*v?\d+(\.\d+)*\s*$/, '').trim() || key;
    key = ALIASES[key] ?? key;
    return BRANDS[key] ?? null;
}

export function BrandIcon({ tech, size = 20 }) {
    const icon = brandFor(tech);
    if (!icon) return null;
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={icon.title}>
            <path d={icon.path} fill={`#${icon.hex}`} />
        </svg>
    );
}

/* Geometric type icons — flat, single-color, Suprematist-adjacent. */
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'square' };

export const TYPE_ICONS = {
    service: (
        <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" {...P} /><rect x="9" y="9" width="6" height="6" fill="currentColor" stroke="none" /></svg>
    ),
    api: (
        <svg viewBox="0 0 24 24"><path d="M8 5 3 12l5 7M16 5l5 7-5 7" {...P} /></svg>
    ),
    database: (
        <svg viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7.5" ry="3" {...P} /><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" {...P} /></svg>
    ),
    table: (
        <svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" {...P} /><path d="M4 10h16M10 10v9" {...P} /></svg>
    ),
    queue: (
        <svg viewBox="0 0 24 24"><rect x="3" y="9" width="4" height="6" fill="currentColor" stroke="none" /><rect x="9" y="9" width="4" height="6" fill="currentColor" stroke="none" opacity=".65" /><rect x="15" y="9" width="4" height="6" fill="currentColor" stroke="none" opacity=".35" /><path d="M20 12h1" {...P} /></svg>
    ),
    topic: (
        <svg viewBox="0 0 24 24"><circle cx="7" cy="12" r="2.4" fill="currentColor" stroke="none" /><path d="M11 7c2.8 2.8 2.8 7.2 0 10M14.5 4.5c4.2 4.2 4.2 10.8 0 15" {...P} /></svg>
    ),
    cron: (
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" {...P} /><path d="M12 7v5l3.5 2" {...P} /></svg>
    ),
    cache: (
        <svg viewBox="0 0 24 24"><path d="M13 3 5 14h5l-1 7 8-11h-5l1-7z" fill="currentColor" stroke="none" /></svg>
    ),
    function: (
        <svg viewBox="0 0 24 24"><path d="M6 20c0-9 3-16 8-16M4 10h9" {...P} /><path d="M13 14l6 6M19 14l-6 6" {...P} /></svg>
    ),
    storage: (
        <svg viewBox="0 0 24 24"><path d="M4 8h16v11H4zM4 8l2-4h12l2 4" {...P} /><path d="M9 12h6" {...P} /></svg>
    ),
    external: (
        <svg viewBox="0 0 24 24"><path d="M10 5H5v14h14v-5" {...P} /><path d="M13 4h7v7M20 4l-9 9" {...P} /></svg>
    ),
    client: (
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" {...P} /><path d="M9 20h6M12 16v4" {...P} /></svg>
    ),
};

export function TypeIcon({ type, size = 20 }) {
    const icon = TYPE_ICONS[type] ?? TYPE_ICONS.service;
    return <span className="sd-typeicon" style={{ width: size, height: size }}>{icon}</span>;
}
