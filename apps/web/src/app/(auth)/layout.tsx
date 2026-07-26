export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Barber<span className="text-[#c9a84c]">Flow</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Painel de acesso profissional</p>
        </div>
        {children}
      </div>
    </div>
  )
}
