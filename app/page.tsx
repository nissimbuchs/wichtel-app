import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { WichtelIcon } from '@/components/icons/WichtelIcon'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-christmas-red via-christmas-red-light to-christmas-gold">
    <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 animate-pulse-slow">
          <WichtelIcon name="snowflake" size={80} className="text-white" />
        </div>
        <div className="absolute top-20 right-20 animate-bounce-slow">
          <WichtelIcon name="star" size={60} className="text-white" />
        </div>
        <div className="absolute bottom-20 left-20 animate-wiggle">
          <WichtelIcon name="gift" size={70} className="text-white" />
        </div>
        <div className="absolute bottom-10 right-10 animate-pulse-slow">
          <WichtelIcon name="sparkles" size={80} className="text-white" />
        </div>
      </div>

      <div className="text-center text-white max-w-2xl relative z-10">
        {/* Hero section */}
        <div className="mb-12">
          <div className="mb-6 flex justify-center animate-bounce-slow">
            <WichtelIcon name="tree" size={96} className="text-christmas-green" />
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 drop-shadow-2xl">
            Wichtel App
          </h1>
          <p className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 text-christmas-snow">
            Wichteln leicht gemacht
          </p>
          <p className="text-lg sm:text-xl md:text-2xl text-christmas-ice/90 font-light">
            In unter 5 Minuten startklar!
          </p>
        </div>

        {/* CTA Button */}
        <div className="mb-12">
          <Link
            href="/login"
            className="inline-flex items-center gap-3 bg-gradient-to-br from-christmas-red via-christmas-red to-christmas-red-dark text-white px-12 py-5 rounded-2xl font-bold shadow-frost-lg hover:shadow-glow-red hover:scale-105 transition-all duration-300 text-xl md:text-2xl border border-white/20"
          >
            <WichtelIcon name="user-check" size={32} />
            Jetzt starten
          </Link>
        </div>

        {/* Features Card */}
        <div className="glass-card-strong rounded-3xl p-8 md:p-10 text-left hover:shadow-frost-lg transition-all duration-300">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3 text-christmas-red">
            <WichtelIcon name="sparkles" size={40} />
            <span>Features</span>
            <WichtelIcon name="sparkles" size={40} />
          </h2>
          <ul className="space-y-4 text-base md:text-lg text-gray-700">
            <li className="flex items-start gap-3 hover:translate-x-2 transition-transform">
              <WichtelIcon name="lock" size={24} className="flex-shrink-0 text-christmas-red" />
              <span><strong className="text-gray-900">Garantierte Anonymität</strong> - auch für Organisatoren</span>
            </li>
            <li className="flex items-start gap-3 hover:translate-x-2 transition-transform">
              <WichtelIcon name="message-square" size={24} className="flex-shrink-0 text-christmas-green" />
              <span><strong className="text-gray-900">WhatsApp-Integration</strong> für schnellen Versand</span>
            </li>
            <li className="flex items-start gap-3 hover:translate-x-2 transition-transform">
              <WichtelIcon name="dices" size={24} className="flex-shrink-0 text-christmas-gold" />
              <span><strong className="text-gray-900">Magische Namen-Reveal</strong> Animation</span>
            </li>
            <li className="flex items-start gap-3 hover:translate-x-2 transition-transform">
              <WichtelIcon name="smartphone" size={24} className="flex-shrink-0 text-christmas-red" />
              <span><strong className="text-gray-900">Keine App-Installation</strong> nötig</span>
            </li>
          </ul>
        </div>

        {/* Trust badge */}
        <div className="mt-8 text-christmas-ice/70 text-sm flex items-center justify-center gap-2">
          <WichtelIcon name="gift" size={20} />
          <p>Von Wichtel-Fans für Wichtel-Fans gemacht</p>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
}
