export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07090F] flex flex-col">
      {/* Pitch grid background */}
      <div className="fixed inset-0 pitch-bg pointer-events-none" />
      {/* Green glow top */}
      <div className="fixed top-0 inset-x-0 h-64 bg-gradient-to-b from-green-600/10 to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col min-h-screen">{children}</div>
    </div>
  );
}
