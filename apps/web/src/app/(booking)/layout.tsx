import Link from 'next/link'

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    /* height: 100dvh adapts to mobile keyboard and browser chrome */
    <div className="flex flex-col bg-gray-50" style={{ height: '100dvh' }}>
      <header className="flex-shrink-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Barber<span className="text-[#c9a84c]">Flow</span>
          </Link>
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Área profissional
          </Link>
        </div>
      </header>

      {/* flex-1 + min-h-0 is required to allow overflow-y-auto to work inside a flex child */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
