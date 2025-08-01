"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';

import { Group, generateSchedule } from '@/lib/scheduler';
import { TimeSlot, exportToExcel } from '@/lib/excel';
import { cn } from '@/lib/utils';
import { Users, Clock, Trash2, Download, ChevronsUpDown, Check, X, UserX, UserCheck, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';

const formSchema = z.object({
  employees: z.string().min(1, 'Please enter at least one employee.'),
  numGroups: z.number().min(1, 'Number of groups must be at least 1.').max(10, 'Number of groups cannot exceed 10.'),
  timeSlots: z.array(z.object({
    start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  })),
  unavailableEmployees: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

export function SchedulerPage() {
  const [schedule, setSchedule] = useState<Group[] | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employees: '',
      numGroups: 3,
      timeSlots: [
        { start: '12:00', end: '12:30' },
        { start: '12:30', end: '13:00' },
        { start: '13:00', end: '13:30' },
      ],
      unavailableEmployees: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "timeSlots",
  });
  
  const numGroups = form.watch('numGroups');
  const employeeStr = form.watch('employees');
  
  const allEmployees = useMemo(() => {
    return Array.from(new Set(employeeStr.split('\n').map(e => e.trim()).filter(Boolean))).sort();
  }, [employeeStr]);
  
  useEffect(() => {
    const currentSlots = form.getValues('timeSlots').length;
    if (currentSlots < numGroups) {
      for (let i = currentSlots; i < numGroups; i++) {
        append({ start: '00:00', end: '00:00' });
      }
    } else if (currentSlots > numGroups) {
      for (let i = currentSlots; i > numGroups; i--) {
        remove(i - 1);
      }
    }
  }, [numGroups, append, remove, form]);

  const onSubmit = (data: FormValues) => {
    try {
      const employees = Array.from(new Set(data.employees.split('\n').map(e => e.trim()).filter(Boolean)));
      const newSchedule = generateSchedule(employees, data.numGroups, data.unavailableEmployees);
      setSchedule(newSchedule);
      toast({
          title: t('toast.scheduleGenerated.title'),
          description: t('toast.scheduleGenerated.description', { 
            employeeCount: employees.length - data.unavailableEmployees.length,
            groupCount: data.numGroups 
          }),
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: t('toast.generationFailed.title'),
        description: error instanceof Error ? error.message : t('toast.generationFailed.unknownError'),
      });
    }
  };

  const handleExport = () => {
    if (!schedule) {
        toast({
            variant: "destructive",
            title: t('toast.exportFailed.title'),
            description: t('toast.exportFailed.description'),
        });
        return;
    };
    const timeSlots = form.getValues('timeSlots');
    exportToExcel(schedule, timeSlots, t);
  };
  
  const handleMoveEmployee = (employeeName: string, fromGroupId: number, toGroupId: number) => {
    if (!schedule) return;

    const newSchedule = schedule.map(group => ({ ...group, employees: [...group.employees] }));
    
    const fromGroup = newSchedule.find(g => g.id === fromGroupId);
    const toGroup = newSchedule.find(g => g.id === toGroupId);

    if (fromGroup && toGroup) {
        fromGroup.employees = fromGroup.employees.filter(e => e !== employeeName);
        toGroup.employees.push(employeeName);
        setSchedule(newSchedule);
        toast({
            title: t('toast.employeeMoved.title'),
            description: t('toast.employeeMoved.description', { employeeName, fromGroupId, toGroupId }),
        });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          <Card className="lg:col-span-2 h-fit sticky top-24 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2"><Users className="w-6 h-6 text-primary"/>{t('config.title')}</CardTitle>
              <CardDescription>{t('config.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="employees" className="font-semibold">{t('config.employeeNames')}</Label>
                <Textarea
                  id="employees"
                  placeholder={t('config.employeePlaceholder')}
                  {...form.register('employees')}
                  className="h-40 text-sm"
                />
                {form.formState.errors.employees && <p className="text-sm text-destructive">{t(form.formState.errors.employees.message as any)}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="numGroups" className="font-semibold">{t('config.numGroups')}</Label>
                  <Controller
                      control={form.control}
                      name="numGroups"
                      render={({ field }) => (
                          <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                              <SelectTrigger>
                                  <SelectValue placeholder={t('config.selectNumGroups')} />
                              </SelectTrigger>
                              <SelectContent>
                                  {[...Array(9)].map((_, i) => <SelectItem key={i+2} value={String(i+2)}>{i + 2}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">{t('config.unavailableEmployees')}</Label>
                   <Controller
                      name="unavailableEmployees"
                      control={form.control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                              <span className="truncate">
                                {field.value.length > 0 ? t('config.selectedUnavailable', { count: field.value.length }) : t('config.selectUnavailable')}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder={t('config.searchEmployees')} />
                              <CommandList>
                                <CommandEmpty>{t('config.noEmployeesFound')}</CommandEmpty>
                                <CommandGroup>
                                  {allEmployees.map((employee) => (
                                    <CommandItem
                                      key={employee}
                                      value={employee}
                                      onSelect={() => {
                                        const newValue = field.value.includes(employee)
                                          ? field.value.filter((e) => e !== employee)
                                          : [...field.value, employee];
                                        field.onChange(newValue);
                                      }}
                                    >
                                      <Check className={cn("mr-2 h-4 w-4", field.value.includes(employee) ? "opacity-100" : "opacity-0")} />
                                      {employee}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      )}
                  />
                </div>
              </div>
              
              <Separator/>

              <div className="space-y-4">
                <h3 className="text-md font-semibold font-headline">{t('config.timeSlots')}</h3>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Label className="w-24 text-sm text-muted-foreground">{t('config.group', {id: index + 1})}</Label>
                    <Input type="time" {...form.register(`timeSlots.${index}.start`)} className="text-sm"/>
                    <span className="text-muted-foreground">-</span>
                    <Input type="time" {...form.register(`timeSlots.${index}.end`)} className="text-sm"/>
                  </div>
                ))}
                {form.formState.errors.timeSlots && <p className="text-sm text-destructive">{t('config.timeSlotError')}</p>}
              </div>

            </CardContent>
            <CardFooter>
               <Button type="submit" className="w-full font-bold text-lg py-6">
                  <RotateCw className="mr-2 h-5 w-5" />
                  {t('config.generateButton')}
                </Button>
            </CardFooter>
          </Card>

          <div className="lg:col-span-3 space-y-8">
             {schedule ? (
                <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="font-headline text-2xl flex items-center gap-2"><Clock className="w-6 h-6 text-primary"/>{t('schedule.title')}</CardTitle>
                                <CardDescription>{t('schedule.description')}</CardDescription>
                            </div>
                            <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4"/>{t('schedule.exportButton')}</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <AnimatePresence>
                           {schedule.map((group, index) => (
                                <motion.div
                                    key={group.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Card className="flex flex-col h-full overflow-hidden">
                                        <CardHeader className="bg-muted/50 p-4">
                                            <CardTitle className="font-headline text-lg">{t('schedule.group', { id: group.id })}</CardTitle>
                                            <CardDescription className="text-primary font-bold text-sm">
                                                {form.getValues(`timeSlots.${index}.start`)} - {form.getValues(`timeSlots.${index}.end`)}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-2 flex-1">
                                            {group.employees.length > 0 ? (
                                                group.employees.sort().map(employee => (
                                                    <div key={employee} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                                                        <span className="font-medium">{employee}</span>
                                                        <Select onValueChange={(val) => handleMoveEmployee(employee, group.id, Number(val))} defaultValue={String(group.id)}>
                                                          <SelectTrigger className="w-28 h-8 text-xs">
                                                            <SelectValue/>
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                            {schedule.map(g => <SelectItem key={g.id} value={String(g.id)}>{t('schedule.group', { id: g.id })}</SelectItem>)}
                                                          </SelectContent>
                                                        </Select>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center pt-4">{t('schedule.noEmployees')}</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px]">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <Users className="w-12 h-12 text-primary"/>
                    </div>
                    <h3 className="text-2xl font-headline font-semibold">{t('placeholder.title')}</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        {t('placeholder.description')}
                    </p>
                </div>
            )}
            
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><UserX className="w-6 h-6 text-destructive"/>{t('unavailable.title')}</CardTitle>
                    <CardDescription>
                        {form.watch('unavailableEmployees').length > 0 
                            ? t('unavailable.description_some')
                            : t('unavailable.description_none')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {form.watch('unavailableEmployees').length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                        {form.watch('unavailableEmployees').map(emp => (
                            <span key={emp} className="flex items-center gap-1.5 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                                {emp}
                                <button type="button" onClick={() => form.setValue('unavailableEmployees', form.getValues('unavailableEmployees').filter(e => e !== emp))} className="text-muted-foreground hover:text-destructive transition-colors">
                                    <X className="w-4 h-4"/>
                                </button>
                            </span>
                        ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t('unavailable.select_in_config')}</p>
                    )}
                </CardContent>
            </Card>

          </div>
        </div>
      </form>
    </div>
  );
}
