import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../contexts/ResumeContext';
import styles from './Dashboard.module.css';

const initialResumes = [
  { id: '1', title: 'My First Resume', data: {} },
  { id: '2', title: 'Full Stack developer', data: {} },
];

function Dashboard() {
  const [resumes, setResumes] = useState(initialResumes);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const navigate = useNavigate();
  const { resetResume, loadResume } = useResume();

  const fetchResumeData = async (resumeId) => {
    console.log(`Simulating fetch for resume ID: ${resumeId}`);
    const resumePlaceholder = resumes.find(r => r.id === resumeId);
    await new Promise(resolve => setTimeout(resolve, 300));
    return resumePlaceholder?.data || null;
  };

  const handleCreateClick = () => {
    resetResume();
    setNewResumeTitle('');
    setShowCreateModal(true);
  };

  const handleCreateResume = () => {
    if (!newResumeTitle.trim()) {
        alert("Please enter a title for your new resume.");
        return;
    }

    const newId = `new-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newResumeEntry = { id: newId, title: newResumeTitle };

    console.log("TODO: Save new resume entry:", newResumeEntry);
    setResumes(prev => [...prev, newResumeEntry]);

    setShowCreateModal(false);
    navigate(`/build/${newId}`);
  };

  const handleEditResume = async (resumeId) => {
    console.log("Attempting to edit resume:", resumeId);
    try {
        const fetchedData = await fetchResumeData(resumeId);

        if (fetchedData) {
            loadResume(fetchedData);
            navigate(`/build/${resumeId}`);
        } else {
            alert(`Could not load data for resume ID: ${resumeId}. Starting fresh.`);
            resetResume();
            const resumeMeta = resumes.find(r => r.id === resumeId);
            if (resumeMeta) {
            }
            navigate(`/build/${resumeId}`);
        }
    } catch (error) {
        console.error("Error loading resume data:", error);
        alert("An error occurred while trying to load the resume.");
        resetResume();
    }
  };

  const handleOptionsClick = (e, resumeId) => {
      e.stopPropagation();
      alert(`Options for resume ${resumeId} clicked (not implemented)`);
  };

  return (
    <div className={styles.dashboardPage}>
       <header className={styles.header}>
           <h1 className={styles.headerTitle}>Dashboard</h1>
           <div className={styles.userIcon}>
              G
           </div>
       </header>

       <main className={styles.mainContent}>
          <h2 className={styles.pageTitle}>My Resumes</h2>
          <p className={styles.pageSubtitle}>Start Creating AI resume to your next Job role</p>

          <div className={styles.resumeGrid}>
             <button
                onClick={handleCreateClick}
                className={`${styles.card} ${styles.cardAddNew}`}
                aria-label="Create a new resume"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.addIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                </svg>
                <span className={styles.addText}>Create New</span>
             </button>

             {resumes.map((resume, index) => (
               <div
                 key={resume.id}
                 className={`${styles.card} ${styles.cardExisting}`}
                 style={{ borderTopColor: index % 3 === 0 ? 'var(--blue)' : index % 3 === 1 ? 'var(--red)' : 'var(--primary-color)' }}
                 onClick={() => handleEditResume(resume.id)}
                 role="button"
                 tabIndex={0}
                 onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEditResume(resume.id); }}
                 aria-label={`Edit resume: ${resume.title}`}
               >
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

       {showCreateModal && (
         <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
               <div className={styles.modalHeader}>
                 <h3 className={styles.modalTitle}>Create New Resume</h3>
                 <button onClick={() => setShowCreateModal(false)} className={styles.modalCloseButton} aria-label="Close modal">×</button>
               </div>
               <form onSubmit={(e) => { e.preventDefault(); handleCreateResume(); }}>
                   <label htmlFor="resumeTitle" className={styles.modalLabel}>Add a title for your new resume</label>
                   <input
                      type="text"
                      id="resumeTitle"
                      value={newResumeTitle}
                      onChange={(e) => setNewResumeTitle(e.target.value)}
                      placeholder="Ex. Software Engineer Resume"
                      className={styles.modalInput}
                      autoFocus
                      required
                   />
                   <div className={styles.modalActions}>
                      <button
                         type="button"
                         onClick={() => setShowCreateModal(false)}
                         className={`${styles.modalButton} ${styles.modalButtonCancel}`}
                      >
                         Cancel
                      </button>
                      <button
                         type="submit"
                         className={`${styles.modalButton} ${styles.modalButtonCreate}`}
                      >
                         Create
                      </button>
                   </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
}

export default Dashboard;