import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // <-- added discount
    stock: { type: Number, default: 0 },
    description: { type: String },
    category: { type: String },
    tags: [{ type: String }],
    images: [{ type: String }],
    views: { type: Number, default: 0 },
    sales: { type: Number, default: 0 }
  },
  { timestamps: true }
);

productSchema.virtual('discountedPrice').get(function() {
  if (!this.discount || this.discount <= 0) return this.price;
  const discountAmount = (this.price * this.discount) / 100;
  return Math.round(this.price - discountAmount);
});

// Ensure virtuals show up in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });


const Product = mongoose.model('Product', productSchema);

export default Product;
