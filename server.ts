import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Generous body limit for high-resolution document uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Gemini AI client initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Candidate models for resilience against temporary demand spikes
const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

async function generateWithFallback(params: {
  contents: any;
  config?: any;
}) {
  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      console.warn(`Model ${model} returned error, trying fallback if available:`, err?.message);
      lastError = err;
    }
  }
  throw lastError;
}

// Endpoint: AI Document Extraction from PAN Card & Aadhaar Card
app.post('/api/extract-documents', async (req, res) => {
  try {
    const { panImage, aadhaarImage, aadhaarBackImage } = req.body;

    if (!panImage && !aadhaarImage) {
      return res.status(400).json({
        error: 'Please provide at least a PAN card or Aadhaar card image.',
      });
    }

    const parts: any[] = [];

    // Helper to format inlineData for Gemini
    const addImagePart = (dataUrl: string, label: string) => {
      const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
        parts.push({
          text: `Above image is: ${label}`,
        });
      }
    };

    if (panImage) {
      addImagePart(panImage, 'PAN Card (Permanent Account Number - India)');
    }
    if (aadhaarImage) {
      addImagePart(aadhaarImage, 'Aadhaar Card (Front Side)');
    }
    if (aadhaarBackImage) {
      addImagePart(aadhaarBackImage, 'Aadhaar Card (Back Side / Address side)');
    }

    parts.push({
      text: `You are an expert KYC document verification and OCR system specialized in Indian documents (PAN Card and Aadhaar Card).
Extract the required information accurately:
1. applicantName: The individual's full name as printed on the PAN card or Aadhaar card.
2. panNumber: The 10-character alphanumeric PAN number (e.g., ABCDE1234F).
3. aadhaarNumber: The 12-digit Aadhaar number if visible (e.g., XXXX XXXX 1234 or formatted).
4. dob: Date of birth in DD/MM/YYYY format if present.
5. mobileNumber: Mobile number if printed or visible on Aadhaar (leave empty if not found).
6. emailId: Email address if printed or visible (leave empty if not found).
7. address: The street / locality address line extracted from the back or front of Aadhaar.
8. city: The city or town or district.
9. state: The Indian State or Union Territory.
10. pinCode: The 6-digit postal PIN code.
11. confidenceNotes: A short message explaining what was successfully read or any recommendations.

If a field is not found in the documents, return empty string "".
Return the output strictly in the requested JSON schema.`,
    });

    const response = await generateWithFallback({
      contents: { parts },
      config: {
        systemInstruction:
          'You are a high-precision KYC document data extraction engine. You extract text from Indian PAN and Aadhaar identity documents accurately.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            applicantName: {
              type: Type.STRING,
              description: "The full name of the applicant as printed on the PAN or Aadhaar card",
            },
            panNumber: {
              type: Type.STRING,
              description: "10-character PAN number",
            },
            aadhaarNumber: {
              type: Type.STRING,
              description: "12-digit Aadhaar number or masked representation",
            },
            dob: {
              type: Type.STRING,
              description: "Date of birth in DD/MM/YYYY format if visible",
            },
            mobileNumber: {
              type: Type.STRING,
              description: "Mobile number if visible",
            },
            emailId: {
              type: Type.STRING,
              description: "Email address if visible",
            },
            address: {
              type: Type.STRING,
              description: "Residential address line extracted from Aadhaar",
            },
            city: {
              type: Type.STRING,
              description: "City or district name",
            },
            state: {
              type: Type.STRING,
              description: "State or UT name",
            },
            pinCode: {
              type: Type.STRING,
              description: "6-digit postal pin code",
            },
            confidenceNotes: {
              type: Type.STRING,
              description: "Summary of extracted documents and any observations",
            },
          },
          required: ['applicantName', 'panNumber'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error extracting documents:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process document images with Gemini AI.',
    });
  }
});

// Endpoint: AI Email Drafter for Atomy Membership Withdrawal
app.post('/api/draft-email', async (req, res) => {
  const {
    applicantName,
    memberId,
    panNumber,
    mobileNumber,
    emailId,
    reason,
    tone = 'formal',
  } = req.body;

  const fallbackRecipient = 'atomy_in@atomypark.com';
  const fallbackSubject = `Atomy Membership Withdrawal Form _ ${memberId || 'Membership ID'}`;
  const fallbackBody = `Dear Atomy India Support Team,\n\nPlease accept this email as my formal request for withdrawal of my Atomy India membership.\n\nMember Details:\n- Name: ${applicantName || 'Applicant'}\n- Member ID: ${memberId || 'N/A'}\n- PAN Number: ${panNumber || 'N/A'}\n- Registered Mobile: ${mobileNumber || 'N/A'}\n- Registered Email: ${emailId || 'N/A'}\n- Reason for Withdrawal: ${reason || 'Personal reasons'}\n\nI have filled, signed, and attached the official Atomy Membership Withdrawal Request Form (including my pasted PAN card photo and signature) as required.\n\nKindly process my withdrawal request and send a confirmation of account closure to my registered email address.\n\nThank you for your assistance.\n\nSincerely,\n${applicantName || 'Applicant'}\nMobile: ${mobileNumber || 'N/A'}\nEmail: ${emailId || 'N/A'}`;

  try {
    const prompt = `You are an AI assistant helping a member send an official Atomy Membership Withdrawal Request email.
Here are the member details:
- Applicant Name: ${applicantName || 'Applicant'}
- Atomy Member ID: ${memberId || 'N/A'}
- PAN Number: ${panNumber || 'N/A'}
- Registered Mobile: ${mobileNumber || 'N/A'}
- Registered Email: ${emailId || 'N/A'}
- Reason for Withdrawal: ${reason || 'Personal reasons / not actively pursuing the membership'}
- Tone: ${tone}

Requirements from official Atomy India form guidelines:
- Official recipient email: atomy_in@atomypark.com
- Required subject format: "Atomy Membership Withdrawal Form _ ${memberId}"
- Content: A polite, clear, professional cover letter explaining that the signed Atomy Membership Withdrawal Form along with ID proofs (PAN card and Aadhaar card) are attached.
- Remind Atomy customer service to acknowledge receipt and confirm de-registration/cancellation.
- Include a clear signature block with name, member ID, phone, and email.

Return the response in JSON with:
1. recipient: "atomy_in@atomypark.com"
2. subject: "Atomy Membership Withdrawal Form _ ${memberId}"
3. body: The complete email message text (formatted with neat paragraphs and line breaks).`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction:
          'You write professional, polite corporate correspondence for Indian direct selling membership cancellations according to official company guidelines.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipient: { type: Type.STRING },
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
          },
          required: ['recipient', 'subject', 'body'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      data: {
        recipient: parsed.recipient || fallbackRecipient,
        subject: parsed.subject || fallbackSubject,
        body: parsed.body || fallbackBody,
      },
    });
  } catch (error: any) {
    console.warn('Gemini draft-email encountered temporary issue, returning graceful template:', error?.message);
    return res.json({
      success: true,
      data: {
        recipient: fallbackRecipient,
        subject: fallbackSubject,
        body: fallbackBody,
      },
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
