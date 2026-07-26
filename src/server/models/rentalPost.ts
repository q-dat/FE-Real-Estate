import { Schema, model, models } from 'mongoose';

const RentalPostSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    images: { type: [String], default: [] },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'RentalCategoryModel', required: true },

    propertyType: { type: String },
    locationType: { type: String },
    direction: { type: String },

    price: { type: Number, required: true, min: 0 },
    priceUnit: { type: String, required: true },
    pricePerM2: { type: Number, min: 0 },

    area: { type: Number, required: true, min: 0 },
    frontageWidth: { type: Number, min: 0, default: 0 },
    lotDepth: { type: Number, min: 0, default: 0 },
    backSize: { type: Number, min: 0, default: 0 },
    floorNumber: { type: Number, min: 0 },
    bedroomNumber: { type: Number, min: 0 },
    toiletNumber: { type: Number, min: 0 },
    legalStatus: { type: String },
    furnitureStatus: { type: String },

    province: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String },
    address: { type: String, required: true },

    amenities: { type: String },
    youtubeLink: { type: String },
    videoTitle: { type: String },
    videoDescription: { type: String },

    postType: {
      type: String,
      enum: ['basic', 'vip1', 'vip2', 'vip3', 'highlight'],
      default: 'highlight',
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'expired', 'hidden'],
      default: 'active',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'UserModel',
      required: true,
      index: true,
    },
    adminNote: { type: String },
    adminImages: { type: [String], default: [] },
    postedAt: { type: Date, default: Date.now },
    expiredAt: { type: Date },
  },
  { timestamps: true, collection: 'rental-posts-admin' }
);

export const RentalPostAdminModel =
  models.RentalPostAdminModel || model('RentalPostAdminModel', RentalPostSchema);
