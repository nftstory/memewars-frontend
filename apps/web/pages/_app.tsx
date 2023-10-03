import 'raf/polyfill'
import 'setimmediate'

import '@styles/global.css'
// import { ScrollViewStyleReset } from 'expo-router/html';
import { Provider } from '@memewar/ui/provider'
import Head from 'next/head'
import React from 'react'
import type { SolitoAppProps } from 'solito'

function App({ Component, pageProps }: SolitoAppProps) {
  return (
    <>
      <Head>
      {/* 
          This viewport disables scaling which makes the mobile website act more like a native app.
          However this does reduce built-in accessibility. If you want to enable scaling, use this instead:
            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        */}
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1.00001,viewport-fit=cover"
        />
        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        {/* <ScrollViewStyleReset /> */}
        {/* This breaks if it is imported as above ¯\_(ツ)_/¯ */}
        <style
          id="expo-reset"
          dangerouslySetInnerHTML={{
            __html: `#root,body{display:flex}#root,body,html{width:100%;-webkit-overflow-scrolling:touch;margin:0;padding:0;min-height:100%}#root{flex-shrink:0;flex-basis:auto;flex-grow:1;flex:1}html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;height:calc(100% + env(safe-area-inset-top))}body{overflow-y:auto;overscroll-behavior-y:none;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;-ms-overflow-style:scrollbar}`,
          }}
        />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
     
        {/* Add any additional <head> elements that you want globally available on web... */}

        <title>MemeWar.Army - Mint ALL the NFTs!</title>
        <meta name="description" content="do it"/>

          {/* <!-- Favicon --> */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
        <link rel="manifest" href="/site.webmanifest"/>
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"/>
        <meta name="msapplication-TileColor" content="#da532c"/>
        <meta name="theme-color" content="#ffffff"/>


      </Head>
      <Provider>
        <Component {...pageProps} />
      </Provider>
    </>
  )
}


const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;

export default App