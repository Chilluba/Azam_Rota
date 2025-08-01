import { SchedulerPage } from '@/components/scheduler-page';
import { Users, Clock, Download } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-3 items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: '#0033A0' }}>
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white">
                 <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#E10600' }}></div>
              </div>
            </div>
            <h1 className="text-xl font-bold font-headline text-primary">Azam Rota</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-sans">
             <div className="hidden md:flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Fair Rotation Scheduling</span>
            </div>
             <div className="hidden lg:flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Time-Slot Management</span>
            </div>
             <div className="hidden lg:flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              <span>Excel Export</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <SchedulerPage />
      </main>

      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-center gap-4 h-24">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            Built to streamline daily break scheduling with fairness and efficiency.
          </p>
        </div>
      </footer>
    </div>
  );
}
