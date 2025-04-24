import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import json
import re 

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})


api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

def parse_gemini_json(gemini_text):
    """Attempts to parse JSON from Gemini response, handling potential markdown."""
    if not gemini_text:
        print("Warning: Received empty text from Gemini.")
        return None
    
    cleaned_text = re.sub(r'^```json\s*', '', gemini_text, flags=re.IGNORECASE | re.MULTILINE)
    cleaned_text = re.sub(r'\s*```$', '', cleaned_text)
    cleaned_text = cleaned_text.strip()

    

    try:
        return json.loads(cleaned_text)
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        print(f"--- Problematic Text Start ---")
        print(repr(cleaned_text)) # Use repr to see escape characters
        print(f"--- Problematic Text End ---")
        
        return None 

# --- API Routes ---

@app.route('/api/generate-summary', methods=['POST'])
def generate_summary_route():
    """
    API endpoint to generate a refined resume summary and suggestions.
    Expects JSON: {"jobTitle": "...", "currentSummary": "..."}
    Returns JSON: {"refinedSummary": "...", "suggestions": [{"level": "...", "text": "..."}, ...]}
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    job_title = data.get('jobTitle', '')
    current_summary = data.get('currentSummary', '')

    if not job_title:
        print("Warning: Generating summary without job title context.")
        

    
    prompt = f"""
    You are an expert resume writing assistant.
    Your task is to refine a resume summary and generate suggestions based on the provided draft and target job title.

    Context:
    - Target Job Title: "{job_title if job_title else 'Not Provided'}"
    - Current Summary Draft: "{current_summary if current_summary else 'No draft provided. Please write a professional summary.'}"

    Instructions:
    1. Refine the "Current Summary Draft" into a professional, concise, and impactful resume summary (2-4 sentences long). Use strong action verbs, quantify achievements where possible (even if inferring reasonable numbers/percentages based on common roles), and tailor it towards the "{job_title if job_title else 'target job'}". If no draft is provided, write a suitable summary from scratch based *only* on the job title, keeping it general if the title is broad.
    2. Generate exactly two alternative summaries in the 'suggestions' array:
        - One for a "Mid-Level" candidate (implying 3-7 years experience, focusing on quantifiable achievements and specific technical/leadership skills relevant to the job title).
        - One for a "Junior-Level" candidate (implying 0-2 years experience, focusing on transferable skills, enthusiasm, relevant projects/internships, and key technologies learned).
    3. Ensure all generated text is professional and ATS-friendly.

    Output Format:
    Return *only* a valid JSON object with the following structure. Do not include any other text, explanations, or markdown formatting around the JSON object itself. Ensure the JSON is strictly valid.
    {{
      "refinedSummary": "The single refined summary text.",
      "suggestions": [
        {{ "level": "Mid-Level", "text": "The mid-level summary text." }},
        {{ "level": "Junior-Level", "text": "The junior-level summary text." }}
      ]
    }}
    """

    try:
        print(f"--- Sending Prompt to Gemini (Summary) ---")
        # print(prompt) # Uncomment for debugging the exact prompt sent
        print(f"--- End Prompt ---")

        # Call the Gemini API
        response = model.generate_content(prompt)

        print(f"--- Received Response from Gemini (Summary) ---")
        # Use response.text safely
        raw_response_text = response.text if hasattr(response, 'text') else ''
        print(raw_response_text)
        print(f"--- End Response ---")

        # Parse the response text
        result_json = parse_gemini_json(raw_response_text)

        # Validate the parsed JSON structure
        if result_json and isinstance(result_json, dict) and \
           'refinedSummary' in result_json and isinstance(result_json['refinedSummary'], str) and \
           'suggestions' in result_json and isinstance(result_json['suggestions'], list) and \
           len(result_json['suggestions']) == 2 and \
           all(isinstance(s, dict) and 'level' in s and 'text' in s for s in result_json['suggestions']):
             print("Successfully parsed Gemini response for summary.")
             return jsonify(result_json), 200
        else:
             print("Error: Unexpected or invalid JSON structure received from Gemini for summary.")
             # Provide more context in the error response
             error_detail = "AI returned data in an unexpected format."
             if not result_json:
                 error_detail = "AI failed to return valid JSON."
             elif 'refinedSummary' not in result_json or 'suggestions' not in result_json:
                 error_detail = "AI response missing required fields ('refinedSummary', 'suggestions')."
             elif not isinstance(result_json['suggestions'], list) or len(result_json['suggestions']) != 2:
                 error_detail = "AI response 'suggestions' field is not a list of two items."

             
             if raw_response_text and not result_json:
                 return jsonify({"error": error_detail, "raw_ai_response": raw_response_text[:1000]}), 500 # Limit raw response size
             
             return jsonify({"error": error_detail, "received_structure": result_json}), 500

    except Exception as e:
        
        print(f"Error calling Gemini API or processing response for summary: {e}")
        
        return jsonify({"error": f"An unexpected error occurred while generating the summary: {str(e)}"}), 500


@app.route('/api/enhance-experience', methods=['POST'])
def enhance_experience_route():
    """
    API endpoint to enhance an experience section summary into bullet points.
    Expects JSON: {"jobTitle": "...", "company": "...", "summary": "..."}
    Returns JSON: {"enhancedSummary": "• Bullet point 1\\n• Bullet point 2..."}
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    job_title = data.get('jobTitle', '') # Job title from the experience item
    company = data.get('company', '')
    original_summary = data.get('summary', '')

    if not original_summary:
        return jsonify({"error": "No experience summary provided"}), 400

    # Construct the prompt for the Gemini model
    prompt = f"""
    You are an expert resume writing assistant specializing in crafting achievement-oriented experience bullet points.

    Context:
    - Position Title: "{job_title if job_title else 'Not Provided'}"
    - Company: "{company if company else 'Not Provided'}"
    - Original Summary/Bullet Points Draft (may contain newlines or existing bullets):
    "{original_summary}"

    Instructions:
    1. Rewrite the provided "Original Summary/Bullet Points Draft" into 3-5 impactful bullet points for a resume experience section. Each bullet point should start on a new line.
    2. Start each bullet point *strictly* with a strong action verb (e.g., Managed, Developed, Led, Increased, Reduced, Implemented, Created, Optimized, Coordinated, Analyzed).
    3. Apply the STAR method (Situation, Task, Action, Result) where applicable to structure the points.
    4. Quantify achievements with specific metrics (numbers, percentages) whenever possible based on the original text or reasonable inference for the role (e.g., "Increased sales by 15%", "Managed a budget of $X", "Reduced processing time by Y%"). If quantification isn't possible, focus on the impact, scope, or scale of the action.
    5. Ensure all points describing completed tasks are in the simple past tense.
    6. Maintain a professional and concise tone. Focus on accomplishments rather than just listing duties.
    7. Ensure the final output text contains only the rewritten bullet points, each starting with '• ' and separated by a newline character ('\\n').

    Output Format:
    Return *only* a valid JSON object with the following structure. Do not include any text before or after the JSON object. Do not use markdown formatting for the JSON structure itself. The value of "enhancedSummary" must be a single string containing the bullet points separated by '\\n'.
    {{
      "enhancedSummary": "• Rewritten bullet point 1 using past tense and action verbs.\\n• Quantified achievement where possible (e.g., Increased efficiency by 15%).\\n• Another achievement-focused bullet point applying STAR method."
    }}
    """
    try:
        print(f"--- Sending Prompt to Gemini (Experience) ---")
        
        print(f"--- End Prompt ---")

        # Call the Gemini API
        response = model.generate_content(prompt)

        print(f"--- Received Response from Gemini (Experience) ---")
        raw_response_text = response.text if hasattr(response, 'text') else ''
        print(raw_response_text)
        print(f"--- End Response ---")

        # Parse the response text
        result_json = parse_gemini_json(raw_response_text)

        # Validate the parsed JSON structure
        if result_json and isinstance(result_json, dict) and \
           'enhancedSummary' in result_json and isinstance(result_json['enhancedSummary'], str):
            enhanced_summary = result_json['enhancedSummary']
            # Basic check to ensure it looks like bullet points were attempted
            if '•' in enhanced_summary or enhanced_summary.strip() == "": # Allow empty if AI couldn't generate
                 print("Successfully parsed Gemini response for experience.")
                 
                 return jsonify(result_json), 200
            else:
                
                print("Warning: Gemini response for experience didn't contain bullet points as expected, attempting to format.")
                
                lines = [line.strip() for line in enhanced_summary.split('\n') if line.strip()]
                formatted_summary = "\n".join([f"• {line}" for line in lines])
                
                if not formatted_summary and enhanced_summary:
                    print("Warning: Formatting attempt resulted in empty string, returning original non-bulleted text.")
                    return jsonify({"enhancedSummary": enhanced_summary}), 200
                return jsonify({"enhancedSummary": formatted_summary}), 200
        else:
             print("Error: Unexpected or invalid JSON structure from Gemini for experience.")
             error_detail = "AI returned data in an unexpected format for experience."
             if not result_json:
                 error_detail = "AI failed to return valid JSON for experience."
             elif 'enhancedSummary' not in result_json:
                 error_detail = "AI response missing required 'enhancedSummary' field."

             if raw_response_text and not result_json:
                 return jsonify({"error": error_detail, "raw_ai_response": raw_response_text[:1000]}), 500
             return jsonify({"error": error_detail, "received_structure": result_json}), 500

    except Exception as e:
        print(f"Error calling Gemini API or processing response for experience: {e}")
        # import traceback
        # traceback.print_exc()
        return jsonify({"error": f"An unexpected error occurred while enhancing experience: {str(e)}"}), 500


@app.route('/api/enhance-project', methods=['POST'])
def enhance_project_route():
    """
    API endpoint to enhance a project description into bullet points.
    Expects JSON: {"title": "...", "tech": "...", "description": "..."}
    Returns JSON: {"enhancedDescription": "• Bullet point 1\\n• Bullet point 2..."}
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    title = data.get('title', '')
    tech = data.get('tech', '') # Could be a string or list, handle appropriately
    original_description = data.get('description', '')

    if not original_description:
        return jsonify({"error": "No project description provided"}), 400

    
    tech_str = tech
    if isinstance(tech, list):
        tech_str = ", ".join(tech)
    tech_str = tech_str if tech_str else 'Not Specified'


    # Construct the prompt for the Gemini model
    prompt = f"""
    You are a technical writer assisting with resume project descriptions.

    Context:
    - Project Title: "{title if title else 'Unnamed Project'}"
    - Technologies Used: "{tech_str}"
    - Original Description Draft:
    "{original_description}"

    Instructions:
    1. Rewrite the project description into 2-4 concise bullet points for a resume. Each bullet point must start on a new line.
    2. Start each bullet point *strictly* with '• '.
    3. Clearly state the project's main goal or purpose in the first bullet point.
    4. Emphasize the key technologies mentioned ({tech_str}) and explain *how* they were applied to solve a specific problem or build key features.
    5. Describe 1-2 significant technical challenges faced (if inferable from the draft) or highlight the most important features implemented.
    6. Mention the main outcome or result of the project (e.g., "Successfully deployed...", "Resulted in a functional web application for...", "Demonstrated skills in...").
    7. Ensure the final output text contains only the rewritten bullet points, separated by a newline character ('\\n').

    Output Format:
    Return *only* a valid JSON object with the following structure. Do not include any text before or after the JSON object. Do not use markdown formatting for the JSON structure itself. The value of "enhancedDescription" must be a single string.
    {{
      "enhancedDescription": "• Developed a [Project Type, e.g., web application] titled '{title}' using {tech_str} to achieve [State the main goal concisely].\\n• Implemented [Key Feature, e.g., user authentication] utilizing [Specific Tech] to address [Challenge/Need].\\n• Successfully deployed the project, demonstrating proficiency in [Key Skill/Technology]."
    }}
    """
    try:
        print(f"--- Sending Prompt to Gemini (Project) ---")
        # print(prompt)
        print(f"--- End Prompt ---")

        # Call the Gemini API
        response = model.generate_content(prompt)

        print(f"--- Received Response from Gemini (Project) ---")
        raw_response_text = response.text if hasattr(response, 'text') else ''
        print(raw_response_text)
        print(f"--- End Response ---")

        # Parse the response text
        result_json = parse_gemini_json(raw_response_text)

        # Validate the parsed JSON structure
        if result_json and isinstance(result_json, dict) and \
           'enhancedDescription' in result_json and isinstance(result_json['enhancedDescription'], str):
             enhanced_description = result_json['enhancedDescription']
             # Basic check for bullets
             if '•' in enhanced_description or enhanced_description.strip() == "":
                 print("Successfully parsed Gemini response for project.")
                 # result_json['enhancedDescription'] = result_json['enhancedDescription'].replace('\\n', '\n')
                 return jsonify(result_json), 200
             else:
                 print("Warning: Gemini response for project didn't contain bullet points as expected, attempting to format.")
                 lines = [line.strip() for line in enhanced_description.split('\n') if line.strip()]
                 formatted_desc = "\n".join([f"• {line}" for line in lines])
                 if not formatted_desc and enhanced_description:
                    print("Warning: Formatting attempt resulted in empty string, returning original non-bulleted text.")
                    return jsonify({"enhancedDescription": enhanced_description}), 200
                 return jsonify({"enhancedDescription": formatted_desc}), 200
        else:
             print("Error: Unexpected or invalid JSON structure from Gemini for project.")
             error_detail = "AI returned data in an unexpected format for project."
             if not result_json:
                 error_detail = "AI failed to return valid JSON for project."
             elif 'enhancedDescription' not in result_json:
                 error_detail = "AI response missing required 'enhancedDescription' field."

             if raw_response_text and not result_json:
                 return jsonify({"error": error_detail, "raw_ai_response": raw_response_text[:1000]}), 500
             return jsonify({"error": error_detail, "received_structure": result_json}), 500

    except Exception as e:
        print(f"Error calling Gemini API or processing response for project: {e}")
        # import traceback
        # traceback.print_exc()
        return jsonify({"error": f"An unexpected error occurred while enhancing the project: {str(e)}"}), 500


@app.route('/api/suggest-skills', methods=['POST'])
def suggest_skills_route():
    """
    API endpoint to suggest relevant skills based on job title and existing skills.
    Expects JSON: {"jobTitle": "...", "skills": ["skill1", "skill2", ...]}
    Returns JSON: {"suggestedSkills": ["suggestion1", "suggestion2", ...]}
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    job_title = data.get('jobTitle', '') # Job title from Personal section
    existing_skills = data.get('skills', []) # Expecting a list of skill names

    if not job_title:
        return jsonify({"error": "Job title is required to suggest relevant skills"}), 400

    
    if not isinstance(existing_skills, list) or not all(isinstance(s, str) for s in existing_skills):
         print("Warning: 'skills' field received is not a list of strings. Treating as empty.")
         existing_skills = []


    skills_list_str = ", ".join(existing_skills) if existing_skills else "None provided"

    # Construct the prompt for the Gemini model
    prompt = f"""
    You are an expert technical recruiter and resume analyst identifying key skills for job roles.

    Context:
    - Target Job Title: "{job_title}"
    - User's Current Skill List: [{skills_list_str}]

    Instructions:
    1. Based *only* on the Target Job Title "{job_title}", identify 5-7 highly relevant skills (these can be technical skills, software tools, programming languages, or essential soft skills) that are commonly expected or beneficial for this specific role.
    2. Ensure the suggested skills are *not* already present in the User's Current Skill List (perform a case-insensitive check). If a skill is closely related but distinct (e.g., "JavaScript" vs "React"), it can be suggested.
    3. Provide only the list of suggested skill names.

    Output Format:
    Return *only* a valid JSON object with the following structure. Do not include any other text, explanations, or markdown formatting around the JSON object itself. The value must be an array of strings.
    {{
      "suggestedSkills": [
        "Relevant Skill Suggestion 1",
        "Relevant Skill Suggestion 2",
        "Relevant Skill Suggestion 3",
        "Relevant Skill Suggestion 4",
        "Relevant Skill Suggestion 5"
      ]
    }}
    """
    try:
        print(f"--- Sending Prompt to Gemini (Skills) ---")
        # print(prompt)
        print(f"--- End Prompt ---")

        # Call the Gemini API
        response = model.generate_content(prompt)

        print(f"--- Received Response from Gemini (Skills) ---")
        raw_response_text = response.text if hasattr(response, 'text') else ''
        print(raw_response_text)
        print(f"--- End Response ---")

        # Parse the response text
        result_json = parse_gemini_json(raw_response_text)

        # Validate the structure
        if result_json and isinstance(result_json, dict) and \
           'suggestedSkills' in result_json and isinstance(result_json['suggestedSkills'], list) and \
           all(isinstance(s, str) for s in result_json['suggestedSkills']):
            print("Successfully parsed Gemini response for skill suggestions.")
            
            existing_lower = {skill.lower().strip() for skill in existing_skills}
            
            filtered_suggestions = [
                s.strip() for s in result_json['suggestedSkills']
                if s.strip() and s.strip().lower() not in existing_lower
            ]
            return jsonify({"suggestedSkills": filtered_suggestions}), 200
        else:
            print("Error: Unexpected or invalid JSON structure from Gemini for skill suggestions.")
            error_detail = "AI returned data in an unexpected format for skills."
            if not result_json:
                error_detail = "AI failed to return valid JSON for skills."
            elif 'suggestedSkills' not in result_json or not isinstance(result_json.get('suggestedSkills'), list):
                 error_detail = "AI response missing or invalid 'suggestedSkills' array."

            if raw_response_text and not result_json:
                 return jsonify({"error": error_detail, "raw_ai_response": raw_response_text[:1000]}), 500
            return jsonify({"error": error_detail, "received_structure": result_json}), 500

    except Exception as e:
        print(f"Error calling Gemini API or processing response for skill suggestions: {e}")
        # import traceback
        # traceback.print_exc()
        return jsonify({"error": f"An unexpected error occurred while suggesting skills: {str(e)}"}), 500


@app.route('/api/review-section', methods=['POST'])
def review_section_route():
    """
    API endpoint to review a specific resume section for errors and improvements.
    Expects JSON: {"sectionName": "...", "text": "..."}
    Returns JSON: {"suggestions": [{"type": "...", "original": "...", "suggestion": "...", "explanation": "..."}, ...]}
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    section_name = data.get('sectionName', 'Unknown Section') # e.g., "Summary", "Experience"
    section_text = data.get('text', '')

    if not section_text:
        
        print(f"Review requested for empty section '{section_name}'. Returning no suggestions.")
        return jsonify({"suggestions": []}), 200
        

    # Construct the prompt for the Gemini model
    prompt = f"""
    You are a meticulous proofreader and professional resume editor reviewing a specific section of a resume.

    Context:
    - Resume Section Being Reviewed: "{section_name}"
    - Text to Review:
    ---
    {section_text}
    ---

    Instructions:
    1. Carefully proofread the provided "Text to Review".
    2. Identify specific issues and list them as suggestions. Focus on:
        - **Grammar errors:** Incorrect sentence structure, subject-verb agreement, etc.
        - **Spelling mistakes:** Typos and misspellings.
        - **Punctuation errors:** Missing or incorrect commas, periods, capitalization, etc.
        - **Verb Tense Consistency:** Ensure past tense (e.g., 'developed', 'managed', 'achieved') is used for completed roles/projects/education. Check if present tense ('manages', 'develops') is used correctly for current roles. Highlight specific inconsistencies.
        - **Clarity and Conciseness:** Suggest improvements if sentences are wordy, unclear, or use jargon inappropriately.
        - **Tone:** Evaluate if the tone is professional, confident, and achievement-oriented. Suggest specific word changes ONLY if needed to improve tone (e.g., replace weak verbs like 'helped' or 'assisted' with stronger ones, change passive voice like 'was responsible for' to active voice like 'Managed').
    3. For each issue found, provide the original snippet (or context), the suggested correction or description of the issue, and a brief explanation/type.
    4. If *no significant issues* are found in the provided text, return an empty "suggestions" array. Do not invent issues.

    Output Format:
    Return *only* a valid JSON object with the following structure. Do not include any other text, explanations, or markdown formatting around the JSON object itself. The value of "suggestions" must be an array of objects, or an empty array []. Each object in the array must have "type", "original", "suggestion", and "explanation" keys with string values.
    {{
      "suggestions": [
        {{
          "type": "Grammar" | "Spelling" | "Punctuation" | "Tense" | "Tone" | "Clarity",
          "original": "The specific phrase or sentence snippet with the issue.",
          "suggestion": "The suggested correction or a clear description of the problem (e.g., 'Inconsistent verb tense').",
          "explanation": "Brief reason for the suggestion (e.g., 'Use past tense for completed role', 'Passive voice detected, suggest active', 'Potential typo found')."
        }}
        // ... more suggestion objects if issues are found
      ]
    }}
    """
    try:
        print(f"--- Sending Prompt to Gemini (Review {section_name}) ---")
        
        print(f"--- End Prompt ---")

        # Calling the Gemini API
        response = model.generate_content(prompt)

        print(f"--- Received Response from Gemini (Review {section_name}) ---")
        raw_response_text = response.text if hasattr(response, 'text') else ''
        print(raw_response_text)
        print(f"--- End Response ---")

        # Parse the response text
        result_json = parse_gemini_json(raw_response_text)

        # Validate the structure
        if result_json and isinstance(result_json, dict) and \
           'suggestions' in result_json and isinstance(result_json['suggestions'], list):
            # Further validation: check the structure of items within the list
            valid_suggestions = True
            for item in result_json['suggestions']:
                if not (isinstance(item, dict) and
                        'type' in item and isinstance(item['type'], str) and
                        'original' in item and isinstance(item['original'], str) and
                        'suggestion' in item and isinstance(item['suggestion'], str) and
                        'explanation' in item and isinstance(item['explanation'], str)):
                    valid_suggestions = False
                    print(f"Invalid suggestion item found: {item}")
                    break

            if valid_suggestions:
                print(f"Successfully parsed Gemini response for review ({section_name}). Found {len(result_json['suggestions'])} suggestions.")
                return jsonify(result_json), 200
            else:
                print(f"Error: Invalid structure within the 'suggestions' array for review ({section_name}).")
                # Return the partially valid structure if possible, but flag the error
                return jsonify({"error": f"AI returned suggestions with invalid item structure for review ({section_name}).", "received_suggestions": result_json['suggestions']}), 500

        else:
            print(f"Error: Unexpected or invalid JSON structure from Gemini for review ({section_name}).")
            error_detail = f"AI returned data in an unexpected format for review ({section_name})."
            if not result_json:
                 error_detail = f"AI failed to return valid JSON for review ({section_name})."
            elif 'suggestions' not in result_json or not isinstance(result_json.get('suggestions'), list):
                 error_detail = f"AI response missing or invalid 'suggestions' array for review ({section_name})."

            if raw_response_text and not result_json:
                 return jsonify({"error": error_detail, "raw_ai_response": raw_response_text[:1000]}), 500
            return jsonify({"error": error_detail, "received_structure": result_json}), 500

    except Exception as e:
        print(f"Error calling Gemini API or processing response for review ({section_name}): {e}")
        
        return jsonify({"error": f"An unexpected error occurred during section review: {str(e)}"}), 500


if __name__ == '__main__':

    debug_mode = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    server_port = int(os.environ.get('PORT', 5000))
    server_host = os.environ.get('HOST', '0.0.0.0')

    print(f"Starting Flask server on {server_host}:{server_port} (Debug: {debug_mode})...")
    app.run(debug=debug_mode, host=server_host, port=server_port)
