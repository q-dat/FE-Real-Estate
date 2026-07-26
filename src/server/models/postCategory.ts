import { Schema, model, models } from 'mongoose';

const PostCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true },
    description: { type: String },
  },
  { timestamps: true, collection: 'post-categories' }
);

export const PostCategoryModel =
  models.PostCategoryModel || model('PostCategoryModel', PostCategorySchema);
