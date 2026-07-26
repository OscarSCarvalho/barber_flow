import Link from 'next/link'

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Barber<span className="text-[#c9a84c]">Flow</span>
          </Link>
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Área profissional
          </Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
