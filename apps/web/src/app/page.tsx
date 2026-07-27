import Link from 'next/link'
import Image from 'next/image'
import { Scissors, CalendarCheck, Star, Clock } from 'lucide-react'

const journeys = [
  {
    icon: CalendarCheck,
    title: 'Agendamento rápido',
    desc: 'Escolha serviço, profissional e horário em menos de 2 minutos.',
  },
  {
    icon: Scissors,
    title: 'Profissionais top',
    desc: 'Equipe qualificada pronta para te atender com excelência.',
  },
  {
    icon: Star,
    title: 'Programa fidelidade',
    desc: 'A cada 10 cortes, ganhe 1 serviço gratuito.',
  },
  {
    icon: Clock,
    title: 'Sem fila de espera',
    desc: 'Reserve com antecedência e chegue na hora certa.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Lado esquerdo ── */}
      <div className="relative lg:w-[60%] bg-[#1a1a1a] flex flex-col justify-between overflow-hidden min-h-[55vh] lg:min-h-screen">

        {/* Imagem de fundo com overlay */}
        <Image
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80"
          alt="Barbearia"
          fill
          className="object-cover object-center opacity-30"
          priority
        />

        {/* Gradiente sobre a imagem */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/60 via-transparent to-[#1a1a1a]/90 lg:bg-gradient-to-r lg:from-transparent lg:to-[#1a1a1a]/80" />

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-14">
          {/* Logo */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Barber<span className="text-[#c9a84c]">Flow</span>
            </h1>
            <p className="text-gray-400 mt-2 text-sm lg:text-base max-w-xs">
              A plataforma de agendamento que os melhores barbeiros usam.
            </p>
          </div>

          {/* Jornadas */}
          <div className="mt-10 lg:mt-0 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 max-w-lg">
            {journeys.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-[#c9a84c]/15 flex items-center justify-center">
                  <Icon size={18} className="text-[#c9a84c]" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{title}</p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Rodapé esquerdo */}
          <p className="text-gray-600 text-xs mt-8 lg:mt-0">
            © {new Date().getFullYear()} BarberFlow. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* ── Lado direito ── */}
      <div className="w-full lg:w-[40%] bg-white flex flex-col items-center justify-center px-8 py-14 lg:py-0">
        <div className="w-full max-w-xs">

          {/* Cabeçalho direito */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900">Bem-vindo!</h2>
            <p className="text-gray-500 text-sm mt-1">O que deseja fazer hoje?</p>
          </div>

          {/* Botão principal — Agendar */}
          <Link
            href="/agendar"
            className="flex items-center justify-center gap-3 w-full bg-[#c9a84c] hover:bg-[#b8973b] text-[#1a1a1a] font-bold text-base px-6 py-4 rounded-2xl transition-colors shadow-md shadow-[#c9a84c]/20"
          >
            <CalendarCheck size={20} />
            Agendar horário
          </Link>

          <p className="text-center text-xs text-gray-400 my-5">ou</p>

          {/* Botão secundário — Área profissional */}
          <Link
            href="/login"
            className="flex items-center justify-center gap-3 w-full border-2 border-[#1a1a1a] hover:bg-[#1a1a1a] text-[#1a1a1a] hover:text-white font-semibold text-base px-6 py-4 rounded-2xl transition-colors"
          >
            <Scissors size={20} />
            Área profissional
          </Link>

          {/* Info extra */}
          <div className="mt-10 space-y-3">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <Star size={15} className="text-[#c9a84c] shrink-0" />
              <p className="text-xs text-gray-600">Mais de <strong>500 agendamentos</strong> realizados</p>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <Clock size={15} className="text-[#c9a84c] shrink-0" />
              <p className="text-xs text-gray-600">Confirmação <strong>imediata</strong> por WhatsApp</p>
            </div>
          </div>
        </div>
      </div>

    </main>
  )
}
