import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

function Header({ showDashboardButton = false }) {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        AI RESUME BUILDER
      </Link>
      <div>
        {showDashboardButton ? (
          <Link
            to="/dashboard"
            className={styles.navButton}
          >
            Dashboard
          </Link>
        ) : (
           <Link
            to="/dashboard" // Point "Get Started" to dashboard now
            className={styles.navButton}
          >
            Get Started
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;