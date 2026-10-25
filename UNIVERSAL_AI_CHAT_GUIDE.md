# Universal AI Chat Guide: Document Extraction, PDF Generation & Email Drafting

A step-by-step playbook to replicate the **KYC Document Extraction ➔ Signed PDF Generation ➔ Email Drafting** workflow across **ANY AI chat platform** (ChatGPT, Google Gemini, Claude, Microsoft Copilot, DeepSeek, Perplexity, etc.).

---

## 1. How Any AI Chat App Handles This Workflow

Different AI chatbots have different execution environments. Depending on which tool you use, here is how each handles the workflow:

| AI Chat Platform | OCR / Vision Support | Direct PDF Generation | Best Approach |
| :--- | :--- | :--- | :--- |
| **ChatGPT (GPT-4o / Plus / Team / Pro)** | Supported | Built-in Python Code Interpreter runs and gives direct download link | **One-Shot All-In-One Prompt** |
| **Google Gemini (Advanced / 2.5 Pro)** | High accuracy on Indian ID fonts | Generates Python script or printable HTML preview | **Prompt + Run Script OR Print-to-PDF** |
| **Claude (Claude 3.5 Sonnet / Opus)** | High text extraction accuracy | Generates self-contained HTML/CSS or Artifact (Print ➔ Save as PDF) | **HTML-to-PDF Artifact Method** |
| **Microsoft Copilot / DeepSeek / Others** | Vision supported on most tiers | Script generation or tabular formatting | **Printable HTML / Markdown Prompt** |

---

## 2. The 3 Standard Workflow Methods

### Method 1: The One-Shot Code Interpreter Prompt (Best for ChatGPT)
*The AI executes Python code in its sandbox to compile and give you a downloadable `.pdf` file with embedded images & signatures.*

### Method 2: The Self-Contained HTML / Printable Template (Best for Claude, Gemini, or Copilot)
*The AI generates an interactive HTML document with your details and embedded base64 signature. You open it in your browser and click `Ctrl + P` (or Cmd + P) ➔ "Save as PDF". No Python needed!*

### Method 3: The 2-Step Multi-Turn Dialogue (Best for Free / Low-tier Chatbots)
*Step 1: Extract and verify information. Step 2: Render document & draft submission email.*

---

## 3. Master Prompts by Method

---

### PROMPT 1: Direct PDF Creation via Python (For ChatGPT Plus / GPT-4o)

> **Preparation**:
> Attach 3 or 4 images to the chat:
> 1. PAN Card photo
> 2. Aadhaar Card front photo
> 3. Aadhaar Card back photo (with address)
> 4. Photo of signature on plain white paper

```markdown
Role: You are an expert administrative assistant and Python developer specializing in KYC processing and document generation.

I have uploaded images of:
1. PAN Card
2. Aadhaar Card (Front and Back)
3. My handwritten signature on plain white paper

Task Overview:
Execute an automated 3-stage process to generate my official Membership Withdrawal Request Form, compile a signed PDF with KYC attachments, and draft a submission email.

STAGE 1: Document Extraction (OCR)
Read the attached documents and extract:
- Full Legal Name: (from PAN / Aadhaar)
- PAN Number: (10-character alphanumeric)
- Aadhaar Number: (12 digits, can mask first 8 digits as XXXX XXXX 1234)
- Residential Address: (House/Flat, Street, Locality, City/District, State, PIN code)
- Date of Birth: (DD/MM/YYYY)

Additional User-Supplied Information:
- Member ID: [INSERT MEMBER ID, e.g., IND12345678]
- Registered Mobile: [INSERT MOBILE NUMBER]
- Registered Email: [INSERT REGISTERED EMAIL]
- Reason for Withdrawal: Personal reasons
- Date: [INSERT TODAY'S DATE, e.g., 22/10/2026]
- Place: [INSERT YOUR CITY, e.g., New Delhi]

Display the extracted information in a clean summary table for verification.

STAGE 2: PDF Compilation via Python (Code Interpreter)
Write and execute a Python script using `reportlab` and `PIL` (Pillow) to generate a downloadable PDF named "Atomy_Withdrawal_Request_[MEMBER_ID].pdf":
1. Page 1 (The Official Withdrawal Request Form):
   - Header: "ATOMY ENTERPRISE INDIA PVT. LTD." and subheader "MEMBERSHIP WITHDRAWAL REQUEST FORM"
   - A structured two-column table displaying all member details and address.
   - Formal Declaration: "I hereby voluntarily request the cancellation and termination of my Atomy India membership. I declare that all information furnished is true and accurate."
   - Signature Box: Crop/process the uploaded signature image and embed it into the applicant signature area next to Date and Place.
2. Page 2 (KYC Proof Annexure):
   - Header: "ANNEXURE: SELF-ATTESTED IDENTITY PROOFS"
   - Embed the uploaded PAN Card and Aadhaar Card images neatly scaled.
   - Stamp the signature image below each card image with the caption "Self-Attested by [Applicant Name]".
3. Compile the file and provide a direct clickable download link to download the generated PDF.

STAGE 3: Email Draft
Generate the final email draft:
- To: atomy_in@atomypark.com
- Subject: Atomy Membership Withdrawal Form _ [MEMBER ID]
- Body: Formal, polite email referencing the attached completed and signed form, stating the registered phone and email, and requesting official confirmation of account closure.
```

---

### PROMPT 2: The Universal "Printable HTML-to-PDF" Prompt (Works on ANY AI: Claude, Gemini, ChatGPT, Copilot)

> **Why this works universally:** All AI chat platforms can output HTML/CSS. When you open the generated HTML file in Google Chrome, Edge, or Safari and press `Ctrl + P`, it renders a high-quality A4 PDF with vector typography and embedded images.

```markdown
Role: You are an expert document designer and administrative assistant.

I have attached:
1. PAN Card image
2. Aadhaar Card (Front and Back)
3. Signature image

Please perform the following:

1. OCR EXTRACTION:
Extract the full name, PAN number, Aadhaar number, and complete postal address from the attached cards.

2. GENERATE A COMPLETE SINGLE-FILE HTML PRINTABLE FORM:
Create a single, self-contained HTML file (with modern inline CSS formatted specifically for @page A4 printing) for the "Atomy Membership Withdrawal Request Form":
- Include all member fields:
  * Name: [Extracted Name]
  * Member ID: [INSERT MEMBER ID]
  * PAN: [Extracted PAN]
  * Aadhaar: [Extracted Aadhaar]
  * Contact: [INSERT MOBILE & EMAIL]
  * Residential Address: [Extracted Address]
  * Reason: Personal reasons
  * Date & Place: [INSERT DATE & CITY]
- Declaration paragraph agreeing to voluntary cancellation of distributor rights.
- Embed my signature image using a data URL (<img src="data:image/png;base64,...">) or image placeholder in the Applicant Signature box.
- Include a Page 2 (using CSS `page-break-before: always;`) containing the PAN and Aadhaar copies labeled as "Self-Attested Identity Proofs" with the signature beneath each.
- Add print styling `@media print { @page { size: A4; margin: 15mm; } }` so pressing Ctrl+P / Cmd+P directly produces a perfect PDF.

3. EMAIL DRAFT:
Write a ready-to-send email addressed to atomy_in@atomypark.com with the subject "Atomy Membership Withdrawal Form _ [MEMBER ID]".
```

---

### PROMPT 3: The 2-Step Modular Prompt (For Lightweight / Free Chat Models)

#### Step 1: Data Extraction Prompt
```markdown
Here are images of my PAN card, Aadhaar card, and handwritten signature.
Please read them and extract the following details into a JSON or bulleted list:
1. Full Name as on records
2. PAN Number
3. Aadhaar Number
4. Complete Postal Address including PIN code
5. Date of Birth

Also note if any details are blurry or ambiguous.
```

#### Step 2: Output Generation Prompt (Send after verifying Step 1)
```markdown
The details look accurate. Please now complete the task:

1. Generate a formal Atomy India Membership Withdrawal declaration document containing all extracted details plus:
   - Member ID: [INSERT MEMBER ID]
   - Mobile: [INSERT MOBILE]
   - Email: [INSERT EMAIL]
   - Reason: Personal reasons
   - Date: [TODAY'S DATE]
   - Place: [YOUR CITY]

2. Provide a Python script using ReportLab to merge this data, my signature, and the card images into a 2-page PDF ready for submission.

3. Draft the formal email to Atomy India Customer Support (atomy_in@atomypark.com) requesting account closure.
```

---

## 4. Prompting Tips for High Accuracy

1. **Clear Signature Images**:
   - Write your signature with a **black or dark blue gel/ballpoint pen** on **clean unlined white paper**.
   - Take the photo in good lighting without casting shadows.
2. **Aadhaar Privacy / Security**:
   - Mask the first 8 digits of your Aadhaar card (`XXXX XXXX 1234`) using any photo markup tool or request the AI to mask it in the final document.
   - Atomy India accepts masked Aadhaar.
3. **Correct Recipient Details for Atomy India**:
   - **Submission Email**: `atomy_in@atomypark.com`
   - **Subject Line**: `Atomy Membership Withdrawal Form _ <YOUR_MEMBER_ID>` (Atomy's customer support system filters withdrawal tickets by this subject pattern).
4. **Temporary Chat Mode**:
   - If using ChatGPT or Claude, turn on **Temporary Chat / Incognito Mode** so your identity documents and personal information are not saved in chat history or used for training.

---

## 5. Summary Matrix of AI Prompts

| Goal | Recommended AI | Prompt to Use | Output |
| :--- | :--- | :--- | :--- |
| Direct PDF Download | ChatGPT (GPT-4o) | **PROMPT 1** (Python Code Interpreter) | `.pdf` file download link + Email |
| Web Browser Print to PDF | Claude 3.5 / Gemini | **PROMPT 2** (Printable HTML Artifact) | `.html` file ➔ `Ctrl+P` ➔ Save as PDF |
| Step-by-Step Verification | Free AI Chatbots | **PROMPT 3** (2-Step Modular) | Extracted text + Python script + Email |
