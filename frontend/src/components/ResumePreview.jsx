import React from 'react';
import styles from './ResumePreview.module.css'; // Uses the updated CSS
import { useResume } from '../contexts/ResumeContext';

// --- formatDate Helper (Improved readability) ---
const formatDate = (dateString, format = 'monthyear') => {
    // ... (Keep the improved formatDate function from previous response) ...
     if (!dateString) return 'Present';
     try {
        const dateParts = dateString.split('-');
        if (dateParts.length >= 2) {
             const year = parseInt(dateParts[0]);
             const month = parseInt(dateParts[1]);
             if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
                 if (format === 'year') return year.toString();
                 const dateObj = new Date(year, month - 1);
                 const monthName = dateObj.toLocaleString('default', { month: 'short' });
                 return `${monthName} ${year}`;
             }
        }
        const date = new Date(dateString + 'T00:00:00');
        if (isNaN(date.valueOf())) { return dateString; }
         const monthName = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        if (format === 'year') return year.toString();
        return `${monthName} ${year}`;
    } catch (e) { console.error("Error formatting date:", dateString, e); return dateString; }
};

// --- formatLink Helper (Keep As Is) ---
const formatLink = (url, defaultText = 'Link') => {
    // ... (Keep formatLink function from previous response) ...
     if (!url || typeof url !== 'string') return null;
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return null;
    let displayUrl = trimmedUrl; let href = trimmedUrl;
    if (!/^https?:\/\//i.test(href)) { href = `https://${href}`; }
    try {
        const urlObj = new URL(href);
        displayUrl = (urlObj.hostname + urlObj.pathname).replace(/^www\./, '').replace(/\/$/, '');
        if (displayUrl.length > 35) { displayUrl = displayUrl.substring(0, 32) + '...'; }
    } catch (e) {
        console.warn("Could not parse URL:", trimmedUrl, e);
        displayUrl = trimmedUrl.length > 35 ? trimmedUrl.substring(0, 32) + '...' : trimmedUrl;
    }
    const linkText = displayUrl || defaultText;
    return <a href={href} target="_blank" rel="noopener noreferrer">{linkText}</a>;
};

// --- GitHub Icon Component ---
const GitHubIcon = () => (
    <svg viewBox="0 0 16 16" fill="currentColor" width="1em" height="1em" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
    </svg>
);


function ResumePreview({ resumeData }) {
    const { themeColor } = useResume();
    const themeColorStyle = { '--resume-theme-color': themeColor || '#333' };

    const initialResumeDataShape = { personal: {}, summary: '', experience: [], education: [], projects: [], skills: [], certifications: [], achievements: [] };
    const data = resumeData || initialResumeDataShape;

    const { personal = {}, summary = '', experience = [], education = [], projects = [], skills = [], certifications = [], achievements = [] } = data;

    const contactItems = [
        personal.phone,
        personal.email,
        personal.address,
        personal.linkedin ? formatLink(personal.linkedin, 'LinkedIn') : null,
        personal.github ? formatLink(personal.github, 'GitHub') : null,
        personal.portfolio ? formatLink(personal.portfolio, 'Portfolio') : null
    ].filter(item => item);

    // --- !! Placeholder Skill Categorization (Requires Data Structure Change) !! ---
    // This function attempts to group skills based on keywords.
    // A robust solution requires categories defined in the data or better AI tagging.
    const categorizeSkills = (skillList) => {
        const categories = {
            'Languages': [],
            'Frameworks & Libraries': [],
            'Databases': [],
            'Tools & Technologies': [],
            'Other': [] // Fallback
        };
        const known = {
            languages: ['java', 'python', 'javascript', 'c#', 'c++', 'sql', 'php', 'typescript', 'swift', 'kotlin', 'go', 'ruby'],
            frameworks: ['spring boot', 'angular', 'react', 'vue', 'django', 'flask', '.net', 'node.js', 'express', 'laravel', 'ruby on rails', 'vuforia', 'bootstrap'],
            databases: ['mongodb', 'mysql', 'postgresql', 'sql server', 'oracle', 'redis', 'sqlite', 'firebase', 'dynamodb'],
            tools: ['git', 'github', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'jira', 'postman', 'intellij', 'visual studio code', 'blender', 'unity', 'linux', 'figma', 'chart.js', 'cloudinary', 'razorpay']
        };

        (skillList || []).filter(skill => skill).forEach(skill => {
            const lowerSkill = skill.name.toLowerCase();
            if (known.languages.some(k => lowerSkill.includes(k))) categories['Languages'].push(skill);
            else if (known.frameworks.some(k => lowerSkill.includes(k))) categories['Frameworks & Libraries'].push(skill);
            else if (known.databases.some(k => lowerSkill.includes(k))) categories['Databases'].push(skill);
            else if (known.tools.some(k => lowerSkill.includes(k))) categories['Tools & Technologies'].push(skill);
            else categories['Other'].push(skill);
        });
        // Combine 'Other' into 'Tools & Technologies' if 'Other' is small, for cleaner look
        if (categories['Other'].length <= 2 && categories['Other'].length > 0) {
             categories['Tools & Technologies'].push(...categories['Other']);
             categories['Other'] = [];
        }
        // Only return categories that have items
        return Object.entries(categories).filter(([_, skillItems]) => skillItems.length > 0);
    };

    const categorizedSkillList = categorizeSkills(skills);
    // --- End Placeholder Skill Categorization ---


    return (
        <div className={styles.previewContainer} style={themeColorStyle}>
            <div className={styles.actualResumeContent}>

                {/* --- Header --- */}
                <div className={styles.header}>
                    {(personal?.firstName || personal?.lastName) && (
                        <h1 className={styles.name}>
                            {personal.firstName || ''} {personal.lastName || ''}
                        </h1>
                    )}
                    {/* Contact Info Below Name */}
                    {contactItems.length > 0 && (
                        <div className={styles.contactInfo}>
                           {contactItems.map((item, index) => (<span key={index}>{item}</span>))}
                        </div>
                    )}
                    {/* Optional: Job Title can go here or below name */}
                    {/* {personal?.jobTitle && <p className={styles.jobTitle}>{personal.jobTitle}</p>} */}
                </div>

                {/* --- Summary --- */}
                {summary && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Summary</h2>
                        <p className={styles.summaryText}>{summary}</p>
                    </div>
                )}

                 {/* --- Education --- */}
                {Array.isArray(education) && education.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Education</h2>
                        {education.filter(edu => edu).map((edu) => (
                            <div key={edu.id} className={styles.item}>
                                <div className={styles.itemHeader}>
                                    {/* Left side: Institution, Degree, Major */}
                                    <div>
                                        <h3 className={styles.itemTitle}>{edu.university || 'Institution'}</h3>
                                        <p className={styles.itemSubtitle}>{edu.degree || ''}{edu.major ? ` in ${edu.major}` : ''}</p>
                                    </div>
                                    {/* Right side: Dates, GPA/Percentage */}
                                    <div className={styles.itemRightInfo}>
                                        <p className={styles.itemDates}>
                                            {formatDate(edu.startDate, 'monthyear')} - {formatDate(edu.endDate, 'monthyear')}
                                        </p>
                                        {/* Example: Displaying GPA if present (assumes data structure) */}
                                        {edu.gpa && <p className={styles.itemExtra}>CGPA: {edu.gpa}</p>}
                                    </div>
                                </div>
                                {edu.description && <p className={styles.itemDescription}>{edu.description}</p>}
                            </div>
                        ))}
                    </div>
                )}


                {/* --- Experience --- */}
                {Array.isArray(experience) && experience.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Experience</h2>
                        {experience.filter(exp => exp).map((exp) => (
                            <div key={exp.id} className={styles.item}>
                                <div className={styles.itemHeader}>
                                     {/* Left side: Title, Company */}
                                    <div>
                                        <h3 className={styles.itemTitle}>{exp.title || 'Position'}</h3>
                                        <p className={styles.itemSubtitle}>{exp.company || ''}</p>
                                    </div>
                                    {/* Right side: Dates, Location */}
                                     <div className={styles.itemRightInfo}>
                                        <p className={styles.itemDates}>{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</p>
                                        <p className={styles.itemLocation}>{exp.city || ''}{(exp.city && exp.state) ? ', ' : ''}{exp.state || ''}</p>
                                     </div>
                                </div>
                                {exp.summary && (
                                   <ul className={styles.itemList}>
                                       {exp.summary.split('\n').map(line => line.trim().replace(/^•\s*/, '')).filter(line => line).map((line, i) => <li key={i}>{line}</li>)}
                                   </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                 {/* --- Projects --- */}
                {Array.isArray(projects) && projects.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Projects</h2>
                        {projects.filter(proj => proj).map((proj) => (
                            <div key={proj.id} className={styles.item}>
                                <div className={styles.itemHeader}>
                                    {/* Left side: Title, Tech */}
                                    <div>
                                        <h3 className={styles.itemTitle}>{proj.title || 'Project Title'}</h3>
                                        {proj.tech && <p className={styles.itemSubtitle}><i>{proj.tech}</i></p>}
                                    </div>
                                     {/* Right side: Links */}
                                     <div className={`${styles.itemRightInfo} ${styles.projectLinksContainer}`}>
                                        {/* Conditionally render GitHub icon and link */}
                                        {formatLink(proj.sourceLink, 'Source Code') && (
                                            <span className={styles.projectLink}>
                                                <GitHubIcon />
                                                {formatLink(proj.sourceLink, 'GitHub')}
                                            </span>
                                        )}
                                         {/* Conditionally render Deploy link */}
                                        {formatLink(proj.deployLink, 'Live Demo') && (
                                             <span className={styles.projectLink}>
                                                {formatLink(proj.deployLink, 'Live Demo')}
                                             </span>
                                         )}
                                    </div>
                                </div>
                                {proj.description && (
                                    <ul className={styles.itemList}>
                                        {proj.description.split('\n').map(line => line.trim().replace(/^•\s*/, '')).filter(line => line).map((line, i) => <li key={i}>{line}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}


                {/* --- Skills --- */}
                {/* Check if there are any categories with skills */}
                {categorizedSkillList.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Skills</h2>
                        {/* Map through the generated categories */}
                        {categorizedSkillList.map(([categoryName, skillItems]) => (
                            <div key={categoryName} className={styles.skillsCategory}>
                                <h3 className={styles.skillsCategoryTitle}>{categoryName}:</h3>
                                <p className={styles.skillsItemList}>
                                    {/* Join skill names within the category */}
                                    {skillItems.map(skill => skill.name).join(', ')}
                                </p>
                            </div>
                        ))}
                         {/* Comment explaining the limitation */}
                         {/*
                         <p style={{fontSize: '9pt', color: '#666', marginTop: 'var(--spacing-2)'}}>
                             *Skill categorization is approximate based on keywords. For precise categories, update the data structure and input form.
                         </p>
                         */}
                    </div>
                )}


                {/* --- Achievements --- */}
                {Array.isArray(achievements) && achievements.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Achievements</h2>
                         {/* Use item structure for consistency */}
                         <ul className={styles.itemList} style={{paddingLeft: 'var(--spacing-2)'}}> {/* Adjust padding */}
                            {achievements.filter(ach => ach).map((ach) => ach.description && (
                                <li key={ach.id}>
                                    {ach.description}
                                    {/* Optionally append date */}
                                    {/* {ach.date && ` (${formatDate(ach.date, 'monthyear')})`} */}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}


                {/* --- Certifications --- */}
                {Array.isArray(certifications) && certifications.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Certifications</h2>
                         {/* Use item structure without header for simple list */}
                          <ul className={styles.itemList} style={{paddingLeft: 'var(--spacing-2)'}}>
                            {certifications.filter(cert => cert).map((cert) => (
                                <li key={cert.id}>
                                    <strong>{cert.name || 'Certification Name'}</strong>
                                    {cert.organization && `, ${cert.organization}`}
                                    {cert.date && ` (${formatDate(cert.date, 'monthyear')})`}
                                    {formatLink(cert.link) && <> | {formatLink(cert.link, 'Verify')}</>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}


             </div> {/* End .actualResumeContent */}
        </div> // End .previewContainer
    );
}

export default ResumePreview;