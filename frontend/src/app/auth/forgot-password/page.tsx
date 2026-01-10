"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { Mail, ArrowLeft, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsEmailSent(true)
      toast.success('Password reset email sent!')
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Theme Toggle - Fixed Position */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <BackgroundGradientAnimation />
        <BackgroundBeams />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md backdrop-blur-xl bg-card border-border shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                We've sent password reset instructions to {email}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <p className="text-foreground/80 text-sm">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button 
                    onClick={() => setIsEmailSent(false)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                  >
                    try again
                  </button>
                </p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/auth/login')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium py-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                >
                  <div className="flex items-center space-x-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Login</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <BackgroundGradientAnimation />
      <BackgroundBeams />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md backdrop-blur-xl bg-card border-border shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email address and we'll send you reset instructions
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/90">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-card/5 border-border/20 text-white placeholder:text-muted-foreground/50 focus:border-cyan-400 focus:ring-cyan-400/20"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium py-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-border/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Send Reset Email</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Link 
                href="/auth/login" 
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium text-sm"
              >
                <div className="flex items-center justify-center space-x-1">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Login</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

