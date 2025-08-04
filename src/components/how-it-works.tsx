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
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-primary"/>
            {t('howItWorks.title')}
        </CardTitle>
        <CardDescription>{t('howItWorks.description')}</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
