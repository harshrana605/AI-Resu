import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';
import { FaYoutube } from "react-icons/fa6";
import { FaReddit } from "react-icons/fa";
import { FaGithubSquare } from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";

const youtubeLogo = 'https://via.placeholder.com/100x30/CCCCCC/808080?text=YouTube';
const productHuntLogo = 'https://via.placeholder.com/120x30/CCCCCC/808080?text=ProductHunt';
const redditLogo = 'https://via.placeholder.com/80x30/CCCCCC/808080?text=reddit';
const YOUTUBE_VIDEO_ID = 'dQw4w9WgXcQ';

function LandingPage() {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const portalRoot = document.getElementById('portal-root');

  useEffect(() => {
    if (showVideoModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showVideoModal]);

  return (
    <div className={styles.pageContainer}>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link to="/" className={styles.navLogo}>
            AI Resume Builder
          </Link>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#how-it-works" className={styles.navLink}>How It Works</a>
          </div>
          <Link to="/dashboard" className={`${styles.navButton} primary`}>
            Get Started
          </Link>
        </div>
      </nav>

      <section className={styles.heroSection} id="hero">
        <div className={styles.badgeContainer}>
          <span className={styles.badge}>New</span>
          <span> Built by Harsh Rana </span>
        </div>
        <h1 className={styles.heroHeading}>
          Build Your Resume <span>With AI</span>
        </h1>
        <p className={styles.heroSubtext}>
          Effortlessly Craft a Standout Resume with Our AI-Powered Builder. Land your dream job faster.
        </p>
        <div className={styles.buttonGroup}>
          <Link to="/dashboard" className={`${styles.button} primary`}>
            Get Started Now <span aria-hidden="true">→</span>
          </Link>
          <button
            type="button"
            className={`${styles.button} secondary`}
            onClick={() => setShowVideoModal(true)}
          >
            <svg className={styles.buttonIcon} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
            Watch Demo
          </button>
        </div>
      </section>

      <section className={styles.featuredSection} id="featured">
        <div className={styles.sectionContainer}>
          <h3 className={styles.featuredHeading}>
            AS SEEN ON
          </h3>
          <div className={styles.featuredLogos}>
            <FaYoutube className={styles.featuredLogo} style={{ fontSize: '3rem' }} />
            <FaGithubSquare className={styles.featuredLogo} style={{ fontSize: '3rem' }} />
            <FaReddit className={styles.featuredLogo} style={{ fontSize: '3rem' }} />
            <RiTwitterXFill style={{ fontSize: '2.5rem' }} />
          </div>
        </div>
      </section>

      <section className={styles.howItWorksSection} id="how-it-works">
        <div className={styles.sectionContainer}>
          <h2 className={styles.howItWorksHeading}>How It Works</h2>
          <p className={styles.howItWorksSubtext}>
            Create your professional, AI-enhanced resume in just 3 simple steps.
          </p>
          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h4 className={styles.stepTitle}>Enter Details</h4>
              <p className={styles.stepDescription}>Fill in your information section by section using our intuitive forms.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h4 className={styles.stepTitle}>Enhance with AI</h4>
              <p className={styles.stepDescription}>Use AI suggestions to refine summaries, bullet points, and skills instantly.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h4 className={styles.stepTitle}>Download & Share</h4>
              <p className={styles.stepDescription}>Preview your final resume, choose a theme, and download your PDF.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.sectionContainer}>
          © {new Date().getFullYear()} AI Resume Builder. All rights reserved.
        </div>
      </footer>

      {showVideoModal && portalRoot && createPortal(
        <div className={styles.modalOverlay} onClick={() => setShowVideoModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalCloseButton}
              onClick={() => setShowVideoModal(false)}
              aria-label="Close video player"
            >
              ×
            </button>
            <div className={styles.videoWrapper}>
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>,
        portalRoot
      )}
    </div>
  );
}

export default LandingPage;