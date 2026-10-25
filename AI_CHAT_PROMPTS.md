# Quick AI Chat Prompt: Atomy India Withdrawal Form & Email Generator

Copy and paste this exact prompt into **ChatGPT (GPT-4o)** or **Google Gemini** after attaching your document photos.

---

### Step-by-Step Instructions:
1. Open [ChatGPT](https://chatgpt.com) (GPT-4o) or [Google Gemini](https://gemini.google.com).
2. Click the **Attach / Plus (+)** icon and upload:
   - **Photo of PAN Card**
   - **Photo of Aadhaar Card** (Front & Back)
   - **Photo of your handwritten signature** on white paper
3. Copy the prompt below, replace the bracketed placeholders (`[...]`), and send it:

---

```markdown
You are an expert KYC document processor and administrative assistant. 

I have uploaded images of:
1. My PAN Card
2. My Aadhaar Card (Front and Back)
3. My Signature on plain white paper

Please execute the following complete workflow to help me withdraw my Atomy India membership:

### 1. OCR Document Extraction
Read the attached documents and extract:
- Full Legal Name
- PAN Number
- Aadhaar Number
- Complete Residential Address (with City, State, and PIN Code)
- Date of Birth

Use these additional details:
- Atomy Member ID: [REPLACE WITH YOUR MEMBER ID, e.g., IND12345678]
- Registered Mobile: [REPLACE WITH YOUR MOBILE NUMBER]
- Registered Email: [REPLACE WITH YOUR EMAIL]
- Reason for Withdrawal: Personal reasons
- Submission Date: [REPLACE WITH TODAY'S DATE, e.g., 22/10/2026]
- Place: [REPLACE WITH YOUR CITY, e.g., Mumbai]

Provide a clean summary table of all extracted and supplied details for verification.

### 2. PDF Creation (Python Code Interpreter)
Write and run a Python script using `reportlab` and `Pillow` to generate a clean, official PDF named "Atomy_Withdrawal_Request_[YOUR_MEMBER_ID].pdf":
- **Header**: "ATOMY ENTERPRISE INDIA PVT. LTD. - MEMBERSHIP WITHDRAWAL FORM"
- **Table**: Neatly organized two-column table displaying Member ID, Applicant Name, PAN, Aadhaar, Mobile, Email, Residential Address, Reason, Date, and Place.
- **Declaration Statement**: "I hereby voluntarily request the cancellation and termination of my Atomy India distributor/member account. I declare that the details provided are genuine and correct."
- **Signature Stamping**: Crop and place my uploaded signature in the Applicant Signature box.
- **Annexure Pages**: Add an extra page containing my PAN card and Aadhaar card images with a self-attestation label ("Self-Attested by [Name]") and my signature stamped under each document.
- Provide a direct downloadable file link for this completed PDF.

### 3. Submission Email Draft
Draft the exact email for me to send:
- **To**: atomy_in@atomypark.com
- **Subject**: Atomy Membership Withdrawal Form _ [YOUR MEMBER ID]
- **Body**: Professional, polite formal tone mentioning the attached completed and signed withdrawal form, member ID, registered contact details, and a clear request for account de-registration and confirmation.
```
