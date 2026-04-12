import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07090F] relative">
      {/* Pitch grid background */}
      <div className="fixed inset-0 pitch-bg pointer-events-none opacity-60" />

      {/* Content */}
      <main className="relative z-10 max-w-lg mx-auto">
        {children}
      </main>

      {/* Bottom nav */}
      <BottomNav />
    </div>
  );
}
