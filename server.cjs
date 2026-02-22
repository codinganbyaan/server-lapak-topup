const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ===================================================
// 1. KONEKSI DATABASE (PASTIKAN LINK MONGODB ANDA BENAR)
// ===================================================
// MASUKKAN LINK MONGODB+SRV ANDA DI DALAM TANDA KUTIP DI BAWAH INI:
const MONGODB_URI = "mongodb+srv://adminlapak:lapak123@topup.1r9zipu.mongodb.net/?appName=topup"; 

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ BERHASIL: Terhubung ke Database Global (MongoDB)!'))
  .catch((err) => console.log('❌ GAGAL: Terhubung ke Database.', err));

// ===================================================
// 2. SCHEMA & ROUTE UNTUK PRODUK (GAME)
// ===================================================
const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  sku: String,
  image: String
});
const Product = mongoose.model('Product', productSchema);

// Ambil semua produk
app.get('/api/products', async (req, res) => {
  try { const products = await Product.find(); res.json(products); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

// Tambah produk baru
app.post('/api/products', async (req, res) => {
  try { const newProduct = new Product(req.body); await newProduct.save(); res.json(newProduct); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

// Hapus produk
app.delete('/api/products/:id', async (req, res) => {
  try { await Product.findByIdAndDelete(req.params.id); res.json({ message: 'Produk Dihapus' }); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

// ===================================================
// 3. KODE SAKLAR MAINTENANCE (MODE PERBAIKAN)
// ===================================================
const settingsSchema = new mongoose.Schema({
  maintenance: { type: Boolean, default: false }
});
const Settings = mongoose.model('Settings', settingsSchema);

// Cek status maintenance
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) { settings = await Settings.create({ maintenance: false }); }
    res.json(settings);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Ubah status maintenance (ON/OFF dari Admin)
app.put('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) { settings = await Settings.create({ maintenance: req.body.maintenance }); }
    else { settings.maintenance = req.body.maintenance; await settings.save(); }
    res.json(settings);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ===================================================
// 4. NYALAKAN MESIN SERVER
// ===================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Mesin Server menyala di port ${PORT}`);
});