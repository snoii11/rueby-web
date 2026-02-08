import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden relative">
      {/* Animated Background Blobs */}
      <div className="liquid-blob blob-1" />
      <div className="liquid-blob blob-2" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31C5F] to-[#B81650] flex items-center justify-center animate-pulse-glow">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <span className="text-xl font-bold text-white">Rueby</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-white/70 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="https://discord.com/api/oauth2/authorize?client_id=1469757745816277022&permissions=8&scope=bot%20applications.commands"
            className="btn-ruby text-sm"
          >
            Add to Server
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-white/70">Online & Protecting Servers</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Protect Your Server with{" "}
              <span className="text-ruby-glow">Rueby</span>
            </h1>

            <p className="text-xl text-white/70 mb-8 max-w-xl">
              A powerful security and moderation bot for Discord.
              Anti-nuke protection, heat-based automod, verification,
              and more — all in one beautiful package.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="https://discord.com/api/oauth2/authorize?client_id=1469757745816277022&permissions=8&scope=bot%20applications.commands"
                className="btn-ruby text-center"
              >
                ✨ Add to Server
              </Link>
              <Link
                href="/dashboard"
                className="btn-ruby-outline text-center"
              >
                Open Dashboard
              </Link>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="flex-1 grid gap-4">
            <div className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E31C5F]/20 to-[#E31C5F]/10 flex items-center justify-center">
                  <span className="text-2xl">🛡️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Anti-Nuke</h3>
                  <p className="text-white/60 text-sm">Protect against malicious admins and bot attacks</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E31C5F]/20 to-[#E31C5F]/10 flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Heat System</h3>
                  <p className="text-white/60 text-sm">Smart automod that adapts to threats in real-time</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E31C5F]/20 to-[#E31C5F]/10 flex items-center justify-center">
                  <span className="text-2xl">🚪</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Join Gate</h3>
                  <p className="text-white/60 text-sm">Filter new members by age, avatar, and username</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E31C5F]/20 to-[#E31C5F]/10 flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Verification</h3>
                  <p className="text-white/60 text-sm">Captcha and button verification for new members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-4">
          Everything You Need
        </h2>
        <p className="text-white/60 text-center mb-16 max-w-2xl mx-auto">
          Rueby combines powerful security features with easy-to-use moderation tools,
          all configured through a beautiful web dashboard.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "🔨", title: "Moderation", desc: "Ban, kick, mute, warn, timeout with case tracking" },
            { icon: "🔒", title: "Lockdown", desc: "Lock channels, roles, or entire server instantly" },
            { icon: "📊", title: "Logging", desc: "Detailed logs for every action and event" },
            { icon: "🎫", title: "Permits", desc: "Granular role-based permission levels" },
            { icon: "⚡", title: "Fast", desc: "Responses in milliseconds, not seconds" },
            { icon: "🌐", title: "Dashboard", desc: "Configure everything from your browser" },
          ].map((feature, i) => (
            <div key={i} className="glass-card p-6">
              <span className="text-3xl mb-4 block">{feature.icon}</span>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/60 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 py-20">
        <div className="glass-card p-12 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Secure Your Server?
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Join thousands of servers already protected by Rueby.
            Setup takes less than a minute.
          </p>
          <Link
            href="https://discord.com/api/oauth2/authorize?client_id=1469757745816277022&permissions=8&scope=bot%20applications.commands"
            className="btn-ruby inline-block"
          >
            ✨ Add Rueby to Your Server
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E31C5F] to-[#B81650] flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-white/60 text-sm">© 2024 Rueby Bot</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
