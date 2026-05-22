export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-black text-green-900 mb-6 text-center tracking-tight">
          PENALTY BLITZ
        </h1>
        {children}
      </div>
    </div>
  )
}
