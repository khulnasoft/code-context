'use client'

import { Code } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { TypeAnimation } from 'react-type-animation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-6 pt-6">
          <div className="flex items-center space-x-2">
            <Code className="w-10 h-10 text-primary" />
            <TypeAnimation
              sequence={[
                'CodeContext',
                1000,
              ]}
              wrapper="h2"
              cursor={true}
              repeat={Infinity}
              className="text-2xl font-bold text-primary"
            />
          </div>
          <p className="text-center text-muted-foreground">
            AI powered 2nd pair of eyes for your code reviews and issue analysis.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg" onClick={() => signIn('github')}>
            Login with GitHub
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}