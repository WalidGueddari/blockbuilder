import { Navbar } from '@/components/layout/NavBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 animate-pulse rounded-full bg-blue-500 blur-[10rem]" />
          <div className="absolute bottom-0 left-1/4 h-[30rem] w-[30rem] animate-pulse rounded-full bg-purple-500 blur-[10rem] delay-700" />
          <div className="absolute right-1/4 top-1/2 h-[35rem] w-[35rem] animate-pulse rounded-full bg-cyan-500 blur-[10rem] delay-1000" />
        </div>
      </div>

      <Navbar />
      <main className="relative z-0 min-h-screen md:pl-64">
        <div className="container mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
