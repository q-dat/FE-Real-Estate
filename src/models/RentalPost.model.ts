import { Schema, model, models } from 'mongoose';

const RentalPostSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, require: true },
    category: { type: Schema.Types.ObjectId, ref: 'RentalCategory', required: true },
    price: { type: Number, required: true },
    priceUnit: { type: String, default: 'VNĐ/tháng' },
    area: Number,

    province: String,
    district: String,
    ward: String,
    address: String,

    images: [String],
    amenities: [String],

    youtubeLink: String,
    videoTitle: String,
    videoDescription: String,

    postType: { type: String, enum: ['basic', 'vip1', 'vip2', 'vip3', 'highlight'], default: 'basic' },
    fastRent: { type: Number, enum: [0, 1], default: 0 },
    status: { type: String, enum: ['active', 'pending', 'expired', 'hidden'], default: 'pending' },
    isApproved: { type: Boolean, default: false },

    postPackage: {
      packageName: { type: String, default: 'Tin thường' },
      pricePerDay: Number,
      days: Number,
      totalPrice: Number,
      purchasedAt: Date,
      expiredAt: Date,
      autoExtend: Boolean,
    },

    autoBoost: {
      enabled: Boolean,
      intervalHours: Number,
      lastBoostAt: Date,
      nextBoostAt: Date,
    },

    views: { type: Number, default: 0 },
    favoritesCount: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: 'RentalAuthor', required: true },

    expiredAt: Date,
    adminNote: String,
  },
  { timestamps: true }
);

export const RentalPost = models.RentalPost || model('RentalPost', RentalPostSchema);
