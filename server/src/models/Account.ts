import mongoose, { Document, Schema } from 'mongoose';

export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;
  accountNumber: string;
  type: 'checking' | 'savings' | 'credit';
  accountName: string;
  balance: number;
  availableBalance: number;
  status: 'active' | 'inactive' | 'frozen' | 'closed';
  routingNumber: string;
  lastTransactionDate?: Date;
  monthlyFee: number;
  minimumBalance: number;
  interestRate: number;
  creditLimit?: number;
  availableCredit?: number;
  isPrimary: boolean;
}

const accountSchema = new Schema<IAccount>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    length: 9
  },
  type: {
    type: String,
    enum: ['checking', 'savings', 'credit'],
    required: true
  },
  accountName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  availableBalance: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'frozen', 'closed'],
    default: 'active'
  },
  routingNumber: {
    type: String,
    required: true,
    length: 9
  },
  lastTransactionDate: {
    type: Date
  },
  monthlyFee: {
    type: Number,
    default: 0
  },
  minimumBalance: {
    type: Number,
    default: 0
  },
  interestRate: {
    type: Number,
    default: 0
  },
  creditLimit: {
    type: Number,
    required: function() { return this.type === 'credit'; }
  },
  availableCredit: {
    type: Number,
    required: function() { return this.type === 'credit'; }
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate unique 9-digit account number
accountSchema.pre('save', async function(next) {
  if (this.isNew && !this.accountNumber) {
    this.accountNumber = await generateUniqueAccountNumber();
  }
  next();
});

// Create indexes
accountSchema.index({ userId: 1 });
accountSchema.index({ accountNumber: 1 });
accountSchema.index({ type: 1 });
accountSchema.index({ status: 1 });

// Generate unique 9-digit account number
async function generateUniqueAccountNumber(): Promise<string> {
  let accountNumber: string = '';
  let isUnique = false;
  
  while (!isUnique) {
    // Generate 9-digit number starting with 1-9 (not 0)
    accountNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
    
    // Check if account number already exists
    const existingAccount = await mongoose.model('Account').findOne({ accountNumber });
    if (!existingAccount) {
      isUnique = true;
    }
  }
  
  return accountNumber;
}

export const Account = mongoose.model<IAccount>('Account', accountSchema); 