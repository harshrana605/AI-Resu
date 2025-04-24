import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../contexts/ResumeContext'; // Import context
import styles from './Dashboard.module.css';

// Placeholder data - In a real app, fetch/load this
const initialResumes = [
  { id: '1', title: 'My First Resume', data: { /* potentially pre-filled data */ } },
  { id: '2', title: 'Full Stack developer', data: { /* potentially pre-filled data */ } },
];

function Dashboard() {
  // In a real app, fetch resumes from backend/localStorage here
  const [resumes, setResumes] = useState(initialResumes);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const navigate = useNavigate();
  const { resetResume, loadResume } = useResume(); // Get context functions

  // Placeholder: Function to simulate fetching resume data
  // Replace this with your actual data fetching logic
  const fetchResumeData = async (resumeId) => {
    console.log(`Simulating fetch for resume ID: ${resumeId}`);
    // Find the resume in our placeholder data
    const resumePlaceholder = resumes.find(r => r.id === resumeId);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return resumePlaceholder?.data || null; // Return the placeholder data or null if not found
  };

  // Handler when the "Create New" card/button is clicked
  const handleCreateClick = () => {
    // 1. Reset the resume context state to ensure a clean slate
    resetResume();
    // 2. Clear the title input field for the modal
    setNewResumeTitle('');
    // 3. Show the modal to enter the new resume title
    setShowCreateModal(true);
  };

  // Handler when the "Create" button in the modal is clicked
  const handleCreateResume = () => {
    // Basic validation
    if (!newResumeTitle.trim()) {
        alert("Please enter a title for your new resume.");
        return;
    }

    // 1. Generate a temporary ID (replace with ID from backend)
    const newId = `new-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newResumeEntry = { id: newId, title: newResumeTitle };

    // 2. TODO: Save the new resume entry (title and ID) to your backend/localStorage
    console.log("TODO: Save new resume entry:", newResumeEntry);
    // Example: await saveNewResumeMeta({ id: newId, title: newResumeTitle });

    // 3. Update the local state to show the new card immediately (temporary)
    setResumes(prev => [...prev, newResumeEntry]);

    // 4. Close the modal
    setShowCreateModal(false);

    // 5. Navigate to the builder for the new resume.
    //    The context is already reset thanks to handleCreateClick.
    navigate(`/build/${newId}`);
  };

  // Handler when an existing resume card is clicked
  const handleEditResume = async (resumeId) => {
    console.log("Attempting to edit resume:", resumeId);
    try {
        // 1. Fetch the full data for the selected resume
        const fetchedData = await fetchResumeData(resumeId); // Use placeholder fetch

        if (fetchedData) {
            // 2. Load the fetched data into the resume context
            loadResume(fetchedData);
            // 3. Navigate to the builder page for this resume ID
            navigate(`/build/${resumeId}`);
        } else {
            // If data fetching fails or returns null
            alert(`Could not load data for resume ID: ${resumeId}. Starting fresh.`);
            // Ensure context is clear if load fails, before navigating
            resetResume();
             // Optionally find the title from the list to pre-fill if needed
            const resumeMeta = resumes.find(r => r.id === resumeId);
            if (resumeMeta) {
                 // updateResumeData('title', resumeMeta.title); // If you have a title field in context
            }
            navigate(`/build/${resumeId}`); // Still navigate, but with fresh state
        }
    } catch (error) {
        console.error("Error loading resume data:", error);
        alert("An error occurred while trying to load the resume.");
        resetResume(); // Reset context on error
    }
  };

  // Handler for options button (delete, duplicate etc. - not implemented)
  const handleOptionsClick = (e, resumeId) => {
      e.stopPropagation(); // Prevent card click when clicking options
      // TODO: Implement dropdown menu for delete/duplicate etc.
      alert(`Options for resume ${resumeId} clicked (not implemented)`);
      // Example: Show a context menu or modal for actions
  };

  // --- JSX Rendering ---
  return (
    <div className={styles.dashboardPage}>
       {/* Dashboard Header */}
       <header className={styles.header}>
           <h1 className={styles.headerTitle}>Dashboard</h1>
           {/* Placeholder for User Profile Icon */}
           <div className={styles.userIcon}>
              G {/* Replace with actual user initial */}
           </div>
       </header>

       <main className={styles.mainContent}>
          <h2 className={styles.pageTitle}>My Resumes</h2>
          <p className={styles.pageSubtitle}>Start Creating AI resume to your next Job role</p>

          <div className={styles.resumeGrid}>
             {/* Create New Resume Card */}
             <button
                onClick={handleCreateClick} // Use the handler that resets context first
                className={`${styles.card} ${styles.cardAddNew}`}
                aria-label="Create a new resume"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.addIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                </svg>
                <span className={styles.addText}>Create New</span>
             </button>

             {/* Existing Resume Cards */}
             {resumes.map((resume, index) => (
               <div
                 key={resume.id}
                 // Add different border colors based on index for visual variety like screenshot
                 className={`${styles.card} ${styles.cardExisting}`}
                 // Apply dynamic border color (optional visual flair)
                 style={{ borderTopColor: index % 3 === 0 ? 'var(--blue)' : index % 3 === 1 ? 'var(--red)' : 'var(--primary-color)' }}
                 onClick={() => handleEditResume(resume.id)}
                 role="button" // Indicate clickability
                 tabIndex={0} // Make it focusable
                 onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEditResume(resume.id); }} // Keyboard accessibility
                 aria-label={`Edit resume: ${resume.title}`}
               >
                 {/* Placeholder image */}
                 <div className={styles.cardImagePlaceholder}>
                    <svg fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c1.255 0 2.443.29 3.5.804v10A7.969 7.969 0 0114.5 16c-1.255 0-2.443-.29-3.5-.804V4.804A7.968 7.968 0 0114.5 4z"></path></svg>
                 </div>
                 <div className={styles.cardFooter}>
                    <h3 className={styles.cardTitle} title={resume.title}>{resume.title}</h3>
                    <button
                        className={styles.optionsButton}
                        onClick={(e) => handleOptionsClick(e, resume.id)}
                        aria-label={`Options for ${resume.title}`}
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                    </button>
                 </div>
               </div>
             ))}
          </div>
       </main>

       {/* Create New Resume Modal */}
       {showCreateModal && (
         // Prevent modal from closing when clicking the overlay by only attaching close handler to button/explicit actions
         <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
               <div className={styles.modalHeader}>
                 <h3 className={styles.modalTitle}>Create New Resume</h3>
                 <button onClick={() => setShowCreateModal(false)} className={styles.modalCloseButton} aria-label="Close modal">×</button>
               </div>
               <form onSubmit={(e) => { e.preventDefault(); handleCreateResume(); }}> {/* Allow submitting with Enter key */}
                   <label htmlFor="resumeTitle" className={styles.modalLabel}>Add a title for your new resume</label>
                   <input
                      type="text"
                      id="resumeTitle"
                      value={newResumeTitle}
                      onChange={(e) => setNewResumeTitle(e.target.value)}
                      placeholder="Ex. Software Engineer Resume"
                      className={styles.modalInput}
                      autoFocus // Focus input when modal opens
                      required // Add basic required validation
                   />
                   <div className={styles.modalActions}>
                      <button
                         type="button" // Explicitly type button to prevent form submission
                         onClick={() => setShowCreateModal(false)}
                         className={`${styles.modalButton} ${styles.modalButtonCancel}`}
                      >
                         Cancel
                      </button>
                      <button
                         type="submit" // Submit button for the form
                         className={`${styles.modalButton} ${styles.modalButtonCreate}`}
                      >
                         Create
                      </button>
                   </div>
               </form> {/* End Form */}
            </div>
         </div>
       )}
    </div>
  );
}

export default Dashboard;