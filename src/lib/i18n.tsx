"use client"
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'sw';

type Translations = {
  [lang in Language]: {
    [key: string]: any;
  };
};

export type TranslationFunction = (key: string, values?: { [key: string]: string | number }) => string;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationFunction;
}

const translations: Translations = {
  en: {
    header: {
      fairRotation: 'Fair Rotation Scheduling',
      timeSlotManagement: 'Time-Slot Management',
      excelExport: 'Excel Export',
    },
    footer: {
        builtToStreamline: 'Built to streamline daily break scheduling with fairness and efficiency.'
    },
    config: {
        title: 'Configuration',
        description: 'Set up the details for the daily schedule.',
        employeeNames: 'Employee Names/IDs',
        employeePlaceholder: 'Enter each employee on a new line...',
        numGroups: 'Number of Groups',
        selectNumGroups: 'Select number of groups',
        unavailableEmployees: 'Unavailable Employees',
        selectUnavailable: 'Select unavailable...',
        selectedUnavailable: '{{count}} selected',
        searchEmployees: 'Search employees...',
        noEmployeesFound: 'No employees found.',
        timeSlots: 'Group Time Slots',
        group: 'Group {{id}}',
        timeSlotError: 'Please ensure all times are in HH:MM format.',
        generateButton: 'Generate Daily Rotation'
    },
    schedule: {
        title: 'Generated Schedule',
        description: 'Review the groups below. You can manually move employees if needed.',
        exportButton: 'Export to Excel',
        group: 'Group {{id}}',
        noEmployees: 'No employees assigned.',
    },
    placeholder: {
        title: 'Your schedule will appear here',
        description: "Fill in the configuration details on the left and click 'Generate Daily Rotation' to create a fair and balanced schedule."
    },
    unavailable: {
        title: 'Unavailable Employees',
        description_some: 'These employees are excluded from the current rotation.',
        description_none: 'No employees are marked as unavailable.',
        select_in_config: 'Select employees in the configuration panel to mark them as unavailable.'
    },
    toast: {
        scheduleGenerated: {
            title: 'Schedule Generated',
            description: 'Successfully scheduled {{employeeCount}} employees into {{groupCount}} groups.'
        },
        generationFailed: {
            title: 'Generation Failed',
            unknownError: 'An unknown error occurred.'
        },
        exportFailed: {
            title: 'Export Failed',
            description: 'Please generate a schedule before exporting.'
        },
        employeeMoved: {
            title: 'Employee Moved',
            description: '{{employeeName}} moved from Group {{fromGroupId}} to Group {{toGroupId}}.'
        }
    },
    excel: {
        sheetName: "Schedule"
    }
  },
  sw: {
    header: {
      fairRotation: 'Upangaji wa Mzunguko Haki',
      timeSlotManagement: 'Usimamizi wa Nafasi za Wakati',
      excelExport: 'Hamisha kwenda Excel',
    },
    footer: {
        builtToStreamline: 'Imeundwa kurahisisha upangaji wa mapumziko ya kila siku kwa usawa na ufanisi.'
    },
    config: {
        title: 'Usanidi',
        description: 'Weka maelezo ya ratiba ya kila siku.',
        employeeNames: 'Majina/ID za Wafanyakazi',
        employeePlaceholder: 'Ingiza kila mfanyakazi kwenye mstari mpya...',
        numGroups: 'Idadi ya Vikundi',
        selectNumGroups: 'Chagua idadi ya vikundi',
        unavailableEmployees: 'Wafanyakazi Wasioapatikana',
        selectUnavailable: 'Chagua wasiopatikana...',
        selectedUnavailable: '{{count}} wamechaguliwa',
        searchEmployees: 'Tafuta wafanyakazi...',
        noEmployeesFound: 'Hakuna wafanyakazi waliopatikana.',
        timeSlots: 'Nafasi za Wakati za Vikundi',
        group: 'Kikundi {{id}}',
        timeSlotError: 'Tafadhali hakikisha nyakati zote ziko katika muundo wa HH:MM.',
        generateButton: 'Zalisha Mzunguko wa Kila Siku'
    },
    schedule: {
        title: 'Ratiba Iliyozalishwa',
        description: 'Pitia vikundi hapa chini. Unaweza kuhamisha wafanyakazi mwenyewe ikihitajika.',
        exportButton: 'Hamisha kwenda Excel',
        group: 'Kikundi {{id}}',
        noEmployees: 'Hakuna wafanyakazi waliopewa.',
    },
    placeholder: {
        title: 'Ratiba yako itaonekana hapa',
        description: "Jaza maelezo ya usanidi upande wa kushoto na ubofye 'Zalisha Mzunguko wa Kila Siku' ili kuunda ratiba yenye usawa."
    },
    unavailable: {
        title: 'Wafanyakazi Wasioapatikana',
        description_some: 'Wafanyakazi hawa wametengwa kwenye mzunguko wa sasa.',
        description_none: 'Hakuna wafanyakazi walioalamishwa kama wasiopatikana.',
        select_in_config: 'Chagua wafanyakazi kwenye jopo la usanidi ili kuwaweka alama kama wasiopatikana.'
    },
    toast: {
        scheduleGenerated: {
            title: 'Ratiba Imezalishwa',
            description: 'Imefanikiwa kupanga wafanyakazi {{employeeCount}} katika vikundi {{groupCount}}.'
        },
        generationFailed: {
            title: 'Uzalishaji Umeshindwa',
            unknownError: 'Kosa lisilojulikana limetokea.'
        },
        exportFailed: {
            title: 'Kushindwa Kuhamisha',
            description: 'Tafadhali zalisha ratiba kabla ya kuhamisha.'
        },
        employeeMoved: {
            title: 'Mfanyakazi Amehamishwa',
            description: '{{employeeName}} amehamishwa kutoka Kikundi {{fromGroupId}} kwenda Kikundi {{toGroupId}}.'
        }
    },
    excel: {
        sheetName: "Ratiba"
    }
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t: TranslationFunction = (key, values) => {
    const keyParts = key.split('.');
    let translation = translations[language];
    for(const part of keyParts) {
        if(translation[part]) {
            translation = translation[part];
        } else {
            return key; // Return key if not found
        }
    }
    
    let result = String(translation);

    if (values && typeof translation === 'string') {
        Object.keys(values).forEach(placeholder => {
            result = result.replace(`{{${placeholder}}}`, String(values[placeholder]));
        });
    }

    return result;
  };

  const value = { language, setLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
