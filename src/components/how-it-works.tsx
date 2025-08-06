"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import { BookOpenCheck } from "lucide-react";

export function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    { id: 'step1', icon: '1️⃣' },
    { id: 'step2', icon: '2️⃣' },
    { id: 'step3', icon: '3️⃣' },
    { id: 'step4', icon: '4️⃣' },
  ];

  return (
    <Accordion type="single" collapsible className="w-full mb-8 shadow-lg rounded-lg border">
      <AccordionItem value="how-it-works" className="border-0">
        <AccordionTrigger className="hover:no-underline p-6">
          <div className="flex flex-col items-start text-left">
             <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <BookOpenCheck className="w-6 h-6 text-primary"/>
                {t('howItWorks.title')}
            </CardTitle>
            <CardDescription className="pt-1.5">{t('howItWorks.description')}</CardDescription>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="px-6 pb-6">
            <Accordion type="single" collapsible className="w-full">
              {steps.map(step => (
                <AccordionItem key={step.id} value={step.id}>
                  <AccordionTrigger className="font-semibold font-headline text-md hover:no-underline">
                     <div className="flex items-center gap-3">
                        <span className="text-xl">{step.icon}</span>
                        {t(`howItWorks.${step.id}.title`)}
                     </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pl-12">
                    {t(`howItWorks.${step.id}.description`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
