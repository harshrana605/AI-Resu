import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';

const ResumeContext = createContext();

const initialResumeData = {
  title: '',
  personal: {
    firstName: '', lastName: '', jobTitle: '', address: '', phone: '', email: '',
    linkedin: '', github: '', portfolio: ''
  },
  summary: '',
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
};

export const ResumeProvider = ({ children }) => {
  const [resumeData, setResumeData] = useState(initialResumeData);
  const [themeColor, setThemeColor] = useState('#A78BFA');

  const updateResumeData = useCallback((section, data) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data,
    }));
  }, []);

  const updateNestedData = useCallback((section, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  }, []);

  const addListItem = useCallback((section, newItemData) => {
    const newItem = { ...newItemData, id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` };
    setResumeData(prev => {
      const currentSection = Array.isArray(prev[section]) ? prev[section] : [];
      return {
        ...prev,
        [section]: [...currentSection, newItem],
      };
    });
  }, []);

  const removeListItem = useCallback((section, itemId) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] || []).filter((item) => item.id !== itemId),
    }));
  }, []);

  const updateListItem = useCallback((section, itemId, updatedData) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] || []).map((item) =>
        item.id === itemId ? { ...item, ...updatedData } : item
      ),
    }));
  }, []);

  const loadResume = useCallback((data) => {
    setResumeData(currentData => ({ ...initialResumeData, ...data }));
    console.log("Resume data loaded:", data);
  }, []);

  const resetResume = useCallback(() => {
    setResumeData(initialResumeData);
    setThemeColor('#A78BFA');
    console.log("Resume data reset.");
  }, []);

  const contextValue = useMemo(() => ({
    resumeData,
    themeColor,
    setThemeColor,
    updateResumeData,
    updateNestedData,
    addListItem,
    removeListItem,
    updateListItem,
    loadResume,
    resetResume
  }), [
    resumeData,
    themeColor,
    updateResumeData,
    updateNestedData,
    addListItem,
    removeListItem,
    updateListItem,
    loadResume,
    resetResume
  ]);

  return (
    <ResumeContext.Provider value={contextValue}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => useContext(ResumeContext);