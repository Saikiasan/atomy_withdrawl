import { GoogleGenAI, Type } from '@google/genai';
import { DocumentExtractionResult, WithdrawalFormData } from '../types';

const STORAGE_KEY = 'atomy_gemini_api_key';

// Check Vite env var if provided at build/deploy time (e.g. Cloudflare / Vercel env), otherwise fallback to user storage
const ENV_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || ENV_API_KEY;
  } catch {
    return ENV_API_KEY;
  }
}

export function saveStoredApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save API key to localStorage', e);
  }
}

export function hasApiKey(): boolean {
  return Boolean(getStoredApiKey());
}

const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

export async function extractDocumentsWithUserKey(params: {
  panImage?: string | null;
  aadhaarImage?: string | null;
  aadhaarBackImage?: string | null;
  apiKey?: string;
}): Promise<DocumentExtractionResult> {
  const apiKey = params.apiKey || getStoredApiKey();
  if (!apiKey) {
    throw new Error('Please provide your Google Gemini API key to use automatic document extraction.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const parts: any[] = [];

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

  if (params.panImage) {
    addImagePart(params.panImage, 'PAN Card (Permanent Account Number - India)');
  }
  if (params.aadhaarImage) {
    addImagePart(params.aadhaarImage, 'Aadhaar Card (Front Side)');
  }
  if (params.aadhaarBackImage) {
    addImagePart(params.aadhaarBackImage, 'Aadhaar Card (Back Side / Address side)');
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

  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
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
      return JSON.parse(text) as DocumentExtractionResult;
    } catch (err: any) {
      console.warn(`Model ${model} returned error, trying fallback if available:`, err?.message);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to extract document information using Gemini.');
}

export function generateLocalEmailDraft(
  formData: WithdrawalFormData,
  tone: 'formal' | 'polite' | 'concise' = 'formal'
): { recipient: string; subject: string; body: string } {
  const recipient = 'atomy_in@atomypark.com';
  const memberId = formData.memberId || 'INDXXXXXX';
  const subject = `Atomy Membership Withdrawal Form _ ${memberId}`;

  let body = '';
  if (tone === 'concise') {
    body = `Dear Atomy India Support Team,

Please find attached my completed and signed Atomy Membership Withdrawal Request Form and KYC documents for cancellation of my membership.

Member Details:
- Name: ${formData.applicantName || 'Applicant'}
- Member ID: ${memberId}
- PAN: ${formData.panNumber || 'N/A'}
- Mobile: ${formData.mobileNumber || 'N/A'}
- Reason: ${formData.reason || 'Personal reasons'}

Kindly confirm receipt and process the account de-registration.

Sincerely,
${formData.applicantName || 'Applicant'}
Mobile: ${formData.mobileNumber || 'N/A'}`;
  } else if (tone === 'polite') {
    body = `Dear Atomy India Customer Support Team,

I hope this email finds you well.

I am writing to formally request the withdrawal and cancellation of my Atomy India membership. I have attached my signed Atomy Membership Withdrawal Form along with copies of my PAN card and Aadhaar card for your verification.

Member Details:
- Full Name: ${formData.applicantName || 'Applicant'}
- Member ID: ${memberId}
- PAN Number: ${formData.panNumber || 'N/A'}
- Registered Contact: ${formData.mobileNumber || 'N/A'}
- Registered Email: ${formData.emailId || 'N/A'}
- Reason for Withdrawal: ${formData.reason || 'Personal reasons'}

I request you to kindly process this cancellation at the earliest and send a confirmation to my registered email address.

Thank you very much for your understanding and support.

Warm regards,
${formData.applicantName || 'Applicant'}
Phone: ${formData.mobileNumber || 'N/A'}
Email: ${formData.emailId || 'N/A'}`;
  } else {
    // Formal default
    body = `Dear Atomy India Support Team,

Please accept this email as my formal request for withdrawal of my Atomy India membership.

Member Details:
- Name: ${formData.applicantName || 'Applicant'}
- Member ID: ${memberId}
- PAN Number: ${formData.panNumber || 'N/A'}
- Registered Mobile: ${formData.mobileNumber || 'N/A'}
- Registered Email: ${formData.emailId || 'N/A'}
- Reason for Withdrawal: ${formData.reason || 'Personal reasons'}

I have filled, signed, and attached the official Atomy Membership Withdrawal Request Form (including attached identity proof documents and signature) as required by Atomy India guidelines.

Kindly process my withdrawal request and send an official confirmation of account closure to my registered email address.

Thank you for your assistance.

Sincerely,
${formData.applicantName || 'Applicant'}
Mobile: ${formData.mobileNumber || 'N/A'}
Email: ${formData.emailId || 'N/A'}`;
  }

  return { recipient, subject, body };
}
