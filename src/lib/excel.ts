"use client"
import * as XLSX from 'xlsx';
import type { Group } from './scheduler';

export interface TimeSlot {
  start: string;
  end: string;
}

export const exportToExcel = (schedule: Group[], timeSlots: TimeSlot[]) => {
  const worksheetData = schedule.flatMap(group => {
    const timeSlot = timeSlots[group.id - 1] || { start: 'N/A', end: 'N/A' };
    return group.employees.map(employee => ({
      'Employee Name/ID': employee,
      'Group Number': group.id,
      'Break Start Time': timeSlot.start,
      'Break End Time': timeSlot.end,
    }));
  });

  if (worksheetData.length === 0) {
    // Add a placeholder row if there's no data to export
    worksheetData.push({
      'Employee Name/ID': 'No employees scheduled',
      'Group Number': '',
      'Break Start Time': '',
      'Break End Time': '',
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule');

  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 }, // Employee Name/ID
    { wch: 15 }, // Group Number
    { wch: 20 }, // Break Start Time
    { wch: 20 }, // Break End Time
  ];

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `AzamRota_Schedule_${today}.xlsx`);
};
