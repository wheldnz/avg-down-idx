# 📊 Avg Down IDX

Kalkulator Average Down & Average Up saham Indonesia yang lengkap dan profesional.

## ✨ Fitur

- 🏢 **19 Broker Indonesia** — Stockbit, Ajaib, Mirae, IPOT, BNI, Mandiri, dan lainnya
- 📊 **Multi-Step Averaging** — Hingga 10 tahap pembelian bertahap
- ⬆⬇ **Mode Average Down & Up** — Toggle sesuai kebutuhan
- 💰 **Live Modal Preview** — Preview harga modal otomatis saat input berubah
- 📈 **3 Chart Interaktif** — Donut, Bar, dan Line chart
- 🎚️ **Target Harga Slider** — Simulasi custom di harga berapa pun
- 🌙 **Dark Mode** — Toggle tema gelap/terang
- 📜 **Riwayat Kalkulasi** — Simpan dan muat ulang hingga 50 perhitungan
- 📸 **Export PNG** — Simpan hasil sebagai gambar
- 📄 **Export PDF** — Generate laporan PDF
- 📋 **Copy to Clipboard** — Salin ringkasan teks
- 💬 **Share WhatsApp** — Bagikan langsung ke WhatsApp
- 📱 **PWA** — Install di home screen HP, bisa offline
- ⌨️ **Auto-format angka** — Pemisah ribuan otomatis (1.000.000)

## 🚀 Cara Menjalankan

```bash
# Gunakan local server (karena ES Modules)
npx serve .

# Atau
python -m http.server 3000
```

Buka `http://localhost:3000` di browser.

## 📁 Struktur File

```
├── index.html          # HTML utama
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
├── REFERENCE.md        # Spesifikasi kalkulasi
├── css/
│   ├── variables.css   # Design tokens
│   ├── base.css        # Reset & typography
│   ├── components.css  # UI components
│   ├── layout.css      # Responsive grid
│   └── animations.css  # Micro-animations
└── js/
    ├── app.js          # Entry point
    ├── calculator.js   # Engine kalkulasi
    ├── brokers.js      # Database broker
    ├── ui.js           # DOM rendering
    ├── charts.js       # Chart.js
    ├── storage.js      # localStorage
    ├── export.js       # Export/share
    └── utils.js        # Helpers
```

## 🧮 Rumus

- **Average Baru** = (Total Nilai Lama + Total Nilai Baru) / Total Lembar
- **BEP** = Total Modal / (Total Lembar × (1 - Fee Jual%))
- **Profit/Loss** = (Harga Jual × Lembar - Fee Jual) - Total Modal

Lihat [REFERENCE.md](REFERENCE.md) untuk detail lengkap.

## 📝 Lisensi

MIT License © 2026
