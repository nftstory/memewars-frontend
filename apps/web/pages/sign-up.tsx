import React, { useCallback, useEffect } from 'react'
import { Pressable, Text, TextInput, View } from '@ui/components/design-system'
import { z } from 'zod'
import { Controller } from 'react-hook-form'
import { useZodForm } from '@ui/hooks/use-zod-form'
// import * as passkey from 'react-native-passkeys'
import { getHostname } from '@utils/get-hostname'
import { getBaseUrl } from '@utils/get-base-url'
import { Passkey } from '@utils/passkey'
import { api } from '@utils/api'
import { type Base64URLString } from '@forum/passkeys'
import { asciiToBase64UrlString } from '@utils/base64-url'

const usernameFormSchema = z.object({
  username: z.string().min(3).max(20),
})

const csrfTokenSchema = z.object({
  csrfToken: z.string(),
})

const passkey = new Passkey()

export default function SignUp() {
  const methods = useZodForm({ schema: usernameFormSchema })

  const onSubmit = useCallback<Parameters<typeof methods['handleSubmit']>[0]>(async ({ username }) => {
    console.log('username', username)
    const challenge = localStorage.getItem('challenge') as Base64URLString | undefined
    const csrfToken = localStorage.getItem('csrfToken')

    if (!challenge || !csrfToken) throw new Error('Could not find challenge or token')

    console.log('hostname', getHostname())
    console.log('baseUrl', getBaseUrl())

    const result = await passkey.create({
      challenge,
      csrfToken,
      user: {
        id: asciiToBase64UrlString(username),
        name: username,
        displayName: username,
      },
      extensions: { largeBlob: { support: 'required' } },
    })

    console.log('result', result)
  }, [])

  // - on mount init a challenge
  useEffect(() => {
    // tODO: only do this if we do not have a session / redirect if the user has a session
    api
      .headers({ 'x-challenge': 'true' })
      .get('/auth/csrf')
      .res()
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch token')

        const { csrfToken } = csrfTokenSchema.parse(await res.json())

        const challenge = res.headers.get('x-challenge')

        // ? too harsh throwing an error here?
        if (!challenge || !csrfToken) throw new Error('Something went wrong initing challenge')

        // TODO: write an abstraction for storage here
        localStorage.setItem('csrfToken', csrfToken)
        localStorage.setItem('challenge', challenge)
      })
      .catch((e) => {
        console.error('failed to fetch challenge', e)
      })
  }, [])

  return (
    <View className="flex-1 items-center justify-center bg-[url('/img/main-bg.png')]">
      <View className="px-4 py-6 max-w-xs flex flex-col justify-stretch bg-white">
        <Text className="text-2xl font-mono">Choose your name</Text>

        <Text>Account names are visible to others.</Text>

        <Controller
          control={methods.control}
          rules={{ required: true }}
          name={'username'}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <TextInput
                className="mt-3 px-2 py-1 border border-prim-950"
                value={value}
                onChangeText={onChange}
                autoFocus
                autoCapitalize="none"
                autoComplete="username"
              />
              {error && <Text>{error.message}</Text>}
            </>
          )}
        />

        <Pressable
          className={`mt-2 py-2 rounded-sm bg-prim-700 ${methods.formState.isSubmitting ? 'animate-pulse' : ''}`}
          onPress={methods.handleSubmit(onSubmit)}
        >
          <Text className="text-white text-center">
            {methods.formState.isSubmitting ? 'Creating...' : 'Create Account'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
