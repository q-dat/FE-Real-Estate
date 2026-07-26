import { Schema, model, models } from 'mongoose';

const PostSchema = new Schema(
  {
    image: { type: String },
    title: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true },
    content: { type: String, required: true },
    source: { type: String },
    catalog: { type: Schema.Types.ObjectId, ref: 'PostCategoryModel', required: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PostSchema.index({ title: 'text', content: 'text' });

export const PostModel = models.Post || model('Post', PostSchema);
