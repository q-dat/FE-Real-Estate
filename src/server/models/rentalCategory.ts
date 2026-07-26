import { Schema, model, models } from 'mongoose';

const RentalCategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    categoryCode: { type: Number, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true, collection: 'rental-categories' }
);

export const RentalCategoryModel =
  models.RentalCategoryModel || model('RentalCategoryModel', RentalCategorySchema);
