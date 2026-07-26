import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-5xl font-bold text-white mb-2">
          Barber<span className="text-[#c9a84c]">Flow</span>
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          Agende seu horário na barbearia em menos de 2 minutos.
        </p>
        <Link
          href="/agendar"
          className="inline-block bg-[#c9a84c] hover:bg-[#b8973b] text-[#1a1a1a] font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
        >
          Agendar Agora
        </Link>
        <div className="mt-6">
          <Link href="/login" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            Acesso para profissionais e administradores
          </Link>
        </div>
      </div>
    </main>
  )
}
