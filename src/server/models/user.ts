import { Schema, model, models } from 'mongoose';

// Chỉ lấy field public, ẩn password. Dùng để populate author của rental-post.
const UserSchema = new Schema(
  {
    userCode: { type: String },
    name: { type: String },
    phone: { type: String },
    zalo: { type: String },
    avatar: { type: String },
    role: { type: String },
    isActive: { type: Boolean },
    emailVerified: { type: Boolean },
  },
  { timestamps: true, collection: 'users' }
);

export const UserModel = models.UserModel || model('UserModel', UserSchema);
