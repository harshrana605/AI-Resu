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
        alert('PDF Download functionality not implemented.');
        console.log("Data to potentially include in PDF:", resumeData);
    };

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/view/${resumeId}`;
        navigator.clipboard.writeText(shareUrl)
            .then(() => alert(`Share link copied (Placeholder): ${shareUrl}`))
            .catch(err => {
                console.error("Failed to copy:", err);
                alert('Failed to copy link. Share functionality requires backend.');
            });
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1 className={styles.headerTitle}>Your Resume</h1>
                <button
                    onClick={() => navigate('/dashboard')}
                    className={styles.dashboardLink}
                >
                    Back to Dashboard
                </button>
            </header>

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

            <div className={styles.previewWrapper} style={{ '--resume-theme-color': themeColor }}>
                <ResumePreview resumeData={resumeData} />
            </div>
        </div>
    );
}

export default CongratsPage;