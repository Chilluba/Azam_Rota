
"use client"
import * as XLSX from 'xlsx';
import type { Group } from './scheduler';

export interface TimeSlot {
  start: string;
  end: string;
}

const formatTime = (time: string) => {
    if (!time || !/^\d{2}:\d{2}$/.test(time)) return '';
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')}${ampm}`;
};


export const exportToExcel = (schedule: Group[], timeSlots: TimeSlot[]) => {
  const wb = XLSX.utils.book_new();
  const ws_data: any[][] = [];

  schedule.forEach((group, index) => {
    if (ws_data.length > 0) {
      ws_data.push([]); // Add an empty row between groups
    }
    const timeSlot = timeSlots[group.id - 1] || { start: 'N/A', end: 'N/A' };
    const headerText = `${formatTime(timeSlot.start)} - ${formatTime(timeSlot.end)}`;
    ws_data.push([headerText, null]);

    const midIndex = Math.ceil(group.employees.length / 2);
    const col1 = group.employees.slice(0, midIndex);
    const col2 = group.employees.slice(midIndex);

    const maxRows = Math.max(col1.length, col2.length);

    for (let i = 0; i < maxRows; i++) {
      ws_data.push([
        col1[i] || null,
        col2[i] || null
      ]);
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  // Styling and Merging
  const merges = [];
  let currentRow = 0;
  for (let i = 0; i < schedule.length; i++) {
    if (i > 0) {
      currentRow++; // Account for empty row
    }
    // Merge header
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 1 } });
    
    // Style header
    const headerCellAddress = XLSX.utils.encode_cell({ r: currentRow, c: 0 });
    if (!ws[headerCellAddress]) ws[headerCellAddress] = { t: 's', v: '' };
    ws[headerCellAddress].s = {
      font: { color: { rgb: "000000" }, bold: true },
      fill: { fgColor: { rgb: "FFD966" } }, // Light Orange/Yellow
      alignment: { horizontal: "center", vertical: "center" }
    };
    
    const group = schedule[i];
    const maxRows = Math.ceil(group.employees.length / 2);

    // Style data cells
    for(let r = 1; r <= maxRows; r++) {
        const row = currentRow + r;
        const cell1Addr = XLSX.utils.encode_cell({r: row, c: 0});
        const cell2Addr = XLSX.utils.encode_cell({r: row, c: 1});

        if(ws[cell1Addr]) {
            ws[cell1Addr].s = {
                fill: { fgColor: { rgb: "DDEBF7" } }, // Light Blue
                border: {
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                }
            }
        }
         if(ws[cell2Addr]) {
            ws[cell2Addr].s = {
                fill: { fgColor: { rgb: "DDEBF7" } }, // Light Blue
                 border: {
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                }
            }
        }
    }

    currentRow += maxRows + 1;
  }
  
  ws['!merges'] = merges;
  ws['!cols'] = [{ wch: 30 }, { wch: 30 }];

  XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `AzamRota_Schedule_${today}.xlsx`);
};
