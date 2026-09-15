'use client'

import { useActionState } from 'react'
import { login, signup } from './actions'

export default function LoginPage() {
  const [loginState, loginAction, isLoginPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await login(formData)
      return res || { error: null }
    },
    { error: null } as { error: string | null }
  )

  const [signupState, signupAction, isSignupPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await signup(formData)
      return res || { error: null }
    },
    { error: null } as { error: string | null }
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome to Orlan Finance
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in or create an account to manage your finances.
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Password"
              />
            </div>
          </div>

          {(loginState?.error || signupState?.error) && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {loginState?.error || signupState?.error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              formAction={loginAction}
              disabled={isLoginPending || isSignupPending}
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {isLoginPending ? 'Signing in...' : 'Sign In'}
            </button>
            <button
              formAction={signupAction}
              disabled={isLoginPending || isSignupPending}
              className="flex w-full justify-center rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              {isSignupPending ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
