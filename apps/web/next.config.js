const { withExpo } = require( "@expo/next-adapter" );

/** @type {import('next').NextConfig} */
const nextConfig = withExpo( {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    "react-native",
    "expo",
    'react-native-web',
    'solito',
    '@memewar/ui',
    '@expo/html-elements',
    'react-native-gesture-handler'
  ],
  experimental: {
    forceSwcTransforms: true,
  },
} );

module.exports = nextConfig;
