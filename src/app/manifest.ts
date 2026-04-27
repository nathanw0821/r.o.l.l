import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'R.O.L.L | Record Of Legendary Loadouts',
    short_name: 'R.O.L.L',
    description: 'Record of legendary effects, components, and acquisition paths for Fallout 76.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f1113', // Matches your dark theme background
    theme_color: '#f3a24d',      // Matches your "Ember" accent color
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
      }
    ],
  }
}
