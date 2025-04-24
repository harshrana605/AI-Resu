import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResume } from '../contexts/ResumeContext';
import ResumePreview from '../components/ResumePreview'; // Adjust path if needed
import styles from './ResumeBuilder.module.css';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''; // Get from .env

function PersonalDetailsForm() {
    const { resumeData, updateNestedData } = useResume();
    const personal = resumeData?.personal || {};
    const handleChange = (e) => {
        updateNestedData('personal', e.target.name, e.target.value);
    };

    return (
        <div>
            <h2 className={styles.sectionHeading}>Personal Details</h2>
            <p className={styles.sectionDescription}>Basic contact and profile information. Your full name, email, and target job title are recommended.</p>
            {/* Name */}
            <div className={styles.inputGroup}>
                <input type="text" name="firstName" placeholder="First Name" value={personal.firstName || ''} onChange={handleChange} className={styles.formInput} required />
                <input type="text" name="lastName" placeholder="Last Name" value={personal.lastName || ''} onChange={handleChange} className={styles.formInput} required />
            </div>
            {/* Job Title */}
            <div className={`${styles.inputGroup} ${styles.span2}`}>
                 <label htmlFor="jobTitle" className={styles.inputLabel}>Job Title / Target Role</label>
                 <input id="jobTitle" type="text" name="jobTitle" placeholder="e.g., Full Stack Developer, Marketing Manager" value={personal.jobTitle || ''} onChange={handleChange} className={styles.formInput} required/>
             </div>
            {/* Contact */}
            <div className={styles.inputGroup}>
                 <div>
                     <label htmlFor="phone" className={styles.inputLabel}>Phone</label>
                     <input id="phone" type="tel" name="phone" placeholder="e.g., +1 123-456-7890" value={personal.phone || ''} onChange={handleChange} className={styles.formInput} />
                 </div>
                 <div>
                     <label htmlFor="email" className={styles.inputLabel}>Email</label>
                     <input id="email" type="email" name="email" placeholder="e.g., your.name@email.com" value={personal.email || ''} onChange={handleChange} className={styles.formInput} required/>
                 </div>
            </div>
            {/* Address */}
             <div className={`${styles.inputGroup} ${styles.span2}`}>
                 <label htmlFor="address" className={styles.inputLabel}>Location</label>
                 <input id="address" type="text" name="address" placeholder="e.g., City, State/Country (San Francisco, CA)" value={personal.address || ''} onChange={handleChange} className={styles.formInput} />
             </div>
            {/* Links */}
            <h3 className={styles.inputLabel} style={{ marginTop: 'var(--spacing-6)', marginBottom: 'var(--spacing-2)', fontSize: '1rem', color: 'var(--text-color-light)' }}>Online Profiles (Optional)</h3>
            <div className={`${styles.inputGroup} ${styles.span2} ${styles.urlInputGroup}`}>
                 <label htmlFor="linkedin" className={styles.inputLabel}>LinkedIn Profile URL</label>
                 <input id="linkedin" type="url" name="linkedin" placeholder="https://linkedin.com/in/yourprofile" value={personal.linkedin || ''} onChange={handleChange} className={styles.formInput} />
            </div>
            <div className={`${styles.inputGroup} ${styles.span2} ${styles.urlInputGroup}`}>
                  <label htmlFor="github" className={styles.inputLabel}>GitHub Profile URL</label>
                  <input id="github" type="url" name="github" placeholder="https://github.com/yourusername" value={personal.github || ''} onChange={handleChange} className={styles.formInput} />
            </div>
            <div className={`${styles.inputGroup} ${styles.span2} ${styles.urlInputGroup}`}>
                  <label htmlFor="portfolio" className={styles.inputLabel}>Portfolio / Other URL</label>
                  <input id="portfolio" type="url" name="portfolio" placeholder="Your personal website, LeetCode, etc." value={personal.portfolio || ''} onChange={handleChange} className={styles.formInput} />
            </div>
        </div>
    );
}

// --- SummaryForm ---
function SummaryForm() {
    const { resumeData, updateResumeData } = useResume();
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState('');
    const currentSummary = resumeData?.summary || '';
    const jobTitle = resumeData?.personal?.jobTitle || '';

    const handleChange = (e) => updateResumeData('summary', e.target.value);

    const handleGenerateAI = async () => {
        // ... (API call logic) ...
        if (!API_BASE_URL) { setError("API URL not configured in frontend .env file (VITE_API_BASE_URL)."); return; }
        if (!jobTitle && !currentSummary) { setError("Please enter a Job Title or some text in the summary before using AI."); return; }

        setLoading(true); setSuggestions([]); setError('');
        const apiUrl = `${API_BASE_URL}/api/generate-summary`;
        console.log(`Calling AI Summary API: ${apiUrl}`);

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobTitle, currentSummary }),
            });
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || `Request failed with status ${response.status}`);
            }

            if (responseData.refinedSummary) {
                updateResumeData('summary', responseData.refinedSummary);
            }
            if (responseData.suggestions && Array.isArray(responseData.suggestions)) {
                setSuggestions(responseData.suggestions);
            } else {
                console.warn("Received suggestions data is not an array:", responseData.suggestions);
            }
        } catch (err) {
            console.error("AI Summary API Error:", err);
            setError(err.message || 'Failed to connect to AI service.');
        } finally {
            setLoading(false);
        }
    };

    const handleUseSuggestion = (text) => {
        updateResumeData('summary', text);
        setSuggestions([]);
    };

    const AiIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="1em" height="1em"><path d="M10 3.5a1.5 1.5 0 013 0V5a1.5 1.5 0 01-3 0V3.5zM10 3.5a1.5 1.5 0 00-3 0V5a1.5 1.5 0 003 0V3.5zM5.5 10a1.5 1.5 0 010 3H4a1.5 1.5 0 010-3h1.5zm9 0a1.5 1.5 0 010 3H16a1.5 1.5 0 010-3h-1.5zm-5 4a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0V14zm-4-4a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0V10zm8 0a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0V10z" /><path fillRule="evenodd" d="M10 1.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM0 10a10 10 0 1120 0 10 10 0 01-20 0z" clipRule="evenodd" /></svg>);

    return (
         <div>
            <h2 className={styles.sectionHeading}>Summary / Objective</h2>
            <p className={styles.sectionDescription}>A brief introduction highlighting your key qualifications and career goal. Use the AI to refine or generate ideas based on your Job Title.</p>
            <div className={styles.relativeContainer}>
                <label htmlFor="summary" className={styles.inputLabel}>Your Summary</label>
                <textarea id="summary" name="summary" placeholder="Write 2-4 sentences about your professional background, or let AI generate one based on your Job Title." value={currentSummary} onChange={handleChange} className={styles.formTextarea} rows={6} />
                <button onClick={handleGenerateAI} disabled={loading} className={`${styles.aiButton} ${styles.aiButtonTextarea}`} title="Generate or Refine Summary with AI" type="button">
                    {loading ? <div className={styles.spinner}></div> : <AiIcon />}
                    <span className={loading ? styles.srOnly : ''}>Generate AI</span>
                </button>
            </div>
            {error && <div className={styles.errorMessage}><strong>Error:</strong> {error}</div>}
            {suggestions.length > 0 && (
                <div className={styles.suggestionsContainer}>
                    <h3 className={styles.suggestionsHeading}>AI Suggestions (Click to Use)</h3>
                    {suggestions.map((suggestion, index) => (
                        <div key={index} className={styles.suggestionCard} onClick={() => handleUseSuggestion(suggestion.text)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleUseSuggestion(suggestion.text); }}>
                            <div className={styles.suggestionLevel}>{suggestion.level}</div>
                            <p className={styles.suggestionText}>{suggestion.text}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- ExperienceForm ---
function ExperienceForm() {
    const { resumeData, addListItem, removeListItem, updateListItem } = useResume();
    const experience = resumeData?.experience || [];
    const [aiLoadingId, setAiLoadingId] = useState(null);
    const [error, setError] = useState('');

    const handleAddExperience = () => {
        addListItem('experience', { title: '', company: '', city: '', state: '', startDate: '', endDate: '', summary: '' });
        setError('');
    };
    const handleChange = (id, e) => { updateListItem('experience', id, { [e.target.name]: e.target.value }); };
    const handleGenerateAI = async (id) => {
        //  (API call logic) 
         if (!API_BASE_URL) { setError("API URL not configured in frontend .env file (VITE_API_BASE_URL)."); return; }
        const item = experience.find(i => i && i.id === id);
        if (!item || !item.summary || !item.summary.trim()) { setError("Please write some initial bullet points or description before using AI enhance."); return; }

        setAiLoadingId(id); setError('');
        const apiUrl = `${API_BASE_URL}/api/enhance-experience`;
        console.log(`Calling AI Experience API for ID: ${id}`);

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobTitle: item.title || '', company: item.company || '', summary: item.summary }),
            });
            const responseData = await response.json();

            if (!response.ok) { throw new Error(responseData.error || `Request failed with status ${response.status}`); }

            if (responseData.enhancedSummary) { updateListItem('experience', id, { summary: responseData.enhancedSummary }); }
            else { console.warn("Enhanced summary missing from AI response:", responseData); setError(`AI did not return an enhanced summary for item ${item.title || id}.`); }
        } catch (err) {
            console.error("AI Experience Enhance Error:", err);
            setError(`AI Error for item ${item.title || id}: ${err.message || 'Failed to connect AI service.'}`);
        } finally { setAiLoadingId(null); }
    };

    const AiIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="1em" height="1em"><path d="M10 3.5a1.5 1.5 0 013 0V5a1.5 1.5 0 01-3 0V3.5zM10 3.5a1.5 1.5 0 00-3 0V5a1.5 1.5 0 003 0V3.5zM5.5 10a1.5 1.5 0 010 3H4a1.5 1.5 0 010-3h1.5zm9 0a1.5 1.5 0 010 3H16a1.5 1.5 0 010-3h-1.5zm-5 4a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0V14zm-4-4a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0V10zm8 0a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0V10z" /><path fillRule="evenodd" d="M10 1.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM0 10a10 10 0 1120 0 10 10 0 01-20 0z" clipRule="evenodd" /></svg>);

    return (
         <div>
            <h2 className={styles.sectionHeading}>Experience</h2>
            <p className={styles.sectionDescription}>Detail your relevant work experience, starting with the most recent. Use the AI to refine your bullet points using action verbs and the STAR method.</p>
             {error && <div className={styles.errorMessage}><strong>Error:</strong> {error}</div>}
             {experience.map((exp) => exp && (
               <div key={exp.id} className={styles.formSectionItem}>
                 <button onClick={() => removeListItem('experience', exp.id)} className={styles.removeButtonSmall} title="Remove experience" type="button">×</button>
                 <div className={styles.inputGroup}>
                    <input type="text" name="title" placeholder="Position Title" value={exp.title || ''} onChange={(e) => handleChange(exp.id, e)} className={styles.formInput} required />
                    <input type="text" name="company" placeholder="Company Name" value={exp.company || ''} onChange={(e) => handleChange(exp.id, e)} className={styles.formInput} required />
                 </div>
                 <div className={styles.inputGroup}>
                    <input type="text" name="city" placeholder="City" value={exp.city || ''} onChange={(e) => handleChange(exp.id, e)} className={styles.formInput} />
                    <input type="text" name="state" placeholder="State/Province" value={exp.state || ''} onChange={(e) => handleChange(exp.id, e)} className={styles.formInput} />
                 </div>
                 <div className={styles.inputGroup}>
                    <div>
                        <label htmlFor={`startDate-${exp.id}`} className={styles.inputLabel}>Start Date</label>
                        <input type="month" id={`startDate-${exp.id}`} name="startDate" value={exp.startDate || ''} onChange={(e) => handleChange(exp.id, e)} className={styles.formInput} required pattern="\d{4}-\d{2}" />
                    </div>
                    <div>
                        <label htmlFor={`endDate-${exp.id}`} className={styles.inputLabel}>End Date (Leave blank if current)</label>
                        <input type="month" id={`endDate-${exp.id}`} name="endDate" value={exp.endDate || ''} onChange={(e) => handleChange(exp.id, e)} className={styles.formInput} pattern="\d{4}-\d{2}"/>
                    </div>
                 </div>
                 <div className={styles.relativeContainer}>
                     <label htmlFor={`summary-${exp.id}`} className={styles.inputLabel}>Summary / Responsibilities (Use bullet points)</label>
                     <textarea id={`summary-${exp.id}`} name="summary" placeholder="• Led the team that developed feature X, resulting in a 15% increase in user engagement..." value={exp.summary || ''} onChange={(e) => handleChange(exp.id, e)} className={styles.formTextarea} rows={5}/>
                     <button onClick={() => handleGenerateAI(exp.id)} disabled={aiLoadingId === exp.id} className={`${styles.aiButton} ${styles.aiButtonTextarea}`} title="Enhance with AI (STAR Method, Action Verbs)" type="button">
                         {aiLoadingId === exp.id ? <div className={styles.spinner}></div> : <AiIcon />}
                         <span className={aiLoadingId === exp.id ? styles.srOnly : ''}>Enhance AI</span>
                     </button>
                 </div>
               </div>
             ))}
            <button onClick={handleAddExperience} className={styles.addRemoveButton} type="button">+ Add More Experience</button>
        </div>
    );
}

// --- EducationForm ---
function EducationForm() {
    const { resumeData, addListItem, removeListItem, updateListItem } = useResume();
    const education = resumeData?.education || [];
    const handleAddEducation = () => { addListItem('education', { university: '', degree: '', major: '', startDate: '', endDate: '', description: '' }); };
    const handleChange = (id, e) => { updateListItem('education', id, { [e.target.name]: e.target.value }); };

    return (
          <div>
            <h2 className={styles.sectionHeading}>Education</h2>
            <p className={styles.sectionDescription}>Add degrees, diplomas, or relevant educational programs.</p>
            {education.map((edu) => edu && (
                <div key={edu.id} className={styles.formSectionItem}>
                    <button onClick={() => removeListItem('education', edu.id)} className={styles.removeButtonSmall} title="Remove education" type="button">×</button>
                    <div className={`${styles.inputGroup} ${styles.span2}`}>
                        <input type="text" name="university" placeholder="University/Institution Name" value={edu.university || ''} onChange={(e) => handleChange(edu.id, e)} className={styles.formInput} required/>
                    </div>
                    <div className={styles.inputGroup}>
                        <input type="text" name="degree" placeholder="Degree (e.g., Bachelor of Science)" value={edu.degree || ''} onChange={(e) => handleChange(edu.id, e)} className={styles.formInput} />
                        <input type="text" name="major" placeholder="Major (e.g., Computer Science)" value={edu.major || ''} onChange={(e) => handleChange(edu.id, e)} className={styles.formInput} />
                    </div>
                    <div className={styles.inputGroup}>
                        <div>
                            <label htmlFor={`eduStartDate-${edu.id}`} className={styles.inputLabel}>Start Date</label>
                            <input type="month" id={`eduStartDate-${edu.id}`} name="startDate" value={edu.startDate || ''} onChange={(e) => handleChange(edu.id, e)} className={styles.formInput} pattern="\d{4}-\d{2}"/>
                        </div>
                        <div>
                            <label htmlFor={`eduEndDate-${edu.id}`} className={styles.inputLabel}>End Date (or Expected)</label>
                            <input type="month" id={`eduEndDate-${edu.id}`} name="endDate" value={edu.endDate || ''} onChange={(e) => handleChange(edu.id, e)} className={styles.formInput} pattern="\d{4}-\d{2}"/>
                        </div>
                    </div>
                    <div className={`${styles.inputGroup} ${styles.span2}`}>
                         <label htmlFor={`eduDesc-${edu.id}`} className={styles.inputLabel}>Description (Optional: GPA, Honors, Relevant Coursework)</label>
                         <textarea id={`eduDesc-${edu.id}`} name="description" placeholder="e.g., Magna Cum Laude, Dean's List, Thesis: ..." value={edu.description || ''} onChange={(e) => handleChange(edu.id, e)} className={styles.formTextarea} rows={3}/>
                    </div>
                </div>
            ))}
            <button onClick={handleAddEducation} className={styles.addRemoveButton} type="button">+ Add More Education</button>
        </div>
    );
}

// --- ProjectsForm ---
function ProjectsForm() {
    const { resumeData, addListItem, removeListItem, updateListItem } = useResume();
    const projects = resumeData?.projects || [];
    const [aiLoadingId, setAiLoadingId] = useState(null);
    const [error, setError] = useState('');

    const handleAddProject = () => { addListItem('projects', { title: '', tech: '', description: '', deployLink: '', sourceLink: '' }); setError(''); }
    const handleChange = (id, e) => updateListItem('projects', id, { [e.target.name]: e.target.value });
    const handleGenerateAI = async (id) => {
        // ... (API call logic) ...
        if (!API_BASE_URL) { setError("API URL not configured in frontend .env file (VITE_API_BASE_URL)."); return; }
         const item = projects.find(i => i && i.id === id);
         if (!item || !item.description || !item.description.trim()) { setError("Please write an initial description before using AI enhance."); return; }

         setAiLoadingId(id); setError('');
         const apiUrl = `${API_BASE_URL}/api/enhance-project`;
         console.log(`Calling AI Project API for ID: ${id}`);

         try {
             const response = await fetch(apiUrl, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ title: item.title || '', tech: item.tech || '', description: item.description }),
             });
             const responseData = await response.json();

             if (!response.ok) { throw new Error(responseData.error || `Request failed with status ${response.status}`); }

             if (responseData.enhancedDescription) { updateListItem('projects', id, { description: responseData.enhancedDescription }); }
             else { console.warn("Enhanced project description missing from AI response:", responseData); setError(`AI did not return an enhanced description for project ${item.title || id}.`); }
         } catch (err) {
             console.error("AI Project Enhance Error:", err);
             setError(`AI Error for project ${item.title || id}: ${err.message || 'Failed to connect AI service.'}`);
         } finally { setAiLoadingId(null); }
    };

    const AiIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="1em" height="1em"><path d="M10 3.5a1.5 1.5 0 013 0V5a1.5 1.5 0 01-3 0V3.5zM10 3.5a1.5 1.5 0 00-3 0V5a1.5 1.5 0 003 0V3.5zM5.5 10a1.5 1.5 0 010 3H4a1.5 1.5 0 010-3h1.5zm9 0a1.5 1.5 0 010 3H16a1.5 1.5 0 010-3h-1.5zm-5 4a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0V14zm-4-4a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0V10zm8 0a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0V10z" /><path fillRule="evenodd" d="M10 1.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM0 10a10 10 0 1120 0 10 10 0 01-20 0z" clipRule="evenodd" /></svg>);

    return (
        <div>
            <h2 className={styles.sectionHeading}>Projects</h2>
            <p className={styles.sectionDescription}>Showcase personal or academic projects relevant to the job. Use AI to improve descriptions.</p>
            {error && <div className={styles.errorMessage}><strong>Error:</strong> {error}</div>}
            {projects.map((proj) => proj && (
                <div key={proj.id} className={styles.formSectionItem}>
                    <button onClick={() => removeListItem('projects', proj.id)} className={styles.removeButtonSmall} title="Remove project" type="button">×</button>
                    <div className={`${styles.inputGroup} ${styles.span2}`}>
                        <input type="text" name="title" placeholder="Project Title" value={proj.title || ''} onChange={(e) => handleChange(proj.id, e)} className={styles.formInput} required/>
                    </div>
                    <div className={`${styles.inputGroup} ${styles.span2}`}>
                         <label htmlFor={`projTech-${proj.id}`} className={styles.inputLabel}>Technologies Used</label>
                         <input id={`projTech-${proj.id}`} type="text" name="tech" placeholder="e.g., React, Node.js, Python, Firebase" value={proj.tech || ''} onChange={(e) => handleChange(proj.id, e)} className={styles.formInput} />
                    </div>
                    <div className={`${styles.inputGroup} ${styles.span2} ${styles.relativeContainer}`}>
                        <label htmlFor={`projDesc-${proj.id}`} className={styles.inputLabel}>Description (Use bullet points)</label>
                        <textarea id={`projDesc-${proj.id}`} name="description" placeholder="• Developed a web app for X using Y technology..." value={proj.description || ''} onChange={(e) => handleChange(proj.id, e)} className={styles.formTextarea} rows={4}/>
                        <button onClick={() => handleGenerateAI(proj.id)} disabled={aiLoadingId === proj.id} className={`${styles.aiButton} ${styles.aiButtonTextarea}`} title="Enhance with AI (Highlight skills, challenges, impact)" type="button">
                            {aiLoadingId === proj.id ? <div className={styles.spinner}></div> : <AiIcon />}
                            <span className={aiLoadingId === proj.id ? styles.srOnly : ''}>Enhance AI</span>
                        </button>
                    </div>
                    <div className={styles.inputGroup}>
                         <div className={styles.urlInputGroup}>
                           <label htmlFor={`projDeploy-${proj.id}`} className={styles.inputLabel}>Deployed Link (Optional)</label>
                           <input id={`projDeploy-${proj.id}`} type="url" name="deployLink" placeholder="https://your-project-live.com" value={proj.deployLink || ''} onChange={(e) => handleChange(proj.id, e)} className={styles.formInput} />
                         </div>
                         <div className={styles.urlInputGroup}>
                           <label htmlFor={`projSource-${proj.id}`} className={styles.inputLabel}>Source Code Link (Optional)</label>
                           <input id={`projSource-${proj.id}`} type="url" name="sourceLink" placeholder="https://github.com/your/repo" value={proj.sourceLink || ''} onChange={(e) => handleChange(proj.id, e)} className={styles.formInput} />
                         </div>
                    </div>
                </div>
            ))}
            <button onClick={handleAddProject} className={styles.addRemoveButton} type="button">+ Add More Projects</button>
        </div>
    );
}

// --- SkillsForm ---
function SkillsForm() {
    const { resumeData, addListItem, removeListItem } = useResume();
    const skills = resumeData?.skills || [];
    const [newSkillName, setNewSkillName] = useState('');
    const [loadingAI, setLoadingAI] = useState(false);
    const [error, setError] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState([]);

    const handleAddSkill = (e) => {
        // ... (logic including preventDefault) ...
        e.preventDefault(); // IMPORTANT: Prevent form submission
        const name = newSkillName.trim();
        if (!name) return;
        if (skills.some(s => s && s.name.toLowerCase() === name.toLowerCase())) { setError(`Skill "${name}" already added.`); return; }
        addListItem('skills', { name });
        setNewSkillName(''); setError(''); setAiSuggestions([]);
    };
    const handleGenerateAISkills = async () => {
        // ... (API call logic) ...
        if (!API_BASE_URL) { setError("API URL not configured in frontend .env file (VITE_API_BASE_URL)."); return; }
        const jobTitle = resumeData?.personal?.jobTitle;
        if (!jobTitle) { setError("Please enter a Job Title in Personal Details to get relevant skill suggestions."); return; }

        setLoadingAI(true); setError(''); setAiSuggestions([]);
        const apiUrl = `${API_BASE_URL}/api/suggest-skills`;
        console.log("Calling AI Skills API");

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobTitle: jobTitle, skills: Array.isArray(skills) ? skills.map(s => s?.name || '').filter(Boolean) : [] }),
            });
            const responseData = await response.json();

            if (!response.ok) { throw new Error(responseData.error || `Request failed with status ${response.status}`); }

            if (responseData.suggestedSkills && Array.isArray(responseData.suggestedSkills)) {
                const currentSkillNamesLower = skills.map(s => s?.name?.toLowerCase() || '').filter(Boolean);
                const uniqueSuggestions = responseData.suggestedSkills.filter(s => typeof s === 'string' && !currentSkillNamesLower.includes(s.toLowerCase()));
                setAiSuggestions(uniqueSuggestions);
                if(uniqueSuggestions.length === 0 && responseData.suggestedSkills.length > 0) { setError("AI suggestions are already in your list.") }
                else if (uniqueSuggestions.length === 0) { setError("AI couldn't suggest new skills based on your job title and current list."); }
            } else { console.warn("Suggested skills missing or not an array:", responseData); setError("AI did not return valid skill suggestions."); }
        } catch (err) {
            console.error("AI Skill Suggestion Error:", err);
            setError(`AI Skill Suggestion Error: ${err.message || 'Failed to connect AI service.'}`);
        } finally { setLoadingAI(false); }
    };
    const handleAddSuggestedSkill = (skillName) => {
        // ... (logic) ...
         if (!skills.some(s => s && s.name.toLowerCase() === skillName.toLowerCase())) {
            addListItem('skills', { name: skillName });
            setAiSuggestions(prev => prev.filter(s => s !== skillName));
            setError('');
        } else {
             setError(`Skill "${skillName}" is already in your list.`);
             setAiSuggestions(prev => prev.filter(s => s !== skillName));
        }
    };

    const AiIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="1em" height="1em"><path d="M10 3.5a1.5 1.5 0 013 0V5a1.5 1.5 0 01-3 0V3.5zM10 3.5a1.5 1.5 0 00-3 0V5a1.5 1.5 0 003 0V3.5zM5.5 10a1.5 1.5 0 010 3H4a1.5 1.5 0 010-3h1.5zm9 0a1.5 1.5 0 010 3H16a1.5 1.5 0 010-3h-1.5zm-5 4a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0V14zm-4-4a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0V10zm8 0a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0V10z" /><path fillRule="evenodd" d="M10 1.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM0 10a10 10 0 1120 0 10 10 0 01-20 0z" clipRule="evenodd" /></svg>);

    return (
          <div>
            <h2 className={styles.sectionHeading}>Skills</h2>
            <p className={styles.sectionDescription}>List key technical & soft skills. Add manually, or click "AI Suggestions" (requires Job Title) to get ideas.</p>
            {error && <div className={styles.errorMessage}><strong>Info:</strong> {error}</div>}
            <form onSubmit={handleAddSkill} className={`${styles.inputGroup} ${styles.skillsAddForm}`}>
                <div className={styles.span2}>
                    <label htmlFor="newSkillInput" className={styles.inputLabel}>Add Skill</label>
                    <input id="newSkillInput" type="text" placeholder="e.g., Python, Teamwork, Project Management" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} className={styles.formInput}/>
                </div>
                <button type="submit" className="primary">Add Skill</button>
            </form>
            <div className={styles.skillsAiSuggestButtonContainer}>
                 <button onClick={handleGenerateAISkills} disabled={loadingAI} className={`${styles.iconButton} primary`} title="Get AI Skill Suggestions based on Job Title" type="button">
                    {loadingAI ? <div className={styles.spinner}></div> : <AiIcon />}
                    <span>AI Suggestions</span>
                 </button>
            </div>
            {aiSuggestions.length > 0 && (
                 <div className={styles.suggestionsContainer} style={{borderTop: 'none', paddingTop: 0}}>
                     <h3 className={styles.suggestionsHeading}>Suggested Skills (Click to Add)</h3>
                      <div className={styles.skillsList}>
                          {aiSuggestions.map((suggestion, index) => (
                             <button key={index} onClick={() => handleAddSuggestedSkill(suggestion)} className={styles.skillSuggestionItem} title={`Add skill: ${suggestion}`} type="button">
                                 <span>{suggestion}</span>
                                 <span>+</span>
                             </button>
                          ))}
                      </div>
                 </div>
             )}
            {Array.isArray(skills) && skills.length > 0 && (
                <div className={styles.skillsListContainer}>
                    <h3 className={styles.skillsListHeading}>Your Added Skills</h3>
                    <div className={styles.skillsList}>
                        {skills.filter(skill => skill).map((skill) => (
                            <div key={skill.id} className={styles.skillsListItem}>
                                <span>{skill.name}</span>
                                <button onClick={() => removeListItem('skills', skill.id)} className={styles.removeButtonSmall} title={`Remove ${skill.name}`} type="button">×</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// --- CertificationsForm ---
function CertificationsForm() {
    const { resumeData, addListItem, removeListItem, updateListItem } = useResume();
    const certifications = resumeData?.certifications || [];
    const handleAddCertification = () => { addListItem('certifications', { name: '', organization: '', date: '', link: '' }); };
    const handleChange = (id, e) => { updateListItem('certifications', id, { [e.target.name]: e.target.value }); };

    return (
         <div>
            <h2 className={styles.sectionHeading}>Certifications</h2>
            <p className={styles.sectionDescription}>List relevant certifications or licenses (optional).</p>
            {certifications.map((cert) => cert && (
                <div key={cert.id} className={styles.formSectionItem}>
                    <button onClick={() => removeListItem('certifications', cert.id)} className={styles.removeButtonSmall} title="Remove certification" type="button">×</button>
                    <div className={styles.inputGroup}>
                        <input type="text" name="name" placeholder="Certification Name (e.g., AWS Certified Solutions Architect)" value={cert.name || ''} onChange={(e) => handleChange(cert.id, e)} className={styles.formInput} required/>
                        <input type="text" name="organization" placeholder="Issuing Organization (e.g., Amazon Web Services)" value={cert.organization || ''} onChange={(e) => handleChange(cert.id, e)} className={styles.formInput} />
                    </div>
                    <div className={styles.inputGroup}>
                        <div>
                            <label htmlFor={`certDate-${cert.id}`} className={styles.inputLabel}>Completion Date</label>
                            <input type="month" id={`certDate-${cert.id}`} name="date" value={cert.date || ''} onChange={(e) => handleChange(cert.id, e)} className={styles.formInput} pattern="\d{4}-\d{2}" />
                        </div>
                         <div className={styles.urlInputGroup}>
                             <label htmlFor={`certLink-${cert.id}`} className={styles.inputLabel}>Credential Link (Optional)</label>
                             <input id={`certLink-${cert.id}`} type="url" name="link" placeholder="https://verify.your.credential" value={cert.link || ''} onChange={(e) => handleChange(cert.id, e)} className={styles.formInput} />
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={handleAddCertification} className={styles.addRemoveButton} type="button">+ Add More Certifications</button>
        </div>
    );
}

// --- AchievementsForm ---
function AchievementsForm() {
    const { resumeData, addListItem, removeListItem, updateListItem } = useResume();
    const achievements = resumeData?.achievements || [];
    const handleAddAchievement = () => { addListItem('achievements', { description: '', date: '' }); };
    const handleChange = (id, e) => { updateListItem('achievements', id, { [e.target.name]: e.target.value }); };

    return (
         <div>
            <h2 className={styles.sectionHeading}>Awards / Achievements</h2>
            <p className={styles.sectionDescription}>Include significant awards, honors, publications, or recognitions (optional).</p>
            {achievements.map((ach) => ach && (
                <div key={ach.id} className={styles.formSectionItem}>
                    <button onClick={() => removeListItem('achievements', ach.id)} className={styles.removeButtonSmall} title="Remove achievement" type="button">×</button>
                    <div className={`${styles.inputGroup} ${styles.span2}`}>
                        <label htmlFor={`achDesc-${ach.id}`} className={styles.inputLabel}>Description</label>
                        <textarea id={`achDesc-${ach.id}`} name="description" placeholder="Describe the award, honor, publication, etc." value={ach.description || ''} onChange={(e) => handleChange(ach.id, e)} className={styles.formTextarea} rows={2} required/>
                    </div>
                    <div className={`${styles.inputGroup} ${styles.span2}`}>
                        <label htmlFor={`achDate-${ach.id}`} className={styles.inputLabel}>Date Received (Optional)</label>
                        <input type="month" id={`achDate-${ach.id}`} name="date" value={ach.date || ''} onChange={(e) => handleChange(ach.id, e)} className={styles.formInput} style={{ maxWidth: '200px' }} pattern="\d{4}-\d{2}"/>
                    </div>
                </div>
            ))}
            <button onClick={handleAddAchievement} className={styles.addRemoveButton} type="button">+ Add Achievement</button>
        </div>
    );
}

// --- ReviewForm ---
function ReviewForm() {
    const { resumeData } = useResume();
    const [loadingAI, setLoadingAI] = useState(false);
    const [reviewSuggestions, setReviewSuggestions] = useState([]);
    const [error, setError] = useState('');
    const [sectionToReview, setSectionToReview] = useState('summary');

    const handleAIReview = async () => {
        // ... (API call logic) ...
         if (!API_BASE_URL) { setError("API URL not configured in frontend .env file (VITE_API_BASE_URL)."); return; }
        let textToReview = ''; let sectionDisplayName = 'Unknown';
        switch(sectionToReview) {
            case 'summary': textToReview = resumeData?.summary || ''; sectionDisplayName = 'Summary'; break;
            case 'experience': textToReview = Array.isArray(resumeData?.experience) ? resumeData.experience.filter(e => e?.summary).map(e => `Role: ${e.title || 'Untitled'}\n${e.summary}`).join('\n\n---\n\n') : ''; sectionDisplayName = 'Experience (All Entries)'; break;
            case 'projects': textToReview = Array.isArray(resumeData?.projects) ? resumeData.projects.filter(p => p?.description).map(p => `Project: ${p.title || 'Untitled'}\n${p.description}`).join('\n\n---\n\n') : ''; sectionDisplayName = 'Projects (All Entries)'; break;
            default: setError("Invalid section selected for review."); return;
        }
        if (!textToReview.trim()) { setError(`The selected section (${sectionDisplayName}) is empty. Nothing to review.`); setReviewSuggestions([]); return; }

        setLoadingAI(true); setError(''); setReviewSuggestions([]);
        const apiUrl = `${API_BASE_URL}/api/review-section`;
        console.log(`Calling AI Review API for section: ${sectionToReview}`);

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sectionName: sectionDisplayName, text: textToReview }),
            });
            const responseData = await response.json();
            if (!response.ok) { throw new Error(responseData.error || `Request failed with status ${response.status}`); }

            if (responseData.suggestions && Array.isArray(responseData.suggestions)) {
                if (responseData.suggestions.length === 0) { setReviewSuggestions([{ type: 'Info', original: '', suggestion: `No major issues found in the ${sectionDisplayName} section! Looks good.`, explanation: 'AI review complete.' }]); }
                else { setReviewSuggestions(responseData.suggestions); }
            } else { console.warn("Review suggestions missing or not an array:", responseData); setError("AI did not return valid review suggestions."); }
        } catch (err) { console.error("AI Review Error:", err); setError(`AI Review Error: ${err.message || 'Failed to connect AI service.'}`); }
        finally { setLoadingAI(false); }
    };

    const CheckIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="1em" height="1em"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>);

    return (
        <div>
            <h2 className={styles.sectionHeading}>Final Review</h2>
            <p className={styles.sectionDescription}>Use the AI checker for grammar, consistency, and tone in key sections before finishing.</p>
            <div className={styles.reviewText}>Select a section and click the button below to get AI feedback. Review the suggestions carefully. This helps ensure a polished, professional presentation. Note: AI review may take a few moments.</div>
            <div className={styles.inputGroup} style={{ maxWidth: '400px', marginBottom: 'var(--spacing-4)' }}>
                 <label htmlFor="reviewSectionSelect" className={styles.inputLabel}>Select Section to Review:</label>
                 <select id="reviewSectionSelect" value={sectionToReview} onChange={(e) => { setSectionToReview(e.target.value); setReviewSuggestions([]); setError(''); }} className={styles.formSelect} disabled={loadingAI}>
                     <option value="summary">Summary</option>
                     <option value="experience">Experience (All Entries)</option>
                     <option value="projects">Projects (All Entries)</option>
                 </select>
             </div>
            <button onClick={handleAIReview} disabled={loadingAI} className={`${styles.reviewButton} primary`} type="button">
                {loadingAI ? <div className={styles.spinner}></div> : <CheckIcon />}
                 AI Check Selected Section ({sectionToReview})
            </button>
            {error && <div className={styles.errorMessage} style={{marginTop: 'var(--spacing-4)'}}><strong>Error:</strong> {error}</div>}
            {reviewSuggestions.length > 0 && (
                <div className={`${styles.suggestionsContainer} ${styles.reviewSuggestionsContainer}`}>
                    <h3 className={styles.suggestionsHeading}>AI Review Feedback for {sectionToReview}</h3>
                    {reviewSuggestions.map((suggestion, index) => (
                        <div key={index} className={`${styles.suggestionCard} ${styles.suggestionCardReview}`}>
                            <div className={styles.suggestionType}>{suggestion.type}</div>
                             {suggestion.original && <p className={styles.suggestionOriginal}>"{suggestion.original}"</p>}
                            <p className={styles.suggestionSuggestion}>{suggestion.suggestion}</p>
                             {suggestion.explanation && <p className={styles.suggestionExplanation}>Reason: {suggestion.explanation}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- ThemeSelector (Added Black Theme) ---
function ThemeSelector() {
    const { themeColor, setThemeColor } = useResume();
    const [isOpen, setIsOpen] = useState(false);
    const themeSelectorRef = useRef(null);
    // Added Black theme option
    const themes = {
        Purple: '#A78BFA', // Default Primary
        Blue: '#60A5FA',   // Blue-400
        Green: '#4ADE80',  // Green-400
        Orange: '#FDBA74', // Orange-300
        Teal: '#5EEAD4',   // Teal-300
        Pink: '#F9A8D4',   // Pink-300
        Black: '#374151',   // Gray-400
        Red: '#F87171',    // Red-400
           // Using Gray-700 as a dark "Black" theme accent
    };
    const handleSelectTheme = (colorValue) => { setThemeColor(colorValue); setIsOpen(false); }
    useEffect(() => {
        const handleClickOutside = (event) => { if (themeSelectorRef.current && !themeSelectorRef.current.contains(event.target)) { setIsOpen(false); } };
        if (isOpen) { document.addEventListener('mousedown', handleClickOutside); } else { document.removeEventListener('mousedown', handleClickOutside); }
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, [isOpen]);
     const ThemeIcon = () => ( <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="1em" height="1em"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>);
     return (
        <div className={styles.themeSelectorContainer} ref={themeSelectorRef}>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className={styles.iconButton} aria-haspopup="true" aria-expanded={isOpen} title="Change Resume Theme Color"> <ThemeIcon /> </button>
            {isOpen && (
                <div className={styles.themeDropdown} role="menu">
                    <div className={styles.themeGrid}>
                        {/* Updated map to include Black */}
                        {Object.entries(themes).map(([name, colorValue]) => ( <button key={name} onClick={() => handleSelectTheme(colorValue)} className={`${styles.themeSwatch} ${themeColor === colorValue ? styles.themeSwatchSelected : ''}`} style={{ backgroundColor: colorValue }} title={name} role="menuitem" type="button"> <span className="sr-only">{name}</span> </button> ))}
                    </div>
                </div>
             )}
        </div>
    );
}


// --- Main Resume Builder Component ---
function ResumeBuilder() {
    const { resumeId } = useParams();
    const navigate = useNavigate();
    const { resumeData, loadResume, resetResume } = useResume(); // Get context functions
    const formPanelRef = useRef(null);

    const steps = [
        'personal', 'summary', 'experience', 'projects', 'education',
        'skills', 'certifications', 'achievements', 'review'
    ];
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    
    useEffect(() => {
        let isMounted = true;
        console.log(">>> ResumeBuilder SETUP useEffect - START. resumeId:", resumeId);
        setIsLoading(true);

        const setupResume = () => {
            try {
                 if (!resumeId || typeof resumeId !== 'string') {
                     console.error("Builder: Invalid or missing resumeId. Redirecting.");
                     if (isMounted) { resetResume(); navigate('/dashboard', { replace: true }); }
                     return;
                 }
                if (!resumeId.startsWith('new-')) {
                    console.log(`Builder: Setup for existing resume: ${resumeId}.`);
                     if (!resumeData?.personal && isMounted) {
                          console.warn(`Builder: Context seems uninitialized for existing resume ID ${resumeId}.`);
                     }
                } else {
                    console.log(`Builder: Setup for new resume: ${resumeId}.`);
                }

            } catch (error) {
                console.error("Builder setup error:", error);
                if (isMounted) { resetResume(); navigate('/dashboard', { replace: true }); }
            } finally {
                if (isMounted) {
                    console.log(">>> ResumeBuilder SETUP useEffect - Setting step index to 0.");
                    
                    setCurrentStepIndex(0);
                    setIsLoading(false);
                    console.log(">>> ResumeBuilder SETUP useEffect - END. isLoading: false");
                }
            }
        };
        setupResume();
        return () => {
            isMounted = false;
            console.log(">>> ResumeBuilder SETUP useEffect - CLEANUP.");
        };
       
    }, [resumeId, navigate, loadResume, resetResume]); 

    // Function to scroll the form panel to the top
    const scrollToTop = () => {
        if (formPanelRef.current) {
            formPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Navigation Handlers
    const handleNext = () => {
        // Validation
        if (currentStepIndex === 0) {
            const personal = resumeData?.personal;
            if (!personal?.firstName?.trim() || !personal?.lastName?.trim() || !personal?.email?.trim() || !personal?.jobTitle?.trim() ) {
                 alert("Please fill in First Name, Last Name, Email, and Job Title before proceeding.");
                 return;
            }
        }
        // Step change
        if (currentStepIndex < steps.length - 1) {
            console.log(`Moving from step ${currentStepIndex} to ${currentStepIndex + 1}`);
            setCurrentStepIndex(i => i + 1); // Update state based on previous state
            scrollToTop();
        } else {
            // Finish Action
            console.log("Attempting to finish. Final resume data:", resumeData);
            handleSaveProgress(true);
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            console.log(`Moving from step ${currentStepIndex} to ${currentStepIndex - 1}`);
            setCurrentStepIndex(i => i - 1); // Update state based on previous state
            scrollToTop();
        }
    };

    // Save Progress Handler
    const handleSaveProgress = async (navigateOnSuccess = false) => {
        console.log("Saving progress... Data:", resumeData);
        alert("Save Progress: Functionality not fully implemented."); // Placeholder
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log("Progress saved (simulated).");
            if (navigateOnSuccess) { navigate(`/congrats/${resumeId}`); }
        } catch (error) { console.error("Failed to save progress:", error); alert("Error saving progress (simulation failed)."); }
    };

   // Render Current Step
   const renderCurrentStepForm = () => {
        if (isLoading) {
            return ( <div className={styles.previewLoading}> <div className={styles.spinner}></div> <div>Loading builder...</div> </div> );
        }
        const currentStep = steps[currentStepIndex];
        switch (currentStep) {
          case 'personal': return <PersonalDetailsForm />;
          case 'summary': return <SummaryForm />;
          case 'experience': return <ExperienceForm />;
          case 'projects': return <ProjectsForm />;
          case 'education': return <EducationForm />;
          case 'skills': return <SkillsForm />;
          case 'certifications': return <CertificationsForm />;
          case 'achievements': return <AchievementsForm />;
          case 'review': return <ReviewForm />;
          default: return <div>Error: Unknown step "{currentStep}"</div>;
        }
  };

  // Calculate progress percentage
  const progressPercent = isLoading ? 0 : ((currentStepIndex + 1) / steps.length) * 100;

  
   const DashboardIcon = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="1em" height="1em"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
   const SaveIcon = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="1em" height="1em"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>;

  
  return (
    <div className={styles.builderLayout}>
      
      <div className={styles.formPanel} ref={formPanelRef}>
        <div className={styles.formContainer}>
          
          <div className={styles.topControls}>
             <div className={styles.topControlsLeft}>
                 <button onClick={() => navigate('/dashboard')} className={styles.iconButton} title="Back to Dashboard" type="button"> <DashboardIcon /> <span className="sr-only">Dashboard</span> </button>
                 <ThemeSelector />
                 <button onClick={() => handleSaveProgress(false)} className={styles.iconButton} title="Save Progress" type="button"> <SaveIcon /> <span>Save</span> </button>
             </div>
             <span className={styles.stepIndicator}> Step {currentStepIndex + 1} / {steps.length} ({steps[currentStepIndex] ? steps[currentStepIndex].charAt(0).toUpperCase() + steps[currentStepIndex].slice(1) : ''}) </span>
          </div>
           {/* Progress Bar */}
           <div className={styles.progressBarContainer}>
               <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }}></div>
           </div>
          {/* Main Form Content Area */}
          <div className={styles.formContent}>
              {renderCurrentStepForm()}
          </div>
          {/* Bottom Navigation Buttons */}
          <div className={styles.navigationButtons}>
             <button onClick={handleBack} disabled={currentStepIndex === 0 || isLoading} className="secondary" type="button"> Back </button>
             <button onClick={handleNext} disabled={isLoading} className="primary" type="button"> {currentStepIndex === steps.length - 1 ? 'Finish & View Resume' : 'Next'} {currentStepIndex < steps.length - 1 && <span aria-hidden="true"> →</span>} </button>
          </div>
        </div>
      </div> {/* End Form Panel */}

      {/* Preview Panel */}
      <div className={styles.previewPanel}>
          {(isLoading || !resumeData) ?
              <div className={styles.previewLoading}> <div className={styles.spinner}></div> <div>Loading Preview...</div> </div>
              :
              <ResumePreview resumeData={resumeData} />
          }
      </div> 
    </div> 
  );
}

export default ResumeBuilder;