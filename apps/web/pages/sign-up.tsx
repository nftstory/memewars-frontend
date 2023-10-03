import React from "react";
import { Pressable, Text, TextInput, View } from '@ui/components/design-system'

export default function App() {
const username = ''
const creating = false
  return (
     <View className="h-full flex-center  bg-[url('/img/main-bg.png')]">
      <View className="px-4 py-6 max-w-xs flex flex-col justify-stretch">

        <Text className="text-2xl font-mono">Choose your name</Text>

        <Text>Account names are visible to others.</Text>

        <TextInput
          className="mt-3 px-2 py-1 border border-prim-950"
          value={username}
        //   oninput={(e: any) => {
        //     username = e.target.value
        //   }}
        />

        <Pressable
          className={`mt-2 py-2 rounded-sm bg-prim-700 text-white ${
            creating ? 'animate-pulse' : ''
          }`}
        //   onclick={signUp}
        >
          {creating ? 'Creating...' : 'Create Account'}
        </Pressable>
      </View>
    </View>
  );
}
