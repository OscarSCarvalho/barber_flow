import Link from 'next/link'

export default function AcessoNegadoPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-[#c9a84c] mb-4">403</p>
        <h1 className="text-2xl font-semibold text-white mb-2">Acesso não autorizado</h1>
        <p className="text-gray-500 mb-8">Você não tem permissão para acessar esta página.</p>
        <Link
          href="/"
          className="inline-block bg-[#c9a84c] hover:bg-[#b8973b] text-[#1a1a1a] font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
