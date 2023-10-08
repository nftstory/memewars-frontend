const { withTamagui } = require( '@tamagui/next-plugin' )
const { join } = require( 'path' )

const boolVals = {
  true: true,
  false: false,
}

const disableExtraction =
  boolVals[process.env.DISABLE_EXTRACTION] ?? process.env.NODE_ENV === 'development'


const plugins = [
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
        return true
      }
    },
    excludeReactNativeWebExports: ['Switch', 'ProgressBar', 'Picker', 'CheckBox', 'Touchable'],
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
      transform: `@tamagui/lucide-icons/dist/esm/icons/{{kebabCase member}}`,
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
    '@memewar/design-system',
    'react-native-gesture-handler'
  ],
  experimental: {
    // forceSwcTransforms: true,
    scrollRestoration: true,
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
