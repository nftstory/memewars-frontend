module.exports = function ( api ) {
  api.cache( true );
  // Detect web usage (this may change in the future if Next.js changes the loader)
  const isWeb = api.caller(
    caller =>
      caller && ( caller.name === 'babel-loader' || caller.name === 'next-babel-turbo-loader' )
  );
  return {
    presets: [
      // Only use next in the browser, it'll break your native project
      isWeb && require( 'next/babel' ),
      'babel-preset-expo',
      ["nativewind/babel"]
    ].filter( Boolean ),
    plugins: [
      // Required for expo-router
      "expo-router/babel",
      [
        "@babel/plugin-transform-react-jsx",
        {
          runtime: "automatic",
          importSource: "nativewind",
        },
      ],
    ],
  };
};