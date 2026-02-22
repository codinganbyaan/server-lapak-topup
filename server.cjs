const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto'); // Mesin pemecah sandi rahasia Digiflazz

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
  name: String, category: String, price: Number, sku: String, image: String
});
const Product = mongoose.model('Product', productSchema);

app.get('/api/products', async (req, res) => {
  try { const products = await Product.find(); res.json(products); }
  catch (error) { res.status(500).json({ error: error.message }); }
});
app.post('/api/products', async (req, res) => {
  try { const newProduct = new Product(req.body); await newProduct.save(); res.json(newProduct); }
  catch (error) { res.status(500).json({ error: error.message }); }
});
app.delete('/api/products/:id', async (req, res) => {
  try { await Product.findByIdAndDelete(req.params.id); res.json({ message: 'Produk Dihapus' }); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

// ===================================================
// 3. KODE SAKLAR MAINTENANCE (MODE PERBAIKAN)
// ===================================================
const settingsSchema = new mongoose.Schema({ maintenance: { type: Boolean, default: false } });
const Settings = mongoose.model('Settings', settingsSchema);

app.get('/api/settings', async (req, res) => {
  try { let settings = await Settings.findOne(); if (!settings) { settings = await Settings.create({ maintenance: false }); } res.json(settings); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});
app.put('/api/settings', async (req, res) => {
  try { let settings = await Settings.findOne(); if (!settings) { settings = await Settings.create({ maintenance: req.body.maintenance }); } else { settings.maintenance = req.body.maintenance; await settings.save(); } res.json(settings); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

// ===================================================
// 4. [BARU] INTEGRASI API DIGIFLAZZ (CEK SALDO)
// ===================================================
app.post('/api/cek-saldo', async (req, res) => {
  try {
    const { username, apiKey } = req.body;
    if (!username || !apiKey) return res.status(400).json({ error: 'Username dan API Key wajib dikirim!' });

    // Rumus Keamanan Digiflazz: MD5(username + apikey + "depo")
    const signString = username + apiKey + "depo";
    const signature = crypto.createHash('md5').update(signString).digest('hex');

    // Mengirim kurir (Fetch) ke server pusat Digiflazz
    const response = await fetch('https://api.digiflazz.com/v1/cek-saldo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd: "deposit",
        username: username,
        sign: signature
      })
    });

    const data = await response.json();
    res.json(data); // Kirim jawaban saldo ke aplikasi Admin Bos
  } catch (error) {
    console.error("Error dari Digiflazz:", error);
    res.status(500).json({ error: 'Gagal terhubung ke server Digiflazz.' });
  }
});

// ===================================================
// 5. NYALAKAN MESIN SERVER
// ===================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Mesin Server menyala di port ${PORT}`);
});