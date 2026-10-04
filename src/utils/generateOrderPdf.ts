import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, StoreSettings } from '../types';

/**
 * Loads an image from a URL and converts it to a base64 Data URL.
 * Returns null if the image fails to load or is blocked by CORS.
 */
async function loadImageAsDataUrl(url: string): Promise<string | null> {
  if (!url) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = url;
  });
}

export async function generateOrderPdf(order: Order, settings?: StoreSettings): Promise<void> {
  // Create A4 PDF in portrait mode (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm

  const storeName = settings?.storeName || 'Shanghai Namutong International Trade Co. Ltd';
  const storePhone = settings?.phoneNumber || '+880 1711-234567';
  const storeEmail = settings?.email || 'info@shanghainamutong.com';
  const storeAddress = settings?.storeAddress || 'Level 7, Suite 702, Trade Tower, Dilkusha C/A, Dhaka-1000, Bangladesh';

  // --- 1. HEADER SECTION (Two-Column Layout) ---
  const startY = 15;
  const leftColX = margin;
  const rightColX = pageWidth - margin; // 195mm

  // Try to load store logo if available
  let logoLoaded = false;
  if (settings?.storeLogo) {
    try {
      const logoData = await loadImageAsDataUrl(settings.storeLogo);
      if (logoData) {
        doc.addImage(logoData, 'PNG', leftColX, startY, 24, 12);
        logoLoaded = true;
      }
    } catch {
      logoLoaded = false;
    }
  }

  // Position text beside logo (or badge)
  const brandTextX = logoLoaded ? leftColX + 28 : leftColX + 16;
  const maxLeftTextWidth = 125 - brandTextX; // Caps left text at X = 125mm, leaving 15mm gap before right column

  if (!logoLoaded) {
    // Elegant branded logo badge
    doc.setFillColor(15, 23, 42); // slate-900
    doc.roundedRect(leftColX, startY, 12, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const initials = storeName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('') || 'CD';
    doc.text(initials, leftColX + 6, startY + 8, { align: 'center' });
  }

  // LEFT SIDE: Store Information (strictly inside left column)
  let currentLeftY = startY + 3.5;

  // Store Name
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const storeNameLines = doc.splitTextToSize(storeName, maxLeftTextWidth);
  doc.text(storeNameLines, brandTextX, currentLeftY);
  currentLeftY += storeNameLines.length * 4.5;

  // Full Store Address (properly wrapped)
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const addressLines = doc.splitTextToSize(storeAddress, maxLeftTextWidth);
  doc.text(addressLines, brandTextX, currentLeftY);
  currentLeftY += addressLines.length * 3.4;

  // Phone Number
  doc.text(`Phone: ${storePhone}`, brandTextX, currentLeftY, { maxWidth: maxLeftTextWidth });
  currentLeftY += 3.4;

  // Email Address
  doc.text(`Email: ${storeEmail}`, brandTextX, currentLeftY, { maxWidth: maxLeftTextWidth });
  currentLeftY += 3.4;

  // RIGHT SIDE: ORDER INVOICE, Order Number, Order Date (strictly inside right column)
  // Badge: ORDER INVOICE
  const invoiceBadgeWidth = 35;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(rightColX - invoiceBadgeWidth, startY - 0.5, invoiceBadgeWidth, 6.5, 1.2, 1.2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ORDER INVOICE', rightColX - invoiceBadgeWidth / 2, startY + 4, { align: 'center' });

  // Order Number
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('ORDER NUMBER', rightColX, startY + 11.5, { align: 'right' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(`#${order.orderNumber}`, rightColX, startY + 16, { align: 'right' });

  // Order Date
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('ORDER DATE', rightColX, startY + 21, { align: 'right' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(order.orderDate || new Date().toISOString().split('T')[0], rightColX, startY + 25, {
    align: 'right',
  });

  // Divider Line (placed cleanly below whichever column is taller)
  const headerBottomY = Math.max(currentLeftY, startY + 27, logoLoaded ? startY + 14 : startY + 13);
  const dividerY = headerBottomY + 4;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.6);
  doc.line(margin, dividerY, pageWidth - margin, dividerY);

  // --- 2. CUSTOMER & ORDER INFO (Two Column Cards) ---
  const cardY = dividerY + 5;
  const cardWidth = (contentWidth - 6) / 2; // 87mm each
  const cardHeight = 36;

  // Left Card: Customer Information
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, cardY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CUSTOMER INFORMATION', margin + 4, cardY + 6);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 4, cardY + 8, margin + cardWidth - 4, cardY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Customer Name:', margin + 4, cardY + 13);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(order.customerName || 'N/A', margin + 28, cardY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Mobile Number:', margin + 4, cardY + 18);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(order.mobileNumber || 'N/A', margin + 28, cardY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('District:', margin + 4, cardY + 23);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(order.district || 'N/A', margin + 28, cardY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Full Address:', margin + 4, cardY + 28);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  const splitAddress = doc.splitTextToSize(order.address || 'N/A', cardWidth - 32);
  doc.text(splitAddress, margin + 28, cardY + 28);

  // Right Card: Order & Payment Info
  const rightCardX = margin + cardWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightCardX, cardY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ORDER & PAYMENT DETAILS', rightCardX + 4, cardY + 6);
  doc.line(rightCardX + 4, cardY + 8, rightCardX + cardWidth - 4, cardY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Payment Method:', rightCardX + 4, cardY + 13);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.setFont('helvetica', 'bold');
  doc.text(order.paymentMethod || 'Cash Payment', rightCardX + 30, cardY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Payment Status:', rightCardX + 4, cardY + 18);
  doc.setFont('helvetica', 'bold');
  const payStatus = order.paymentStatus || 'Payment Pending';
  if (payStatus.toLowerCase().includes('paid') || payStatus.toLowerCase().includes('confirmed')) {
    doc.setTextColor(16, 185, 129); // emerald-600
  } else {
    doc.setTextColor(217, 119, 6); // amber-600
  }
  doc.text(payStatus, rightCardX + 30, cardY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Order Status:', rightCardX + 4, cardY + 23);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(order.orderStatus || 'Pending', rightCardX + 30, cardY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Total Items:', rightCardX + 4, cardY + 28);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  const totalQty = order.quantities || order.products.reduce((acc, p) => acc + (p.quantity || 1), 0);
  doc.text(`${totalQty} pcs`, rightCardX + 30, cardY + 28);

  // --- 3. PRODUCTS TABLE ---
  const tableStartY = cardY + cardHeight + 8;

  const tableBody = order.products.map((p, index) => {
    const qty = p.quantity || 1;
    const price = Number(p.price) || 0;
    const lineTotal = price * qty;
    let productName = p.name || 'Product';
    if (p.selectedOptions && Object.keys(p.selectedOptions).length > 0) {
      const optionsStr = Object.entries(p.selectedOptions)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ');
      productName += `\n[${optionsStr}]`;
    }
    return [
      (index + 1).toString(),
      productName,
      qty.toString(),
      `BDT ${price.toLocaleString('en-US')}`,
      `BDT ${lineTotal.toLocaleString('en-US')}`,
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    head: [['#', 'Product Name', 'Quantity', 'Product Price', 'Total']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 3,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 22 },
      3: { halign: 'right', cellWidth: 32 },
      4: { halign: 'right', cellWidth: 35, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'head') {
        if (data.column.index === 0 || data.column.index === 2) {
          data.cell.styles.halign = 'center';
        }
        if (data.column.index === 3 || data.column.index === 4) {
          data.cell.styles.halign = 'right';
        }
      }
    },
  });

  // Get position after table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || tableStartY + 40;

  // --- 4. SUMMARY BOX (No Delivery Charge, strictly Product Price × Quantity = Total Amount) ---
  const summaryBoxY = finalY + 6;
  const summaryBoxWidth = 72;
  const summaryBoxX = pageWidth - margin - summaryBoxWidth;
  const calculatedTotal =
    order.subtotal ||
    order.products.reduce((acc, p) => acc + (Number(p.price) || 0) * (Number(p.quantity) || 1), 0);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, 24, 2, 2, 'FD');

  // Subtotal line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', summaryBoxX + 5, summaryBoxY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`BDT ${calculatedTotal.toLocaleString('en-US')}`, summaryBoxX + summaryBoxWidth - 5, summaryBoxY + 7, {
    align: 'right',
  });

  // Solid Divider inside summary
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(summaryBoxX + 5, summaryBoxY + 11, summaryBoxX + summaryBoxWidth - 5, summaryBoxY + 11);

  // Total Amount line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Total Amount:', summaryBoxX + 5, summaryBoxY + 18);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text(`BDT ${calculatedTotal.toLocaleString('en-US')}`, summaryBoxX + summaryBoxWidth - 5, summaryBoxY + 18, {
    align: 'right',
  });

  // --- 5. FOOTER & SIGNATURES ---
  const footerY = Math.max(summaryBoxY + 36, pageHeight - 42);

  // Signature lines
  const sigWidth = 45;
  const sig1X = margin + 10;
  const sig2X = pageWidth - margin - sigWidth - 10;

  doc.setDrawColor(148, 163, 184); // slate-400
  doc.setLineWidth(0.3);
  doc.line(sig1X, footerY, sig1X + sigWidth, footerY);
  doc.line(sig2X, footerY, sig2X + sigWidth, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Customer Signature', sig1X + sigWidth / 2, footerY + 4, { align: 'center' });
  doc.text(`Authorized Signature (${storeName})`, sig2X + sigWidth / 2, footerY + 4, { align: 'center' });

  // Bottom Notice
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text(
    `Thank you for your business! For queries contact ${storePhone} or ${storeEmail}`,
    pageWidth / 2,
    pageHeight - 12,
    { align: 'center' }
  );
  doc.text(
    `Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })} • A4 Official Order Invoice`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  // --- 6. TRIGGER DOWNLOAD (Works reliably across Desktop & Mobile) ---
  const fileName = `Order-${order.orderNumber}.pdf`;

  try {
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch {
        // ignore cleanup error
      }
    }, 1500);
  } catch {
    // Fallback to standard jsPDF save
    doc.save(fileName);
  }
}
