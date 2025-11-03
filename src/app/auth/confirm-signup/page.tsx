'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function ConfirmSignup() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-foreground/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <span className="text-3xl font-bold">Castify</span>
          </div>
          <CardTitle className="text-2xl text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent you a confirmation link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Important
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <p>
                    Please check your email inbox and click the confirmation link to activate your account. 
                    You won&apos;t be able to log in until you confirm your email address.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-foreground/60">
            <p className="font-medium">Didn&apos;t receive the email?</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check your spam/junk folder</li>
              <li>Wait a few minutes - emails can take time to arrive</li>
              <li>Verify you entered the correct email address</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <Link href="/auth/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Login
            </Button>
          </Link>
          <Link href="/" className="text-center text-sm text-foreground/60 hover:underline">
            Return to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

