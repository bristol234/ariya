import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  transactionId: string;
  userId: mongoose.Types.ObjectId;
  type: 'wire_transfer' | 'deposit' | 'withdrawal' | 'transfer';
  status: 'processing' | 'pending' | 'completed' | 'failed' | 'on_hold';
  amount: number;
  currency: string;
  fromAccount: {
    type: 'checking' | 'savings';
    accountNumber: string;
  };
  toAccount?: {
    type: 'checking' | 'savings';
    accountNumber: string;
  };
  recipientDetails?: {
    name: string;
    accountNumber: string;
    bankName: string;
    routingNumber: string;
    bankAddress: string; 
  };
  description: string;
  fees: number;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  transactionId: {
    type: String,
    unique: true,
    default: () => 'TXN' + Date.now() + Math.random().toString().slice(2, 8)
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['wire_transfer', 'deposit', 'withdrawal', 'transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'pending', 'completed', 'failed', 'on_hold'],
    default: 'processing'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  fromAccount: {
    type: {
      type: String,
      enum: ['checking', 'savings'],
      required: true
    },
    accountNumber: {
      type: String,
      required: true
    }
  },
  toAccount: {
    type: {
      type: String,
      enum: ['checking', 'savings']
    },
    accountNumber: String
  },
  recipientDetails: {
    name: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String,
    bankAddress: String // <-- Add this line
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  fees: {
    type: Number,
    default: 0,
    min: 0
  },
  processedAt: Date
}, {
  timestamps: true
});

// Generate transaction ID
transactionSchema.pre('save', function (next) {
  if (this.isNew) {
    this.transactionId = 'TXN' + Date.now() + Math.random().toString().slice(2, 8);
  }
  next();
});

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);