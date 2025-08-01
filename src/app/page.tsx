"use client"
import { SchedulerPage } from '@/components/scheduler-page';
import { Users, Clock, Download, Sun, Moon } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useLanguage } from '@/lib/i18n';
import LanguageSwitcher from '@/components/language-switcher';

export default function Home() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-3 items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white dark:bg-zinc-900">
                 <div className="w-3 h-3 rounded-sm bg-destructive"></div>
              </div>
            </div>
            <h1 className="text-xl font-bold text-primary">Azam Rota</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-sans">
             <div className="hidden md:flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{t('header.fairRotation')}</span>
            </div>
             <div className="hidden lg:flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{t('header.timeSlotManagement')}</span>
            </div>
             <div className="hidden lg:flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              <span>{t('header.excelExport')}</span>
            </div>
             <LanguageSwitcher />
             <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <SchedulerPage />
      </main>

      <footer className="py-6 md:px-8 md:py-0 bg-secondary/50">
        <div className="container flex flex-col items-center justify-center gap-4 h-24">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            {t('footer.builtToStreamline')}
          </p>
        </div>
      </footer>
    </div>
  );
}
