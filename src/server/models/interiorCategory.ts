import { Schema, model, models } from 'mongoose';

const InteriorCategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    categoryCode: { type: Number },
    description: { type: String },
  },
  { timestamps: true, collection: 'interior_categories' }
);

export const InteriorCategoryModel =
  models.InteriorCategoryModel || model('InteriorCategoryModel', InteriorCategorySchema);
