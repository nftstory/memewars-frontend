const { withTamagui } = require( '@tamagui/next-plugin' )
const { join } = require( 'path' )

const withPWA = require( "@ducanh2912/next-pwa" ).default( {
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  sw: "service-worker.js",
  swcMinify: true,
} );


const boolVals = {
  true: true,
  false: false,
}

const disableExtraction =
  boolVals[process.env.DISABLE_EXTRACTION] ?? process.env.NODE_ENV === 'development'

const disableBrowserLogs =
  boolVals[process.env.DISABLE_BROWSER_LOGS] ?? process.env.NODE_ENV === 'production'

// Enabling causes FOUC on page refreshes
const optimizeCss = false // boolVals[process.env.OPTIMIZE_CSS] ?? process.env.NODE_ENV === 'production'

const plugins = [
  withPWA,
  withTamagui( {
    config: './tamagui.config.ts',
    components: ['tamagui', '@memewar/design-system'],
    importsWhitelist: ['constants.js', 'colors.js'],
    outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
    logTimings: true,
    disableExtraction,
    // experiment - reduced bundle size react-native-web
    useReactNativeWebLite: false,
    shouldExtract: ( path ) => {
      if ( path.includes( join( 'packages', 'app' ) ) ) {
        return true;
      }
    },
    excludeReactNativeWebExports: ['Switch', 'ProgressBar', 'Picker', 'CheckBox', 'Touchable'],
    platform: 'web'
  } ),
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  modularizeImports: {
    '@tamagui/lucide-icons': {
      transform: "@tamagui/lucide-icons/dist/esm/icons/{{kebabCase member}}",
      skipDefaultConversion: true,
    },
  },
  transpilePackages: [
    "react-native",
    "expo",
    "expo-image",
    'react-native-web',
    'solito',
    'react-native-passkeys',
    '@forum/passkeys',
    'webauthn-zod',
    'webauthn-server-actions',
    '@memewar/design-system',
    'react-native-gesture-handler'
  ],
  experimental: {
    optimizeCss,
    serverActions: true,
    forceSwcTransforms: true,
    scrollRestoration: true,
  },
  compiler: {
    removeConsole: disableBrowserLogs
  },
}

module.exports = function () {

  let config = nextConfig

  for ( const plugin of plugins ) {
    config = {
      ...config,
      ...plugin( config ),
    }
  }

  return config
}
