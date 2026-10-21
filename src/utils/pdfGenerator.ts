import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { WithdrawalFormData } from '../types';

/**
 * Converts any image Data URL (including image/webp) to PNG bytes for pdf-lib embedding
 */
async function dataUrlToPngBytes(dataUrl: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert image to blob'));
          return;
        }
        const arrayBuffer = await blob.arrayBuffer();
        resolve(new Uint8Array(arrayBuffer));
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('Failed to load image for PDF embedding'));
    img.src = dataUrl;
  });
}

/**
 * Splits text into lines that fit within a specified max width
 */
function wrapText(
  text: string,
  maxWidth: number,
  font: any,
  fontSize: number
): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export async function generateAtomyWithdrawalPdf(
  formData: WithdrawalFormData
): Promise<{ pdfBytes: Uint8Array; blobUrl: string }> {
  // Fetch the official template PDF
  const templateUrl = '/assets/aistudio/1.Atomy_Membership_Withdrawl_Request_Form_ea98508f.pdf';
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error('Could not load official Atomy withdrawal form template.');
  }
  const templateBytes = await response.arrayBuffer();

  const pdfDoc = await PDFDocument.load(templateBytes);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.getPage(0);

  const textColor = rgb(0.08, 0.12, 0.2); // Clean dark navy-black ink

  // 1. Applicant's Name
  if (formData.applicantName) {
    page.drawText(formData.applicantName.toUpperCase(), {
      x: 142,
      y: 724,
      size: 9.5,
      font: fontBold,
      color: textColor,
    });
  }

  // 2. Member ID
  if (formData.memberId) {
    page.drawText(formData.memberId.toUpperCase(), {
      x: 394,
      y: 724,
      size: 9.5,
      font: fontBold,
      color: textColor,
    });
  }

  // 3. PAN Number
  if (formData.panNumber) {
    page.drawText(formData.panNumber.toUpperCase(), {
      x: 142,
      y: 701,
      size: 9,
      font: fontRegular,
      color: textColor,
    });
  }

  // 4. Mobile Number
  if (formData.mobileNumber) {
    page.drawText(formData.mobileNumber, {
      x: 394,
      y: 701,
      size: 9,
      font: fontRegular,
      color: textColor,
    });
  }

  // 5. Email ID
  if (formData.emailId) {
    page.drawText(formData.emailId, {
      x: 142,
      y: 685,
      size: 8.5,
      font: fontRegular,
      color: textColor,
    });
  }

  // 6. Other ID proof
  const otherIdText = formData.otherIdProof || (formData.aadhaarNumber ? `Aadhaar Card: ${formData.aadhaarNumber}` : 'Aadhaar Card attached');
  page.drawText(otherIdText, {
    x: 142,
    y: 669,
    size: 8.5,
    font: fontRegular,
    color: textColor,
  });

  // 7. Address
  if (formData.address) {
    // First line starts next to "Address:" label (width ~430)
    const allLines = wrapText(formData.address, 480, fontRegular, 8.5);
    if (allLines.length > 0) {
      // First line
      page.drawText(allLines[0], {
        x: 108,
        y: 653,
        size: 8.5,
        font: fontRegular,
        color: textColor,
      });
      // Additional lines
      let currentY = 639;
      for (let i = 1; i < Math.min(allLines.length, 3); i++) {
        page.drawText(allLines[i], {
          x: 56,
          y: currentY,
          size: 8.5,
          font: fontRegular,
          color: textColor,
        });
        currentY -= 14;
      }
    }
  }

  // City, State, Pin Code
  if (formData.city) {
    page.drawText(formData.city, {
      x: 140,
      y: 590,
      size: 8.5,
      font: fontRegular,
      color: textColor,
    });
  }
  if (formData.state) {
    page.drawText(formData.state, {
      x: 283,
      y: 590,
      size: 8.5,
      font: fontRegular,
      color: textColor,
    });
  }
  if (formData.pinCode) {
    page.drawText(formData.pinCode, {
      x: 445,
      y: 590,
      size: 8.5,
      font: fontRegular,
      color: textColor,
    });
  }

  // 8. Reason for withdrawal
  if (formData.reason) {
    const reasonLines = wrapText(formData.reason, 475, fontRegular, 8.5);
    if (reasonLines.length > 0) {
      page.drawText(reasonLines[0], {
        x: 172,
        y: 574,
        size: 8.5,
        font: fontRegular,
        color: textColor,
      });
      let currentY = 559;
      for (let i = 1; i < Math.min(reasonLines.length, 4); i++) {
        page.drawText(reasonLines[i], {
          x: 56,
          y: currentY,
          size: 8.5,
          font: fontRegular,
          color: textColor,
        });
        currentY -= 14;
      }
    }
  }

  // 9. Embed PAN card image into designated box
  if (formData.panImageWebP) {
    try {
      const panPngBytes = await dataUrlToPngBytes(formData.panImageWebP);
      const panEmbedded = await pdfDoc.embedPng(panPngBytes);

      // Target box coordinates: x=108.29, y=316.42, w=368.54, h=166.85
      const targetX = 110;
      const targetY = 318;
      const targetW = 364;
      const targetH = 163;

      // Draw clean background over "Please paste image of PAN card" watermark
      page.drawRectangle({
        x: targetX,
        y: targetY,
        width: targetW,
        height: targetH,
        color: rgb(1, 1, 1),
      });

      // Maintain aspect ratio centered in box
      const imgAspect = panEmbedded.width / panEmbedded.height;
      const boxAspect = targetW / targetH;
      let drawW = targetW;
      let drawH = targetH;
      let drawX = targetX;
      let drawY = targetY;

      if (imgAspect > boxAspect) {
        // Image is wider than box
        drawW = targetW - 6;
        drawH = drawW / imgAspect;
        drawX = targetX + 3;
        drawY = targetY + (targetH - drawH) / 2;
      } else {
        // Image is taller than box
        drawH = targetH - 6;
        drawW = drawH * imgAspect;
        drawX = targetX + (targetW - drawW) / 2;
        drawY = targetY + 3;
      }

      page.drawImage(panEmbedded, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH,
      });
    } catch (e) {
      console.error('Failed to embed PAN image into PDF:', e);
    }
  }

  // 10. Date & Place
  if (formData.date) {
    page.drawText(formData.date, {
      x: 88,
      y: 271,
      size: 9,
      font: fontRegular,
      color: textColor,
    });
  }
  if (formData.place) {
    page.drawText(formData.place, {
      x: 418,
      y: 271,
      size: 9,
      font: fontRegular,
      color: textColor,
    });
  }

  // 11. Name & Signature
  if (formData.applicantName) {
    page.drawText(formData.applicantName.toUpperCase(), {
      x: 92,
      y: 254,
      size: 9,
      font: fontBold,
      color: textColor,
    });
  }

  if (formData.signatureImageWebP) {
    try {
      const sigPngBytes = await dataUrlToPngBytes(formData.signatureImageWebP);
      const sigEmbedded = await pdfDoc.embedPng(sigPngBytes);

      // Signature area next to Signature label: x ≈ 435, y ≈ 238, w ≈ 105, h ≈ 34
      const maxSigW = 105;
      const maxSigH = 34;
      const sigAspect = sigEmbedded.width / sigEmbedded.height;
      let sigW = maxSigW;
      let sigH = maxSigW / sigAspect;
      if (sigH > maxSigH) {
        sigH = maxSigH;
        sigW = sigH * sigAspect;
      }

      page.drawImage(sigEmbedded, {
        x: 435 + (maxSigW - sigW) / 2,
        y: 242,
        width: sigW,
        height: sigH,
      });
    } catch (e) {
      console.error('Failed to embed signature into PDF:', e);
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);

  return { pdfBytes, blobUrl };
}
