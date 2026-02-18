import Link from 'next/link'
import { BookMarked, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <BookMarked className="h-8 w-8 text-primary" aria-hidden />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" aria-hidden />
            Back to ShikshaSahayak
          </Link>
        </Button>
      </div>
    </div>
  )
}
