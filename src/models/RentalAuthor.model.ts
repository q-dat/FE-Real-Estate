import { Schema, model, models } from 'mongoose';

const RentalAuthorSchema = new Schema(
  {
    userCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    zalo: String,
    avatar: String,
    accountBalance: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const RentalAuthor = models.RentalAuthor || model('RentalAuthor', RentalAuthorSchema);
