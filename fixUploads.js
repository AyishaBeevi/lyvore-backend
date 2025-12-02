// fixUploads.js
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js'; 

dotenv.config();

// ---------------- Config ----------------
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const MONGO_URI = process.env.MONGO_URI;

// ---------------- Helpers ----------------
function makeSafeName(filename) {
  // Replace spaces with dashes and remove parentheses
  return filename.replace(/\s+/g, '-').replace(/[()]/g, '');
}

// ---------------- Main ----------------
async function fixUploads() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({});
    for (const product of products) {
      if (!product.images || !product.images.length) continue;

      const newImages = [];

      for (let imgPath of product.images) {
        const fileName = path.basename(imgPath);
        const oldFilePath = path.join(UPLOADS_DIR, fileName);
        if (!fs.existsSync(oldFilePath)) {
          console.log(`⚠️  File missing: ${fileName}`);
          continue;
        }

        const safeName = makeSafeName(fileName);
        const newFilePath = path.join(UPLOADS_DIR, safeName);

        // Rename file if needed
        if (fileName !== safeName) {
          fs.renameSync(oldFilePath, newFilePath);
          console.log(`Renamed: ${fileName} → ${safeName}`);
        }

        // Update DB path
        newImages.push(`/uploads/${safeName}`);
      }

      product.images = newImages;
      await product.save();
      console.log(`✅ Updated product: ${product.name}`);
    }

    console.log('🎉 All product images fixed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

fixUploads();
