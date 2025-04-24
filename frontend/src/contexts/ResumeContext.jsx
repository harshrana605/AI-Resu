import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';

const ResumeContext = createContext();

// --- Updated Initial State ---
const initialResumeData = {
  title: '', // Optional title for the resume document itself
  personal: {
    firstName: '', lastName: '', jobTitle: '', address: '', phone: '', email: '',
    linkedin: '', github: '', portfolio: ''
  },
  summary: '',
  experience: [], // { id, title, company, city, state, startDate, endDate, summary }
  education: [], // { id, university, degree, major, startDate, endDate, description }
  projects: [], // { id, title, tech, description, deployLink, sourceLink }
  skills: [], // { id, name } - Simplified structure
  certifications: [], // { id, name, organization, date, link }
  achievements: [], // { id, description, date }
};

export const ResumeProvider = ({ children }) => {
  const [resumeData, setResumeData] = useState(initialResumeData);
  const [themeColor, setThemeColor] = useState('#A78BFA'); // Default Purple

  // --- State Update Functions (Wrapped in useCallback) ---

  // Update top-level fields like 'summary' or 'title'
  const updateResumeData = useCallback((section, data) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data,
    }));
  }, []); // No dependencies, function itself doesn't change

   // Function to update nested objects like 'personal'
   const updateNestedData = useCallback((section, field, value) => {
       setResumeData(prev => ({
           ...prev,
           [section]: {
               ...prev[section], // Ensure nested section exists
               [field]: value
           }
       }));
   }, []); // No dependencies

  // Add item to an array section (experience, education, etc.)
  const addListItem = useCallback((section, newItemData) => {
    const newItem = { ...newItemData, id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }; // Improved ID
    setResumeData(prev => {
        // Ensure the section is treated as an array, even if initially null/undefined
        const currentSection = Array.isArray(prev[section]) ? prev[section] : [];
        return {
            ...prev,
            [section]: [...currentSection, newItem],
        };
    });
  }, []); // No dependencies

  // Remove item from an array section
  const removeListItem = useCallback((section, itemId) => {
    setResumeData(prev => ({
      ...prev,
      // Ensure section exists and filter
      [section]: (prev[section] || []).filter((item) => item.id !== itemId),
    }));
  }, []); // No dependencies

  // Update an existing item within an array section
  const updateListItem = useCallback((section, itemId, updatedData) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] || []).map((item) =>
        item.id === itemId ? { ...item, ...updatedData } : item
      ),
    }));
  }, []); // No dependencies

  // Load a complete resume data object (e.g., from storage or dashboard)
  const loadResume = useCallback((data) => {
      // Ensure initial structure is maintained if loading partial data (basic merge)
      // You might need a deeper merge function for complex scenarios
      setResumeData(currentData => ({ ...initialResumeData, ...data }));
      // Optional: Load theme color if saved with the resume data
      // if (data.themeColor) setThemeColor(data.themeColor);
      console.log("Resume data loaded:", data);
  }, []); // No dependencies

  // Reset resume data and theme to initial state
  const resetResume = useCallback(() => {
      setResumeData(initialResumeData);
      setThemeColor('#A78BFA'); // Reset theme to default
      console.log("Resume data reset.");
  }, []); // No dependencies


  // --- Memoize the context value ---
  // This ensures the value object reference only changes if its contents actually change
  const contextValue = useMemo(() => ({
    resumeData,
    themeColor,
    setThemeColor, // Directly pass setThemeColor state setter
    updateResumeData,
    updateNestedData,
    addListItem,
    removeListItem,
    updateListItem,
    loadResume,
    resetResume
  }), [
      resumeData, // Recreate value if resumeData changes
      themeColor, // Recreate value if themeColor changes
      // The memoized functions below have stable references due to useCallback
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

// --- Custom Hook (remains the same) ---
export const useResume = () => useContext(ResumeContext);