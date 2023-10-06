import React, { useCallback, useEffect } from 'react'
import { Pressable, Text, TextInput, View } from '@ui/components/design-system'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import wretch from 'wretch'
import {} from 'rn-passkeys'

const usernameFormSchema = z.object({
  username: z.string().min(3).max(20),
})

const csrfTokenSchema = z.object({
  csrfToken: z.string(),
})

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
}

export default function SignUp() {
  const methods = useForm({ resolver: zodResolver(usernameFormSchema) })

  const onSubmit = useCallback(async () => {
    const challenge = localStorage.getItem('challenge')
    const csrfToken = localStorage.getItem('csrfToken')

    if (!challenge || !csrfToken) throw new Error('Could not find challenge or token')
  }, [])

  // - on mount init a challenge
  useEffect(() => {
    console.log('fetching token')

    // tODO: only do this if we do not have a session / redirect if the user has a session
    wretch('/api/auth/csrf')
      .headers({ 'x-challenge': 'true' })
      .get()
      .res()
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch token')

        const { csrfToken } = csrfTokenSchema.parse(await res.json())

        console.log('headers', res.headers, res.headers.getSetCookie())

        const challenge = res.headers.get('x-challenge')

        // ? too harsh throwing an error here?
        if (!challenge || !csrfToken) throw new Error('Something went wrong initing challenge')

        console.log('challenge', { challenge, csrfToken })
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
              <TextInput className="mt-3 px-2 py-1 border border-prim-950" value={value} onChangeText={onChange} />
              {error && <Text>{error.message}</Text>}
            </>
          )}
        />

        <Pressable
          className={`mt-2 py-2 rounded-sm bg-prim-700 text-white ${
            methods.formState.isSubmitting ? 'animate-pulse' : ''
          }`}
          onPress={methods.handleSubmit(onSubmit)}
        >
          <Text>{methods.formState.isSubmitting ? 'Creating...' : 'Create Account'}</Text>
        </Pressable>
      </View>
    </View>
  )
}
