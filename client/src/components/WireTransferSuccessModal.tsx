import React from 'react';
import { X, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface WireTransferSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferData: {
    transferId: string;
    recipientName: string;
    recipientBank: string;
    recipientBankAddress: string; // <-- Add this line
    amount: number;
    fee: number;
    totalAmount: number;
    estimatedProcessingTime: string;
    receiptPath: string;
  };
}

const WireTransferSuccessModal: React.FC<WireTransferSuccessModalProps> = ({
  isOpen,
  onClose,
  transferData
}) => {
  const handleDownloadReceipt = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`http://localhost:5002/api/transactions/receipts/${transferData.transferId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error('Failed to download receipt');
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wire-transfer-${transferData.transferId}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => {
        console.error('Download error:', error);
        alert('Failed to download receipt. Please try again.');
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Wire Transfer Submitted</h2>
              <p className="text-sm text-gray-500">Reference: {transferData.transferId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Badge */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex items-center space-x-2 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full">
              <Clock size={16} />
              <span className="font-medium">Processing</span>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={20} />
              <h3 className="text-green-800 font-medium">Wire Transfer Submitted Successfully</h3>
            </div>
            <p className="text-green-700 text-sm mt-2">
              Your wire transfer has been submitted and is currently being processed.
              You will receive an email notification once the transfer is completed.
            </p>
          </div>

          {/* Transfer Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Transfer Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Recipient:</span>
                <p className="font-medium">{transferData.recipientName}</p>
              </div>
              <div>
                <span className="text-gray-500">Bank:</span>
                <p className="font-medium">{transferData.recipientBank}</p>
              </div>
              <div>
                <span className="text-gray-500">Transfer Amount:</span>
                <p className="font-medium">${transferData.amount.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-500">Wire Fee:</span>
                <p className="font-medium">${transferData.fee.toFixed(2)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Total Amount:</span>
                <p className="font-medium text-lg">${transferData.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Processing Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="text-blue-600" size={16} />
              <h4 className="font-semibold text-blue-900">Processing Information</h4>
            </div>
            <p className="text-blue-800 text-sm">
              Estimated processing time: <strong>{transferData.estimatedProcessingTime}</strong>
            </p>
            <p className="text-blue-700 text-xs mt-2">
              Your wire transfer is being reviewed by our processing team.
              You will receive an email notification with the final status.
            </p>
          </div>

          {/* Receipt Download */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Download Receipt</h4>
            <p className="text-gray-600 text-sm mb-4">
              Download your wire transfer receipt for your records. This receipt includes all transfer details
              and serves as proof of your transaction request.
            </p>
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download size={16} />
              <span>Download Receipt</span>
            </button>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="text-yellow-600" size={16} />
              <h4 className="font-semibold text-yellow-900">Important Notes</h4>
            </div>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• Keep this receipt for your records</li>
              <li>• Processing time may vary based on recipient bank</li>
              <li>• You will receive email notifications for status updates</li>
              <li>• Contact customer service if you have any questions</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              // Navigate to transactions page
              window.location.href = '/transactions';
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            View Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default WireTransferSuccessModal;