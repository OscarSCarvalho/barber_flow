import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CalendarDays, Ban, LogOut } from 'lucide-react'

const navItems = [
  { href: '/barbeiro/agenda', label: 'Minha Agenda', icon: CalendarDays },
  { href: '/barbeiro/bloquear', label: 'Bloquear Horário', icon: Ban },
]

export default async function BarbeiroLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || !['BARBER', 'ADMIN'].includes(session.user.role)) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-60 bg-[#1a1a1a] flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-gray-800">
          <span className="text-xl font-bold text-white">
            Barber<span className="text-[#c9a84c]">Flow</span>
          </span>
          <p className="text-xs text-gray-500 mt-0.5">Painel do Barbeiro</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-gray-400 font-medium truncate">{session.user.name}</p>
            <p className="text-xs text-gray-600 truncate">{session.user.email}</p>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut size={16} />
            Sair
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
