import { Schema, model, models } from 'mongoose';

const RentalCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const RentalCategory = models.RentalCategory || model('RentalCategory', RentalCategorySchema);
