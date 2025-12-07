import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-christmas-red via-christmas-red-light to-christmas-gold px-4 py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-8xl animate-pulse-slow">❄️</div>
        <div className="absolute top-20 right-20 text-6xl animate-bounce-slow">⭐</div>
        <div className="absolute bottom-20 left-20 text-7xl animate-wiggle">🎁</div>
        <div className="absolute bottom-10 right-10 text-8xl animate-pulse-slow">✨</div>
      </div>

      <div className="text-center text-white max-w-2xl relative z-10">
        {/* Hero section */}
        <div className="mb-12">
          <div className="text-8xl mb-6 animate-bounce-slow">🎄</div>
          <h1 className="text-7xl md:text-8xl font-bold mb-6 drop-shadow-2xl">
            Wichtel App
          </h1>
          <p className="text-3xl md:text-4xl font-semibold mb-4 text-christmas-snow">
            Wichteln leicht gemacht
          </p>
          <p className="text-xl md:text-2xl text-christmas-ice/90 font-light">
            In unter 5 Minuten startklar! 🚀
          </p>
        </div>

        {/* CTA Button */}
        <div className="mb-12">
          <Link
            href="/login"
            className="inline-block bg-white text-christmas-red px-12 py-5 rounded-2xl font-bold hover:bg-christmas-snow hover:scale-105 hover:shadow-glow transition-all duration-300 text-xl md:text-2xl shadow-christmas"
          >
            🎅 Jetzt starten
          </Link>
        </div>

        {/* Features Card */}
        <div className="bg-white/15 backdrop-blur-lg rounded-3xl p-8 md:p-10 text-left shadow-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
            <span className="text-4xl">✨</span>
            <span>Features</span>
            <span className="text-4xl">✨</span>
          </h2>
          <ul className="space-y-4 text-base md:text-lg">
            <li className="flex items-start gap-3 hover:translate-x-2 transition-transform">
              <span className="text-2xl flex-shrink-0">🔐</span>
              <span><strong>Garantierte Anonymität</strong> - auch für Organisatoren</span>
            </li>
            <li className="flex items-start gap-3 hover:translate-x-2 transition-transform">
              <span className="text-2xl flex-shrink-0">💬</span>
              <span><strong>WhatsApp-Integration</strong> für schnellen Versand</span>
            </li>
            <li className="flex items-start gap-3 hover:translate-x-2 transition-transform">
              <span className="text-2xl flex-shrink-0">🎰</span>
              <span><strong>Magische Namen-Reveal</strong> Animation</span>
            </li>
            <li className="flex items-start gap-3 hover:translate-x-2 transition-transform">
              <span className="text-2xl flex-shrink-0">📱</span>
              <span><strong>Keine App-Installation</strong> nötig</span>
            </li>
          </ul>
        </div>

        {/* Trust badge */}
        <div className="mt-8 text-christmas-ice/70 text-sm">
          <p>🎁 Von Wichtel-Fans für Wichtel-Fans gemacht</p>
        </div>
      </div>
    </div>
  );
}
