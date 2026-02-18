export default function Loading() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-background" aria-live="polite" aria-busy="true">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" role="status" aria-label="Loading" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  )
}
