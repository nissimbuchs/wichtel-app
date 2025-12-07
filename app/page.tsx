import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-christmas-red to-christmas-red-light">
      <div className="text-center text-white px-4">
        <h1 className="text-6xl font-bold mb-4">🎄 Wichtel App</h1>
        <p className="text-2xl mb-4">Wichteln leicht gemacht</p>
        <p className="text-lg mb-8 text-white/90">In unter 5 Minuten startklar!</p>

        <div className="space-y-4 max-w-md mx-auto">
          <Link
            href="/login"
            className="block bg-white text-christmas-red px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
          >
            Jetzt starten
          </Link>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-left">
            <h2 className="font-bold mb-3">✨ Features:</h2>
            <ul className="space-y-2 text-sm">
              <li>✅ Garantierte Anonymität - auch für Organisatoren</li>
              <li>✅ WhatsApp-Integration für schnellen Versand</li>
              <li>✅ Magische Namen-Reveal Animation</li>
              <li>✅ Keine App-Installation nötig</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
