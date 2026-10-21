export interface DocumentExtractionResult {
  applicantName: string;
  panNumber: string;
  aadhaarNumber: string;
  dob?: string;
  mobileNumber?: string;
  emailId?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  confidenceNotes?: string;
}

export interface WithdrawalFormData {
  applicantName: string;
  memberId: string;
  panNumber: string;
  mobileNumber: string;
  emailId: string;
  aadhaarNumber: string;
  otherIdProof: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  reason: string;
  date: string;
  place: string;
  panImageWebP: string | null;
  aadhaarImageWebP: string | null;
  aadhaarBackImageWebP: string | null;
  signatureImageWebP: string | null;
}

export interface EmailDraft {
  recipient: string;
  subject: string;
  body: string;
}
