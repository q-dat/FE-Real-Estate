import { Schema, model, models } from 'mongoose';

const RealEstateProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    images: { type: String, required: true },
    thumbnails: { type: [String], default: [] },
    slug: { type: String, required: true, unique: true },
    introduction: { type: String },
    description: { type: String },
    article: { type: String },
    pricing: { type: String },
    status: { type: String },
    projectType: { type: String },
    area: { type: String },
    investor: { type: String },
    partners: { type: String },
    province: { type: String },
    district: { type: String },
    address: { type: String },
    ward: { type: String },
    amenities: { type: String },
    hotline: { type: String },
    email: { type: String },
    zalo: { type: String },
    message: { type: String },
  },
  { timestamps: true, collection: 'real-estate-project' }
);

export const RealEstateProjectModel =
  models.RealEstateProjectModel || model('RealEstateProjectModel', RealEstateProjectSchema);
