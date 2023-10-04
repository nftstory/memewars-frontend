import React from 'react'
import { Text, View, Pressable } from '@ui/components/design-system'

export default function SignInS() {
  const signingIn = false
  return (
    <View className="flex-1 items-center justify-center bg-[url('/img/main-bg.png')]">
      <View className="px-4 py-6 items-center justify-center bg-white">
        <Text className="text-3xl font-mono">memewar.army</Text>

        <View className="mt-6 flex flex-col justify-stretch w-48">
          <Pressable
            className="py-2 rounded-sm text-white bg-prim-700"
            // onclick={() => {
            //   m.route.set('/sign-up')
            // }}
          >
            <Text>Sign Up</Text>
          </Pressable>
          <Pressable
            //   signingIn ? 'animate-pulse' : ''
            className={'mt-6 py-2 rounded-sm border border-black'}
            // onclick={signIn}
          >
            <Text>{signingIn ? 'Signing in...' : 'Sign In'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
