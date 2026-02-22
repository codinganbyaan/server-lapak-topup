const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. KUNCI DATABASE ANDA ---
// ⚠️ PENTING: Ganti tulisan PASSWORD_ANDA_DISINI dengan password MongoDB asli Anda
const mongoURI = "mongodb+srv://adminlapak:lapak123@topup.1r9zipu.mongodb.net/lapak_db?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ BERHASIL: Terhubung ke Database Global (MongoDB)!"))
  .catch(err => console.error("❌ GAGAL: Tidak bisa konek MongoDB:", err));

// --- 2. GUDANG PENYIMPANAN PRODUK ---
const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  sku: String, 
  image: String, // <--- Ruang untuk menyimpan link logo
});
const Product = mongoose.model('Product', ProductSchema);

// --- 3. JALUR KOMUNIKASI (API) ---
// A. Jalur saat Admin klik "Tambah Produk"
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json({ message: "Produk berhasil disimpan ke Database Global!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// B. Jalur saat HP Pelanggan membuka aplikasi untuk melihat produk
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- 4. TOMBOL NYALA SERVER ---
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Mesin Server menyala di port ${PORT}`));