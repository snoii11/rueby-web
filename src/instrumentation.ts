export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs' && !process.env.VERCEL) {
        const dns = await import('node:dns');
        try {
            dns.setDefaultResultOrder('ipv4first');
            console.log('DNS: Force IPv4 set');
        } catch (e) {
            // Ignore if unavailable
        }
    }
}
