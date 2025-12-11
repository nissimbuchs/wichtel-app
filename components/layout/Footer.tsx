import Image from 'next/image'
import { WichtelIcon } from '@/components/icons/WichtelIcon'
import packageJson from '../../package.json'
import { getTranslations } from 'next-intl/server'

export async function Footer() {
  const t = await getTranslations('footer')
  // Build info from environment variables and package.json
  const version = packageJson.version
  const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev'
  const buildTag = `v${version} (${commitSha})`

  return (
    <footer className="bg-gradient-to-r from-christmas-red to-christmas-red-light mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="Wichtel App Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <div className="text-white">
              <p className="font-bold text-lg">{t('appName')}</p>
              <p className="text-white/80 text-sm">{t('tagline')}</p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-white/90 text-sm font-medium">
              {t('copyright')}
            </p>
            <a
              href="mailto:nissim@buchs.be"
              className="text-white/80 hover:text-white text-sm transition-colors hover:underline"
            >
              nissim@buchs.be
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/20 text-center">
          <p className="text-white/70 text-xs">
            {t('message')}
          </p>
          <p className="text-white/50 text-xs mt-2 font-mono">
            {t('buildLabel')}: {buildTag}
          </p>
        </div>
      </div>
    </footer>
  )
}
