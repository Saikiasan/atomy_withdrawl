# Atomy Membership Withdrawal Automation Guide

Comprehensive documentation for generating the **Atomy India Membership Withdrawal Request Form**, embedding KYC document copies (PAN and Aadhaar) along with signatures into a compliant PDF, and drafting the submission email.

This guide covers:
1. **The Core Workflow Architecture** (how the web app works).
2. **Replicating the Exact Workflow in AI Chat Apps** (ChatGPT Plus/Team/Enterprise or Google Gemini Advanced).
3. **Copy-Paste Master Prompt Templates** for ChatGPT & Gemini.
4. **Step-by-Step User Instructions**.

---

## 1. System Overview & The Standard Flow

The Atomy India Withdrawal Form requires specific details and identity attachments before it is accepted by Atomy India Customer Support (`atomy_in@atomypark.com`):

```
┌─────────────────────────────────┐
│ Step 1: Upload Documents        │ -> PAN Card Front, Aadhaar Front & Back, Signature
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│ Step 2: OCR & Data Extraction   │ -> Extract Name, PAN, Aadhaar, Address, Mobile, Email
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│ Step 3: Verification & Review   │ -> Confirm Member ID (IND...), Reason, Date, Place
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│ Step 4: PDF Compilation         │ -> Stamp fields onto template + attach ID & Signature pages
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│ Step 5: Email Draft Generation  │ -> Ready-to-send draft with correct subject and attachments
└─────────────────────────────────┘
```

### Official Form Structure & Requirements
1. **Applicant Details**: Full Name, Atomy Member ID (e.g., `IND12345678`), PAN Card number, Mobile Number, Email ID, Aadhaar number, Residential Address, City, State, PIN code.
2. **Reason for Withdrawal**: e.g., "Personal reasons / No longer active".
3. **Date & Place**: Submission date and current city.
4. **Signatures**:
   - Signature box on the primary declaration form.
   - Self-attestation signature on KYC copies.
5. **Attachments**:
   - Self-attested PAN card copy.
   - Self-attested Aadhaar card (Front & Back) copy.
6. **Submission Destination**:
   - **Recipient Email**: `atomy_in@atomypark.com`
   - **Subject Format**: `Atomy Membership Withdrawal Form _ <MEMBER_ID>`

---

## 2. Replicating the Flow in AI Chat Apps (ChatGPT & Gemini)

Both **ChatGPT (GPT-4o with Advanced Data Analysis / Python Code Interpreter)** and **Google Gemini Advanced (Gemini 1.5 Pro / 2.5 Pro)** have vision capabilities and code execution environments. 

### Why ChatGPT (GPT-4o) Excels at PDF Creation
ChatGPT has a live **Python environment** with libraries like `pypdf`, `pdfplumber`, `fpdf2`, `reportlab`, and `Pillow`. When you prompt ChatGPT with attachments and a Python script instruction, it can:
1. OCR your PAN and Aadhaar images.
2. Overlay your text onto the official form or generate a high-resolution, multi-page vector PDF.
3. Embed your actual signature and KYC images into the document.
4. Provide a direct download link for the completed `.pdf`.
5. Output the exact email draft in one prompt cycle.

### How Google Gemini Handles the Flow
Google Gemini reads the images, extracts all data with high accuracy, writes the email draft, and generates a ready-to-run Python script (using `reportlab` or `fitz`/`PyMuPDF`) or HTML-to-PDF template if direct file rendering isn't active in your Gemini workspace.

---

## 3. The Master Prompts for AI Chat Apps

### Prompt A: All-in-One Prompt (For ChatGPT Plus / GPT-4o with Code Interpreter)

> **Instructions for the User:**
> 1. Open a new chat in **ChatGPT (GPT-4o)**.
> 2. Click the `+` or paperclip icon and attach:
>    - PAN card photo/scan
>    - Aadhaar card front & back photo/scan
>    - Signature photo (black/blue ink on white paper)
>    - *(Optional)* The empty Atomy Withdrawal PDF template if you have it.
> 3. Paste the prompt below into the chat box (fill in your Member ID and City):

```markdown
You are an expert KYC document processor and administrative assistant. 
I have uploaded the following images/documents:
1. My PAN Card
2. My Aadhaar Card (Front and Back)
3. My Signature (on white paper)
4. (Optional) Official Atomy Withdrawal Request Form template

Please execute the following 3-step workflow:

### STEP 1: OCR & Information Extraction
Examine the uploaded identity documents and extract:
- Full Legal Name (as per PAN/Aadhaar)
- PAN Number (10-character alphanumeric)
- Aadhaar Number (12 digits)
- Full Residential Address (Street, City, State, PIN Code)
- Date of Birth
- Mobile Number & Email ID (if present)

Here are my additional details:
- Atomy Member ID: [INSERT YOUR MEMBER ID, e.g., IND12345678]
- Phone Number: [INSERT YOUR PHONE NUMBER if not on card]
- Email ID: [INSERT YOUR REGISTERED EMAIL]
- Reason for Withdrawal: Personal reasons
- Date: [TODAY'S DATE, e.g., DD/MM/YYYY]
- Place: [YOUR CITY, e.g., New Delhi]

Show me a clean summary table of all extracted and supplied details for my confirmation.

---

### STEP 2: PDF Generation with Code Interpreter (Python)
Using Python (`reportlab` / `pypdf` / `Pillow`):
1. Process the signature image: remove white background so it looks cleanly stamped.
2. Generate a 2-page or 3-page consolidated PDF titled "Atomy_Membership_Withdrawal_<MEMBER_ID>.pdf":
   - **Page 1: Atomy Membership Withdrawal Form**:
     - Form Header: "ATOMY INDIA - MEMBERSHIP WITHDRAWAL REQUEST FORM"
     - Clean tabular layout containing: Member ID, Applicant Name, PAN Number, Aadhaar Number, Registered Mobile, Registered Email, Residential Address, Reason for Withdrawal, Date, and Place.
     - Formal Declaration: "I hereby confirm my voluntary withdrawal from Atomy Enterprise India Pvt. Ltd. I request the de-registration and cancellation of my distributor/member ID."
     - Place my cropped signature image neatly in the Applicant Signature box.
   - **Page 2: KYC Identity Proofs (Self-Attested)**:
     - Header: "ANNEXURE: IDENTITY & KYC PROOF"
     - Place the PAN card image and Aadhaar card (front and back) images neatly.
     - Place my signature image underneath each document along with the text "Self-Attested by [Applicant Name]".
3. Compile the PDF and provide a clickable direct download link for the completed PDF.

---

### STEP 3: Draft the Submission Email
Generate a ready-to-copy email draft with:
- **To**: atomy_in@atomypark.com
- **Subject**: Atomy Membership Withdrawal Form _ [MEMBER ID]
- **Body**: Professional, polite formal tone citing the attached signed withdrawal form, member ID, registered contact details, and a clear request for acknowledgment and account closure confirmation.
```

---

### Prompt B: Modular Prompt for Google Gemini

Google Gemini excels at OCR extraction, vision reasoning, and composing emails. Use this two-step prompt sequence:

#### Gemini Prompt 1 (OCR Extraction & Email Drafting)
```markdown
I have attached images of my PAN card, Aadhaar card, and handwritten signature. 

I need to submit an official membership withdrawal request to Atomy India (atomy_in@atomypark.com).

Please do the following:
1. Extract all details from the attached identity documents:
   - Full Name
   - PAN Number
   - Aadhaar Number
   - Full Address with PIN code
2. Use my additional information:
   - Atomy Member ID: [YOUR MEMBER ID, e.g., IND98765432]
   - Mobile: [YOUR PHONE NUMBER]
   - Email: [YOUR EMAIL]
   - Reason: Personal reasons
   - Date: [TODAY'S DATE]
   - Place: [YOUR CITY]
3. Write a professional and polite email draft addressed to Atomy India Customer Support (atomy_in@atomypark.com) with the subject "Atomy Membership Withdrawal Form _ [MEMBER ID]" requesting account closure and confirmation.
4. Output a Python script using ReportLab to compile a filled withdrawal form containing these details and embedding the signature and KYC card images into a final PDF.
```

---

## 4. Alternative: Standalone Python Script (Run Locally or in AI Code Interpreter)

If ChatGPT or an offline environment asks for a dedicated script to stitch the PDF:

```python
import os
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def create_withdrawal_pdf(
    filename="Atomy_Withdrawal_Form.pdf",
    data=None,
    pan_path=None,
    aadhaar_path=None,
    signature_path=None
):
    if data is None:
        data = {
            "name": "JOHN DOE",
            "member_id": "IND12345678",
            "pan": "ABCDE1234F",
            "aadhaar": "1234 5678 9012",
            "mobile": "+91 9876543210",
            "email": "johndoe@example.com",
            "address": "Flat 101, Galaxy Apts, MG Road, Bengaluru, Karnataka - 560001",
            "reason": "Personal reasons / No longer active",
            "date": "21/10/2026",
            "place": "Bengaluru"
        }

    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=16,
        leading=20,
        alignment=1,
        textColor=colors.HexColor('#002B49')
    )
    normal_style = styles['Normal']
    bold_style = ParagraphStyle('Bold', parent=styles['Normal'], fontName='Helvetica-Bold')

    elements = []

    # Title
    elements.append(Paragraph("ATOMY ENTERPRISE INDIA PVT. LTD.", title_style))
    elements.append(Paragraph("<b>MEMBERSHIP WITHDRAWAL REQUEST FORM</b>", ParagraphStyle('Sub', alignment=1, fontSize=12, leading=16)))
    elements.append(Spacer(1, 15))

    # Details Table
    table_data = [
        [Paragraph("<b>Applicant Full Name</b>", normal_style), Paragraph(data["name"], normal_style)],
        [Paragraph("<b>Atomy Member ID</b>", normal_style), Paragraph(data["member_id"], bold_style)],
        [Paragraph("<b>PAN Number</b>", normal_style), Paragraph(data["pan"], normal_style)],
        [Paragraph("<b>Aadhaar Number</b>", normal_style), Paragraph(data["aadhaar"], normal_style)],
        [Paragraph("<b>Registered Mobile</b>", normal_style), Paragraph(data["mobile"], normal_style)],
        [Paragraph("<b>Registered Email ID</b>", normal_style), Paragraph(data["email"], normal_style)],
        [Paragraph("<b>Residential Address</b>", normal_style), Paragraph(data["address"], normal_style)],
        [Paragraph("<b>Reason for Withdrawal</b>", normal_style), Paragraph(data["reason"], normal_style)],
        [Paragraph("<b>Date of Submission</b>", normal_style), Paragraph(data["date"], normal_style)],
        [Paragraph("<b>Place</b>", normal_style), Paragraph(data["place"], normal_style)],
    ]

    t = Table(table_data, colWidths=[160, 350])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))

    # Declaration
    declaration = (
        "<b>Declaration:</b> I hereby declare that all the information provided above is true and correct. "
        "I voluntarily submit this request to terminate/withdraw my membership with Atomy Enterprise India Pvt. Ltd. "
        "I understand that upon processing, my membership privileges and associated ID will be permanently cancelled."
    )
    elements.append(Paragraph(declaration, ParagraphStyle('Dec', fontSize=9, leading=12, textColor=colors.HexColor('#334155'))))
    elements.append(Spacer(1, 25))

    # Signature Area
    sig_elements = []
    if signature_path and os.path.exists(signature_path):
        sig_elements.append(RLImage(signature_path, width=120, height=45))
    else:
        sig_elements.append(Spacer(1, 45))
    sig_elements.append(Paragraph("<b>Applicant's Signature</b>", normal_style))

    sig_table = Table([[Paragraph(f"<b>Date:</b> {data['date']}<br/><b>Place:</b> {data['place']}", normal_style), sig_elements]], colWidths=[300, 210])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'BOTTOM')
    ]))
    elements.append(sig_table)

    doc.build(elements)
    print(f"Generated: {filename}")

if __name__ == "__main__":
    create_withdrawal_pdf()
```

---

## 5. Security & Privacy Best Practices

When sharing identity documents (PAN and Aadhaar) with external AI chatbots:

1. **Aadhaar Masking**: If possible, use a **Masked Aadhaar** (where only the last 4 digits are visible, e.g., `XXXX XXXX 1234`). Atomy India accepts masked Aadhaar copies.
2. **Watermarking**: You can lightly watermark or write *"For Atomy India Membership Withdrawal Only"* across the copy before uploading.
3. **Chat History Privacy**:
   - In ChatGPT: Enable **Temporary Chat** mode so data is not saved to history or used for model training.
   - In Gemini: Use an Incognito or temporary prompt session if desired.
4. **Local Browser Application**:
   - The React/Vite web application in this repository processes images directly in your browser (`pdf-lib`) and keeps API keys stored solely in your local browser `localStorage`. No documents are uploaded to third-party databases.
