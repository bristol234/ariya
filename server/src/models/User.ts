import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  accounts: {
    checking: {
      accountNumber: string;
      balance: number;
    };
    savings: {
      accountNumber: string;
      balance: number;
    };
  };
  isActive: boolean;
  isAdmin: boolean;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  accounts: {
    checking: {
      accountNumber: {
        type: String,
        required: true,
        unique: true
      },
      balance: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    savings: {
      accountNumber: {
        type: String,
        required: true,
        unique: true
      },
      balance: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate account numbers
userSchema.pre('save', function (next) {
  if (this.isNew) {
    // Generate checking account number (10 digits)
    this.accounts.checking.accountNumber = '1' + Math.random().toString().slice(2, 11);

    // Generate savings account number (10 digits)
    this.accounts.savings.accountNumber = '2' + Math.random().toString().slice(2, 11);
  }
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);