import { Schema, model, models } from 'mongoose';

const InteriorSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: Schema.Types.ObjectId, ref: 'InteriorCategoryModel', required: true },
    images: { type: String, required: true },
    thumbnails: { type: [String], default: [] },
    status: { type: String },
    description: { type: String },
    content: { type: String },
  },
  { timestamps: true, collection: 'interior' }
);

export const InteriorModel = models.InteriorModel || model('InteriorModel', InteriorSchema);
