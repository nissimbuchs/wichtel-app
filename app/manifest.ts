import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Wichtel App - Wichteln leicht gemacht',
    short_name: 'Wichtel App',
    description: 'Wichteln mit WhatsApp - garantierte Anonymität, auch für Organisatoren. In unter 5 Minuten startklar!',
    start_url: '/',
    display: 'standalone',
    background_color: '#DC2626',
    theme_color: '#DC2626',
    icons: [
      {
        src: '/logo-icon.png',
        sizes: '123x128',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo-icon.png',
        sizes: '123x128',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
