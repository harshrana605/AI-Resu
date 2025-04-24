import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResume } from '../contexts/ResumeContext';
import ResumePreview from '../components/ResumePreview';
import styles from './CongratsPage.module.css';

function CongratsPage() {
    const { resumeId } = useParams();
    const navigate = useNavigate();
    const { resumeData, themeColor } = useResume();

    const handleDownload = () => {
        // --- Placeholder PDF Download Logic ---
        alert('PDF Download functionality not implemented.');
        // Option 1: Use a library like jsPDF + html2canvas client-side
        // Option 2: Send data to a backend endpoint that generates and returns a PDF
        console.log("Data to potentially include in PDF:", resumeData);
    };

    const handleShare = () => {
        // --- Placeholder Share Logic ---
        // Requires backend to store and serve resumes at unique URLs
        const shareUrl = `${window.location.origin}/view/${resumeId}`; // Hypothetical URL
        navigator.clipboard.writeText(shareUrl)
            .then(() => alert(`Share link copied (Placeholder): ${shareUrl}`))
            .catch(err => {
                console.error("Failed to copy:", err);
                alert('Failed to copy link. Share functionality requires backend.');
            });
    };

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <header className={styles.header}>
                <h1 className={styles.headerTitle}>Your Resume</h1>
                 <button
                     onClick={() => navigate('/dashboard')}
                     className={styles.dashboardLink}
                 >
                     Back to Dashboard
                 </button>
            </header>

            {/* Content Box */}
            <div className={styles.contentBox}>
                <h2 className={styles.congratsHeading}>Congrats! Your Resume is ready!</h2>
                <p className={styles.congratsText}>
                   Now you are ready to download your resume. Sharing requires a backend setup which is not implemented in this example.
                </p>
                <div className={styles.actions}>
                    <button
                       onClick={handleDownload}
                       className={`${styles.actionButton} ${styles.buttonDownload}`}
                    >
                       Download PDF (Placeholder)
                    </button>
                    <button
                        onClick={handleShare}
                        className={`${styles.actionButton} ${styles.buttonShare}`}
                    >
                        Copy Share Link (Placeholder)
                    </button>
                </div>
            </div>

            {/* Final Preview */}
            <div className={styles.previewWrapper} style={{ '--resume-theme-color': themeColor }}>
                <ResumePreview resumeData={resumeData} />
            </div>
        </div>
    );
}

export default CongratsPage;