import * as fs from 'fs';
import * as path from 'path';

interface WireTransferReceiptData {
  transferId: string;
  date: string;
  senderName: string;
  senderAccount: string;
  senderBank: string;
  recipientName: string;
  recipientAccount: string;
  recipientBank: string;
  routingNumber: string;
  swiftCode: string;
  amount: number;
  fee: number;
  totalAmount: number;
  priority: string;
  description: string;
  estimatedProcessingTime: string;
}

export const generateWireTransferReceipt = (data: WireTransferReceiptData): string => {
  const receiptHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wire Transfer Receipt - ${data.transferId}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
            position: relative;
        }
        
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 48px;
            font-weight: 700;
            color: rgba(0, 44, 95, 0.1);
            z-index: 1;
            pointer-events: none;
            white-space: nowrap;
        }
        
        .header {
            background: linear-gradient(135deg, #002C5F 0%, #1e40af 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
            z-index: 2;
        }
        
        .bank-logo {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 32px;
            font-weight: 700;
            color: #002C5F;
        }
        
        .bank-name {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .bank-subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }
        
        .receipt-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .receipt-subtitle {
            font-size: 14px;
            opacity: 0.8;
        }
        
        .content {
            padding: 40px;
            position: relative;
            z-index: 2;
        }
        
        .status-badge {
            display: inline-block;
            background: #fef3c7;
            color: #92400e;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 30px;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #002C5F;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .detail-item {
            display: flex;
            flex-direction: column;
        }
        
        .detail-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        
        .detail-value {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
        }
        
        .amount-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .amount-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .amount-row:last-child {
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
            margin-top: 12px;
            font-weight: 700;
            font-size: 18px;
        }
        
        .processing-info {
            background: #dbeafe;
            border: 1px solid #93c5fd;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
        }
        
        .processing-title {
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 8px;
        }
        
        .processing-text {
            color: #374151;
            font-size: 14px;
        }
        
        .footer {
            background: #f9fafb;
            padding: 20px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            position: relative;
            z-index: 2;
        }
        
        .footer-text {
            font-size: 12px;
            color: #6b7280;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .receipt-container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .watermark {
                opacity: 0.3;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="watermark">CUSTOMER'S COPY</div>
        
        <div class="header">
            <div class="bank-logo">C</div>
            <div class="bank-name">Cornerstone Financial</div>
            <div class="bank-subtitle">Credit Union</div>
        </div>
        
        <div class="content">
            <div class="receipt-title">Wire Transfer Receipt</div>
            <div class="receipt-subtitle">Reference: ${data.transferId}</div>
            
            <div class="status-badge">Processing</div>
            
            <div class="section">
                <div class="section-title">Transfer Details</div>
                <div class="details-grid">
                    <div class="detail-item">
                        <div class="detail-label">Transfer ID</div>
                        <div class="detail-value">${data.transferId}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Date & Time</div>
                        <div class="detail-value">${new Date(data.date).toLocaleString()}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Priority</div>
                        <div class="detail-value">${data.priority.charAt(0).toUpperCase() + data.priority.slice(1)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Description</div>
                        <div class="detail-value">${data.description}</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Sender Information</div>
                <div class="details-grid">
                    <div class="detail-item">
                        <div class="detail-label">Account Holder</div>
                        <div class="detail-value">${data.senderName}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Account Number</div>
                        <div class="detail-value">****${data.senderAccount.slice(-4)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Bank</div>
                        <div class="detail-value">${data.senderBank}</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Recipient Information</div>
                <div class="details-grid">
                    <div class="detail-item">
                        <div class="detail-label">Recipient Name</div>
                        <div class="detail-value">${data.recipientName}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Account Number</div>
                        <div class="detail-value">${data.recipientAccount}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Bank</div>
                        <div class="detail-value">${data.recipientBank}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Routing Number</div>
                        <div class="detail-value">${data.routingNumber}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">SWIFT Code</div>
                        <div class="detail-value">${data.swiftCode}</div>
                    </div>
                </div>
            </div>
            
            <div class="amount-section">
                <div class="amount-row">
                    <span>Transfer Amount:</span>
                    <span>$${data.amount.toFixed(2)}</span>
                </div>
                <div class="amount-row">
                    <span>Wire Transfer Fee:</span>
                    <span>$${data.fee.toFixed(2)}</span>
                </div>
                <div class="amount-row">
                    <span>Total Amount:</span>
                    <span>$${data.totalAmount.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="processing-info">
                <div class="processing-title">Processing Information</div>
                <div class="processing-text">
                    Your wire transfer is currently being processed. Estimated processing time: ${data.estimatedProcessingTime}. 
                    You will receive an email notification once the transfer is completed or if any issues arise.
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                This receipt serves as proof of your wire transfer request. Please retain for your records.<br>
                For questions, contact us at 1-800-CFCU-HELP or visit www.bankcfcu.org
            </div>
        </div>
    </div>
</body>
</html>`;

  return receiptHtml;
};

export const saveReceiptToFile = (receiptHtml: string, transferId: string): string => {
  const receiptsDir = path.join(__dirname, '../receipts');
  
  // Create receipts directory if it doesn't exist
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }
  
  const fileName = `wire-transfer-${transferId}.html`;
  const filePath = path.join(receiptsDir, fileName);
  
  fs.writeFileSync(filePath, receiptHtml);
  
  return filePath;
}; 