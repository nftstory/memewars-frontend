const { withExpo } = require( "@expo/next-adapter" );

/** @type {import('next').NextConfig} */
const nextConfig = withExpo( {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    "react-native",
    "expo",
    "expo-image",
    'react-native-web',
    'solito',
    'nativewind',
    'react-native-passkeys',
    '@forum/passkeys',
    '@memewar/ui',
    '@expo/html-elements',
    'react-native-gesture-handler'
  ],
  experimental: {
    forceSwcTransforms: true,
  },
} );

module.exports = nextConfig;
