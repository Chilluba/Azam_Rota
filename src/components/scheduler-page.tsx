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
import { Users, Clock, Trash2, Download, ChevronsUpDown, Check, X, UserX, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    return Array.from(new Set(employeeStr.split('\n').map(e => e.trim()).filter(Boolean)));
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
    const employees = Array.from(new Set(data.employees.split('\n').map(e => e.trim()).filter(Boolean)));
    const newSchedule = generateSchedule(employees, data.numGroups, data.unavailableEmployees);
    setSchedule(newSchedule);
    toast({
        title: "Schedule Generated",
        description: `Successfully scheduled ${employees.length - data.unavailableEmployees.length} employees into ${data.numGroups} groups.`,
    });
  };

  const handleExport = () => {
    if (!schedule) {
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: "Please generate a schedule before exporting.",
        });
        return;
    };
    const timeSlots = form.getValues('timeSlots');
    exportToExcel(schedule, timeSlots);
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
    }
  };


  return (
    <div className="container py-8">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          <Card className="lg:col-span-2 h-fit sticky top-20">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Users className="w-6 h-6 text-primary"/>Configuration</CardTitle>
              <CardDescription>Set up the details for the daily schedule.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="employees">Employee Names/IDs</Label>
                <Textarea
                  id="employees"
                  placeholder="Enter each employee on a new line..."
                  {...form.register('employees')}
                  className="h-40"
                />
                {form.formState.errors.employees && <p className="text-sm text-destructive">{form.formState.errors.employees.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="numGroups">Number of Groups</Label>
                  <Controller
                      control={form.control}
                      name="numGroups"
                      render={({ field }) => (
                          <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select number of groups" />
                              </SelectTrigger>
                              <SelectContent>
                                  {[...Array(9)].map((_, i) => <SelectItem key={i+2} value={String(i+2)}>{i + 2}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Unavailable Employees</Label>
                   <Controller
                      name="unavailableEmployees"
                      control={form.control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                              <span className="truncate">
                                {field.value.length > 0 ? `${field.value.length} selected` : "Select unavailable..."}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Search employees..." />
                              <CommandList>
                                <CommandEmpty>No employees found.</CommandEmpty>
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
                <h3 className="text-md font-medium font-headline">Group Time Slots</h3>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Label className="w-20">Group {index + 1}</Label>
                    <Input type="time" {...form.register(`timeSlots.${index}.start`)} />
                    <span className="text-muted-foreground">-</span>
                    <Input type="time" {...form.register(`timeSlots.${index}.end`)} />
                  </div>
                ))}
                {form.formState.errors.timeSlots && <p className="text-sm text-destructive">Please ensure all times are in HH:MM format.</p>}
              </div>

            </CardContent>
            <CardFooter>
               <Button type="submit" className="w-full">Generate Schedule</Button>
            </CardFooter>
          </Card>

          <div className="lg:col-span-3">
             {schedule ? (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="font-headline flex items-center gap-2"><Clock className="w-6 h-6 text-primary"/>Generated Schedule</CardTitle>
                                <CardDescription>Review the groups below. You can manually move employees if needed.</CardDescription>
                            </div>
                            <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4"/>Export to Excel</Button>
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
                                    <Card className="flex flex-col h-full">
                                        <CardHeader className="bg-muted/50">
                                            <CardTitle className="font-headline text-base">Group {group.id}</CardTitle>
                                            <CardDescription className="text-primary font-semibold">
                                                {form.getValues(`timeSlots.${index}.start`)} - {form.getValues(`timeSlots.${index}.end`)}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-2 flex-1">
                                            {group.employees.length > 0 ? (
                                                group.employees.sort().map(employee => (
                                                    <div key={employee} className="flex items-center justify-between text-sm">
                                                        <span>{employee}</span>
                                                        <Select onValueChange={(val) => handleMoveEmployee(employee, group.id, Number(val))} defaultValue={String(group.id)}>
                                                          <SelectTrigger className="w-24 h-8 text-xs">
                                                            <SelectValue/>
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                            {schedule.map(g => <SelectItem key={g.id} value={String(g.id)}>Group {g.id}</SelectItem>)}
                                                          </SelectContent>
                                                        </Select>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center pt-4">No employees in this group.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <Users className="w-12 h-12 text-primary"/>
                    </div>
                    <h3 className="text-xl font-headline font-semibold">Your schedule will appear here</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        Fill in the configuration details on the left and click 'Generate Schedule' to see the magic happen.
                    </p>
                </div>
            )}
            
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><UserX className="w-6 h-6 text-destructive"/>Unavailable Employees</CardTitle>
                    <CardDescription>
                        {form.watch('unavailableEmployees').length > 0 
                            ? "These employees are excluded from the current rotation." 
                            : "No employees are marked as unavailable."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {form.watch('unavailableEmployees').length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                        {form.watch('unavailableEmployees').map(emp => (
                            <span key={emp} className="flex items-center gap-1.5 bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm">
                                {emp}
                                <button onClick={() => form.setValue('unavailableEmployees', form.getValues('unavailableEmployees').filter(e => e !== emp))}>
                                    <X className="w-3 h-3"/>
                                </button>
                            </span>
                        ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Select employees in the configuration panel to mark them as unavailable.</p>
                    )}
                </CardContent>
            </Card>

          </div>
        </div>
      </form>
    </div>
  );
}
