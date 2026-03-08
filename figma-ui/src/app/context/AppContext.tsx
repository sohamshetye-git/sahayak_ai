import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'Hindi' | 'Kannada' | 'Tamil' | 'Telugu' | 'Bengali' | 'Marathi' | 'Gujarati' | 'English';

export interface ApplicationRecord {
  id: string;
  schemeId: string;
  schemeName: string;
  schemeIcon: string;
  schemeColor: string;
  appId: string;
  status: 'In Progress' | 'Completed' | 'Pending Documents';
  method: 'online' | 'center';
  centerId?: string;
  centerName?: string;
  centerAddress?: string;
  appliedDate: string;
  progress: number;
  checkedDocs: string[];
  steps: { label: string; done: boolean; active?: boolean }[];
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  userName: string;
  setUserName: (n: string) => void;
  applications: ApplicationRecord[];
  addApplication: (app: ApplicationRecord) => void;
  updateApplication: (id: string, updates: Partial<ApplicationRecord>) => void;
}

const AppContext = createContext<AppContextType>({
  language: 'English',
  setLanguage: () => {},
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  userName: '',
  setUserName: () => {},
  applications: [],
  addApplication: () => {},
  updateApplication: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('English');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);

  const addApplication = (app: ApplicationRecord) => {
    setApplications((prev) => {
      // Don't duplicate
      if (prev.find((a) => a.schemeId === app.schemeId)) {
        return prev.map((a) => a.schemeId === app.schemeId ? app : a);
      }
      return [app, ...prev];
    });
  };

  const updateApplication = (id: string, updates: Partial<ApplicationRecord>) => {
    setApplications((prev) =>
      prev.map((a) => a.id === id ? { ...a, ...updates } : a)
    );
  };

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      isLoggedIn, setIsLoggedIn,
      userName, setUserName,
      applications, addApplication, updateApplication,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
