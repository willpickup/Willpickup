import { GoogleGenAI } from "@google/genai";
import type { MeetingDetails, Officer } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getTemplateSpecificInstructions = (template: string): string => {
  switch (template) {
    case 'Installation Meeting':
      return `
        **Template-Specific Instructions (Installation Meeting):**
        - The minutes body must focus exclusively on the installation ceremony.
        - Start by noting the appointment of the Installing Master and any assisting officers (e.g., Installing Marshal, Installing Chaplain).
        - Describe the presentation of the Master-Elect to the Installing Master.
        - Detail the formation of a Board of Installed Masters for the esoteric portion of the ceremony.
        - After the Board is closed, describe the re-admission of brethren.
        - Crucially, list each newly installed officer and their investiture. Use formal language, e.g., "Brother [Name] was invested as Senior Warden."
        - Include mentions of the outgoing Master's valedictory address and the incoming Master's inaugural address, if noted.
        - Record any presentations, such as the Past Master's jewel to the outgoing Master.
        - Follow the overall structure of the exemplar for formality, but adapt the content for the installation events.
      `;
    case 'Degree Ceremony':
      return `
        **Template-Specific Instructions (Degree Ceremony):**
        - When the shorthand notes mention degree work, you must strictly follow the procedural structure shown in the exemplar.
        - This means for each degree conferred, you must record the closing of the current lodge and the opening of the lodge for the new degree. For example: "The Lodge of Master Masons was then closed, and a Lodge of Entered Apprentices opened in due form."
        - After opening the appropriate lodge, describe the candidate's admission using the exemplar's phrasing: "[Mr./Bro.] [Candidate's Name], a candidate for [initiation/advancement], being in waiting, was duly prepared, brought forward and [initiated as an Entered Apprentice/passed to the degree of a Fellow Craft/raised to the sublime degree of a Master Mason], he paying the usual fee."
        - If multiple degrees are conferred in one meeting, repeat this "close lodge, open lodge, confer degree" sequence for each one as described in the notes.
        - Ensure the final closing of the lodge reflects the degree the lodge was in at the end of business (as specified in the main meeting details).
      `;
    case 'Standard Communication':
    default:
      return `
        **Template-Specific Instructions (Standard Communication):**
        - The body of the minutes must detail the standard lodge business as described in the shorthand notes.
        - Strictly adhere to the formal phrasing and structure from the exemplar when describing these events.
        - For example, use phrases like:
          - "The Committee on the petition of Mr. C. B. ...., a candidate for initiation, reported favorably, whereupon he was balloted for and duly elected."
          - "A petition for initiation from Mr. G. F. ...... .nclosing the usual amount, and recommended by Brothers C. D. ..........and H. L. ... was referred to a Committee of Investigation."
          - "A letter was read from Mrs. T. V.. ........, the widow of a Master Mason, when the sum of twenty dollars was voted for her relief."
        - Transcribe the business items from the shorthand notes into this formal Masonic prose.
      `;
  }
};

const exemplar = `
FORM For keeping THE MINUTES of A LODGE.
(The following form embraces the most important transactions that usually occur during the Communication of a Lodge, and it may, therefore, serve as an exemplar for the use of secretaries.)
A regular communication of was holden at on the
Lodge No.
day of
PRESENT Bro. A. B W. Master " . B. C. S.Warden, J. Warden, Treasurer Secretary S. Deacon. J. Deacon " H.I. Steward. A J.K. Steward. " K.L. Tiler.
Members.
Bro. L. M. " M.N. 27 N.O. 22 O. P.
Bro. P. Q. Q. R. R.S.
Visitors.
_Lodge
No. No. No.
The Lodge was opened in due form on the third degree of Masonry
The minutes of the last regular Communication, and of aspecial Communication holden on , were read and confirmed.
The Committee on the petition of Mr. C. B. ...., 2 candidate for initiation, reported favorably, whereupon he was balloted for and duly elected,
The Committee on the petition of Mr. D. C. ........ a candidate for initiation, reported favorably, whereupon he was
balloted for, and the box appearing foul, he was rejected.
The Committee on the petition of Mr. E. D.. .......,.a candidate
for initiation, reported unfavorably, whereupon he was declared
rejected without a ballot,
Brother S. R.
an
Entered Apprentice, having
apphied
for advancement, he was duly elected to take
the second degree; and Brother W.Y. ...
.... a Fellow
Craft, was, on his application for advancement, duly
elected to take the third degree.
A petition for initiation from Mr. G. F.
...... .nclosing the
usual amount, and recommended by Brothers C. D. ..........and
H. L.
... was referred to a Committee of Investigation.
consisting of Brothers G. H.
.... L. M.........and . p.

A letter was read from Mrs. T. V.. ........, the widow of a
Master Mason, when the sum of twenty dollars was voted for her
relief.

The amendment to Article 10, Section 5, of the By Laws of this
Lodge, proposed by Brother M. N....
....at the Communication
of
.., was read a third time, adopted by a constitutional
majority, and ordered to be sent to the Grand Lodge for approval
and confirmation.

The Lodge of Master Masons was then closed, and a Lodge of
Entered Apprentices opened in due form.

Mr.C. B.
...., a candidate for imitiation, being in waiting.
was duly prepared, brought forward and initiated as an Entered
Apprentice, he paying the usual fee.

The Lodge of Entered Apprentices was then closed, and a
Lodge of Fellow Crafts opened in due form.

Brother S. R. ".....
.... an Entered Apprentice being in waiting,
was duly prepared. brought forward and passed to the degree of a
Fellow Craft he paying the usual fee.

The Lodge of Fellow Crafts was then closed, and a Lodge of
Master Masons opened in due form
Brother W.Y
.. a Fellow Craft, being in wait-
the sublime degree of a Master Mason, he paying the usual fee.
ing, Was duly prepared, brought forward and raised to
`;

const formatOfficerData = (officer: Officer, role: string): string => {
  if (!officer.name.trim()) return `- ${role}: Not specified`;
  return `- ${role}: Name: ${officer.name}, Title: ${officer.title}, Pro Tem: ${officer.isProTem}`;
};


const buildPrompt = (details: MeetingDetails, notes: string): string => {
  const templateInstructions = getTemplateSpecificInstructions(details.minuteTemplate);
  const secretaryNameAndTitle = details.secretary.name.trim()
    ? details.secretary.name + ((details.secretary.title && details.secretary.title !== 'Brother') ? `, ${details.secretary.title}` : '')
    : '';

  const getCanonicalDegree = (degree: string): string => {
    const lowerDegree = degree.toLowerCase().trim();
    if (lowerDegree.includes('master') || lowerDegree.includes('third')) {
      return 'third';
    }
    if (lowerDegree.includes('craft') || lowerDegree.includes('second')) {
      return 'second';
    }
    if (lowerDegree.includes('apprentice') || lowerDegree.includes('first')) {
      return 'first';
    }
    // Fallback for the new values if they don't match the includes check
    return lowerDegree;
  };

  const canonicalDegree = getCanonicalDegree(details.degree);

  return `
    You are an AI assistant tasked with generating formal Masonic minutes. Your output must strictly adhere to the traditional format and phrasing provided in the exemplar below.

    **Exemplar Format to Follow:**
    ---
    ${exemplar}
    ---

    Now, based on the following meeting details, officer data, and shorthand notes, generate the minutes.

    **Meeting Details:**
    - Lodge Name: ${details.lodgeName} No. ${details.lodgeNumber}
    - Date: ${details.meetingDate}
    - Type of Meeting: ${details.meetingType}
    - Lodge was opened and closed on: The ${canonicalDegree} Degree
    - Number of Brethren Present: ${details.brethrenPresent || 'Not specified'}
    - Minute Template Selected: ${details.minuteTemplate}

    **Principal Officers Data:**
    ${formatOfficerData(details.worshipfulMaster, 'Worshipful Master')}
    ${formatOfficerData(details.seniorWarden, 'Senior Warden')}
    ${formatOfficerData(details.juniorWarden, 'Junior Warden')}
    ${formatOfficerData(details.treasurer, 'Treasurer')}
    ${formatOfficerData(details.secretary, 'Secretary')}
    ${formatOfficerData(details.seniorDeacon, 'Senior Deacon')}
    ${formatOfficerData(details.juniorDeacon, 'Junior Deacon')}
    ${formatOfficerData(details.steward1, 'Steward 1')}
    ${formatOfficerData(details.steward2, 'Steward 2')}
    ${formatOfficerData(details.tyler, 'Tyler')}

    **Shorthand Notes from the Secretary:**
    ---
    ${notes}
    ---

    **Instructions for Generation:**
    1.  **Strict Adherence to Exemplar:** The primary instruction is to format the entire output to match the provided exemplar. This includes the introductory sentence, the "PRESENT" block for officers, and the phrasing for common business items. Do not invent details not present in the shorthand notes.
    2.  **Header:** Begin with a sentence like: "A ${details.meetingType} of ${details.lodgeName} Lodge No. ${details.lodgeNumber} was holden on the ${details.meetingDate}."
    3.  **PRESENT Block:** Create a "PRESENT" section listing the officers present, formatted like the exemplar (e.g., "Bro. A. B........... W. Master"). Use "Bro." before the name, and use standard abbreviations for the office (W. Master, S. Warden, J. Warden, etc.). If an officer is Pro Tem, add "(Pro Tem)" after their name. If an officer's name is not provided, omit them from this list.
    4.  **Attendance:** If a 'Number of Brethren Present' is provided and is not 'Not specified', add the line "Present also were ${details.brethrenPresent} brethren." immediately after the officer list. Otherwise, omit this line.
    5.  **Members & Visitors:** Only include "Members" or "Visitors" sections if individuals who are not officers are explicitly mentioned as present in the shorthand notes. If not, omit these sections entirely.
    6.  **Opening:** Use the phrase: "The Lodge was opened in due form on the ${canonicalDegree} degree of Masonry."
    7.  **Previous Minutes:** Unless the notes say otherwise, include a line like: "The minutes of the last regular Communication were read and confirmed."
    8.  **Lodge Business:** Detail the business from the shorthand notes, strictly using the formal language and structure demonstrated in the exemplar for petitions, balloting, reports, bills, etc.
    9.  **Template-Specific Logic:**
        ${templateInstructions}
    10. **Closing:** Conclude the entire minutes with the following exact statement: "There being no further business to come before the Lodge, Worshipful Master ${details.worshipfulMaster.name || '[Worshipful Master\'s Name]'} closed the Lodge in due form and harmony on the ${canonicalDegree} Degree."
    11. **Signature:** After the closing, add the exact signature line: "Fraternally submitted, ${secretaryNameAndTitle}, Secretary". If no secretary name is provided, omit this line.
  `;
};

export const generateMinutes = async (details: MeetingDetails, notes: string): Promise<string> => {
  if (!notes.trim()) {
    throw new Error("Meeting notes cannot be empty.");
  }
  
  const prompt = buildPrompt(details, notes);

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("The AI service failed to generate a response. Please check your connection and API key.");
  }
};