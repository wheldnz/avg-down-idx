# Avg Down Calculator Pro — Reference Specification

> Dokumen ini adalah sumber kebenaran (single source of truth) untuk semua kalkulasi,
> data broker, format angka, dan aturan bisnis. Gunakan dokumen ini sebagai referensi
> saat development agar tidak ada kesalahan atau halusinasi.

---

## 1. Konstanta & Aturan Dasar

### 1.1 Satuan Saham Indonesia
- **1 Lot = 100 Lembar (shares)**
- Harga saham di Indonesia dalam satuan **Rupiah (Rp)** per lembar
- Fraksi harga minimum:
  - Harga < Rp 200: fraksi Rp 1
  - Harga Rp 200 - Rp 500: fraksi Rp 2
  - Harga Rp 500 - Rp 2.000: fraksi Rp 5
  - Harga Rp 2.000 - Rp 5.000: fraksi Rp 10
  - Harga > Rp 5.000: fraksi Rp 25
- **Catatan**: Fraksi harga digunakan untuk pembulatan BEP dan target harga saja (opsional).

### 1.2 Pembulatan
- Average price: **pembulatan biasa** (Math.round) ke bilangan bulat
- BEP: **pembulatan ke atas** (Math.ceil) — karena harus jual di atas BEP untuk profit
- Fee: **tanpa pembulatan** (simpan sebagai float, tampilkan 0 desimal)
- Simulasi profit/loss: tampilkan sebagai bilangan bulat Rupiah

---

## 2. Database Broker

```javascript
const BROKERS = [
  {
    id: "stockbit",
    name: "Stockbit",
    buyFee: 0.15,    // dalam persen (%)
    sellFee: 0.25,   // dalam persen (%)
    minFee: 0,       // minimum fee per transaksi (Rp)
    ppn: 0,          // PPN atas fee broker (%) — sudah termasuk di fee
    description: "PT Stockbit Sekuritas"
  },
  {
    id: "ipot",
    name: "IPOT (Indo Premier)",
    buyFee: 0.19,
    sellFee: 0.29,
    minFee: 0,
    ppn: 0,
    description: "PT Indo Premier Sekuritas"
  },
  {
    id: "ajaib",
    name: "Ajaib",
    buyFee: 0.15,
    sellFee: 0.25,
    minFee: 0,
    ppn: 0,
    description: "PT Ajaib Sekuritas Asia"
  },
  {
    id: "mandiri",
    name: "Mandiri Sekuritas (MOST)",
    buyFee: 0.18,
    sellFee: 0.28,
    minFee: 0,
    ppn: 0,
    description: "PT Mandiri Sekuritas"
  },
  {
    id: "bni",
    name: "BNI Sekuritas (BIONS)",
    buyFee: 0.17,
    sellFee: 0.27,
    minFee: 0,
    ppn: 0,
    description: "PT BNI Sekuritas"
  },
  {
    id: "mirae",
    name: "Mirae Asset (Neo HOTS)",
    buyFee: 0.15,
    sellFee: 0.25,
    minFee: 0,
    ppn: 0,
    description: "PT Mirae Asset Sekuritas Indonesia"
  },
  {
    id: "phillip",
    name: "Phillip Sekuritas (POEMS)",
    buyFee: 0.18,
    sellFee: 0.28,
    minFee: 0,
    ppn: 0,
    description: "PT Phillip Sekuritas Indonesia"
  },
  {
    id: "kisi",
    name: "KISI (Kiwoom Sekuritas)",
    buyFee: 0.15,
    sellFee: 0.25,
    minFee: 0,
    ppn: 0,
    description: "PT Kiwoom Sekuritas Indonesia"
  },
  {
    id: "custom",
    name: "Custom",
    buyFee: 0,    // user input
    sellFee: 0,   // user input
    minFee: 0,
    ppn: 0,
    description: "Fee broker custom"
  }
];
```

> **PENTING**: Fee broker di atas adalah ESTIMASI per Juni 2025. Fee aktual bisa berubah.
> User harus bisa mengedit fee melalui opsi "Custom".

---

## 3. Rumus Kalkulasi — Detail

### 3.1 Modal per Transaksi (Buy)

```
// Input
harga     = harga per lembar saham (Rp)
lot       = jumlah lot yang dibeli
feeBeli   = fee broker beli (%)

// Kalkulasi
lembar       = lot × 100
nilaiTransaksi = harga × lembar
feeBroker    = nilaiTransaksi × (feeBeli / 100)
totalKeluar  = nilaiTransaksi + feeBroker

// Output
{
  lembar,          // jumlah lembar
  nilaiTransaksi,  // nilai transaksi sebelum fee
  feeBroker,       // fee broker
  totalKeluar      // total uang keluar (modal + fee)
}
```

### 3.2 Harga Average Baru

```
// Posisi existing
avgLama   = harga average saat ini
lotLama   = jumlah lot saat ini

// Pembelian baru (bisa multiple)
beliBaru  = [
  { harga: h1, lot: l1 },
  { harga: h2, lot: l2 },
  ... 
]

// Kalkulasi (TANPA fee dalam average)
totalNilaiLama   = avgLama × lotLama × 100
totalLotLama     = lotLama
totalLembarLama  = lotLama × 100

totalNilaiBaru   = Σ(beliBaru[i].harga × beliBaru[i].lot × 100)
totalLotBaru     = Σ(beliBaru[i].lot)
totalLembarBaru  = totalLotBaru × 100

averageBaru = (totalNilaiLama + totalNilaiBaru) / (totalLembarLama + totalLembarBaru)
averageBaru = Math.round(averageBaru)  // pembulatan biasa

totalLot    = totalLotLama + totalLotBaru
totalLembar = totalLot × 100
```

**CATATAN**: Average price dihitung TANPA memperhitungkan fee beli. Fee dihitung terpisah untuk total modal.

### 3.3 Total Modal (dengan fee)

```
// Total modal termasuk fee semua transaksi
// Posisi lama: fee sudah terjadi, jadi modal lama = avgLama × lotLama × 100 + feeLama
// TETAPI karena kita tidak tahu fee lama secara pasti, kita hitung fee lama pakai fee broker saat ini

modalLama    = avgLama × lotLama × 100
feeLama      = modalLama × (feeBeli / 100)
totalKelLama = modalLama + feeLama

modalBaru_i     = beliBaru[i].harga × beliBaru[i].lot × 100
feeBaru_i       = modalBaru_i × (feeBeli / 100)
totalKelBaru_i  = modalBaru_i + feeBaru_i

totalModal = totalKelLama + Σ(totalKelBaru_i)
```

### 3.4 BEP (Break Even Price)

```
// BEP = harga jual minimum agar tidak rugi
// Saat jual SEMUA saham di harga BEP:
//   Hasil jual = BEP × totalLembar
//   Fee jual   = Hasil jual × (feeJual / 100)
//   Net jual   = Hasil jual - Fee jual = Hasil jual × (1 - feeJual/100)
//   Syarat impas: Net jual >= totalModal

// BEP × totalLembar × (1 - feeJual/100) = totalModal
// BEP = totalModal / (totalLembar × (1 - feeJual/100))

BEP = totalModal / (totalLembar × (1 - feeJual / 100))
BEP = Math.ceil(BEP)   // pembulatan ke atas
```

### 3.5 Simulasi Profit/Loss

```
// Untuk setiap target harga:
targetHarga    = [angka atau dari persentase terhadap average baru]
hasilJual      = targetHarga × totalLembar
feeJualNominal = hasilJual × (feeJual / 100)
netHasilJual   = hasilJual - feeJualNominal
profitLoss     = netHasilJual - totalModal

// Persentase profit/loss terhadap total modal
profitLossPersen = (profitLoss / totalModal) × 100

// Dari persentase perubahan harga ke target harga:
// Jika user pilih "+5%" maka:
targetHarga = Math.round(averageBaru × (1 + 5/100))
```

### 3.6 Daftar Persentase Simulasi Default

```javascript
const SIM_PERCENTAGES = [
  { label: "CL -20%", value: -20 },
  { label: "CL -15%", value: -15 },
  { label: "CL -10%", value: -10 },
  { label: "CL -7%",  value: -7  },
  { label: "CL -5%",  value: -5  },
  { label: "CL -3%",  value: -3  },
  { label: "CL -2%",  value: -2  },
  { label: "TP +2%",  value: 2   },
  { label: "TP +3%",  value: 3   },
  { label: "TP +5%",  value: 5   },
  { label: "TP +7%",  value: 7   },
  { label: "TP +10%", value: 10  },
  { label: "TP +15%", value: 15  },
  { label: "TP +20%", value: 20  },
];
```

---

## 4. Format Angka

### 4.1 Format Rupiah
```
Input: 4321883
Output: "Rp 4.321.883"

Input: -125969
Output: "-Rp 125.969"

// Aturan:
// - Pemisah ribuan: titik (.)
// - Prefix: "Rp " (dengan spasi)
// - Negatif: tanda minus di depan "Rp"
// - Tanpa desimal (pembulatan ke bilangan bulat)
```

### 4.2 Format Lot/Lembar
```
Input: 408 lot
Output: "408 Lot (40.800 Lbr)"

// 1 Lot = 100 Lembar
// "Lbr" = singkatan "Lembar"
```

### 4.3 Format Persentase
```
Input: -7.5
Output: "-7,50%"

Input: 10.123
Output: "+10,12%"

// Aturan:
// - Desimal: koma (,) — standar Indonesia
// - 2 digit desimal
// - Positif: tambahkan "+"
// - Negatif: tampilkan "-"
```

### 4.4 Input Number Auto-Format
```
// Saat user mengetik di input field:
// Keystroke: 1 → tampilan "1"
// Keystroke: 12 → tampilan "12"
// Keystroke: 123 → tampilan "123"
// Keystroke: 1234 → tampilan "1.234"
// Keystroke: 12345 → tampilan "12.345"

// Saat parsing balik ke angka:
// "12.345" → 12345
// "1.234.567" → 1234567
```

---

## 5. Validasi Input

### 5.1 Rules

| Field | Type | Min | Max | Required | Pattern |
|-------|------|-----|-----|----------|---------|
| Kode Saham | text | - | 4 chars | No | `/^[A-Z]{4}$/` |
| Harga Avg Lama | number | 1 | 999999 | Yes | integer |
| Lot Lama | number | 1 | 999999 | Yes | integer |
| Harga Beli Baru | number | 1 | 999999 | Yes | integer |
| Lot Beli Baru | number | 1 | 999999 | Yes | integer |
| Fee Beli (custom) | number | 0 | 5 | If custom | float 2 decimal |
| Fee Jual (custom) | number | 0 | 5 | If custom | float 2 decimal |

### 5.2 Error Messages (Bahasa Indonesia)

```javascript
const ERROR_MESSAGES = {
  required: "Field ini wajib diisi",
  minValue: "Nilai minimum adalah {min}",
  maxValue: "Nilai maksimum adalah {max}",
  integer: "Harus berupa bilangan bulat",
  stockCode: "Kode saham harus 4 huruf kapital (contoh: BBCA)",
  feeRange: "Fee harus antara 0% - 5%",
  noChanges: "Tidak ada perubahan untuk dihitung",
};
```

---

## 6. Warna & Status

### 6.1 Warna Berdasarkan Nilai

```
Profit (positif):
  - Text: #00C853 (hijau)
  - Background: rgba(0, 200, 83, 0.1)

Loss (negatif):
  - Text: #FF1744 (merah)
  - Background: rgba(255, 23, 68, 0.1)

Netral (nol / BEP):
  - Text: #FF9100 (oranye)
  - Background: rgba(255, 145, 0, 0.1)
```

### 6.2 Gradasi Tabel Simulasi

```
// Untuk tabel simulasi, gunakan gradasi warna:
// -20% → merah tua (opacity 0.3)
// -10% → merah sedang (opacity 0.2)
// -5%  → merah muda (opacity 0.1)
// 0%   → putih / netral
// +5%  → hijau muda (opacity 0.1)
// +10% → hijau sedang (opacity 0.2)
// +20% → hijau tua (opacity 0.3)
```

---

## 7. Test Cases (Verifikasi Kalkulasi)

### Test Case 1 — Dari Screenshot Referensi

```
Input:
  Broker: Stockbit (buy: 0.15%, sell: 0.25%)
  Posisi Lama: Avg Rp 131, Lot 204
  Beli Baru: Harga Rp 78, Lot 204

Expected Output:
  Total Lembar = (204 + 204) × 100 = 40.800 lembar
  Total Lot = 408

  Average Baru (tanpa fee):
    = (131 × 204 × 100 + 78 × 204 × 100) / 40.800
    = (2.672.400 + 1.591.200) / 40.800
    = 4.263.600 / 40.800
    = 104,5
    ≈ Rp 105 (atau 104 atau 105 tergantung pembulatan)
    
  Catatan: Screenshot menunjukkan Rp 106, kemungkinan karena pembulatan 
  harga avg lama bukan 131 tapi "131/4" yang mungkin 131.4 atau 1314
  
  Total Modal (dengan fee):
    Modal lama = 131 × 20.400 = 2.672.400
    Fee lama = 2.672.400 × 0.15% = 4.008,6
    Total keluar lama = 2.676.408,6
    
    Modal baru = 78 × 20.400 = 1.591.200
    Fee baru = 1.591.200 × 0.15% = 2.386,8
    Total keluar baru = 1.593.586,8
    
    Total Modal = 2.676.408,6 + 1.593.586,8 = 4.269.995,4
    ≈ Rp 4.269.995
    
  BEP:
    = totalModal / (totalLembar × (1 - 0.25/100))
    = 4.269.995 / (40.800 × 0.9975)
    = 4.269.995 / 40.698
    = 104,92
    ≈ Rp 105 (ceil)
    
  Catatan: Screenshot menunjukkan Total Modal Rp 4.321.883 dan BEP Rp 107.
  Perbedaan mungkin karena:
  - Harga "131/4" = 1314 (dalam fractional)?
  - Fee sudah termasuk PPN?
  - Rumus berbeda
  Gunakan rumus di dokumen ini sebagai standar, kecuali user meminta penyesuaian.
```

### Test Case 2 — Simple

```
Input:
  Broker: Custom (buy: 0.20%, sell: 0.30%)
  Posisi Lama: Avg Rp 1000, Lot 10
  Beli Baru: Harga Rp 800, Lot 10

Expected Output:
  Total Lembar = 2.000
  Total Lot = 20
  
  Average Baru = (1000×1000 + 800×1000) / 2000 = 1.800.000 / 2000 = Rp 900
  
  Total Modal:
    Modal lama = 1.000.000, Fee = 2.000, Total = 1.002.000
    Modal baru = 800.000, Fee = 1.600, Total = 801.600
    Grand Total = 1.803.600
    
  BEP = 1.803.600 / (2000 × 0.997) = 1.803.600 / 1994 = 904,51 → Rp 905
  
  Simulasi +10%:
    Target = 900 × 1.10 = Rp 990
    Hasil jual = 990 × 2000 = 1.980.000
    Fee jual = 1.980.000 × 0.30% = 5.940
    Net jual = 1.974.060
    Profit = 1.974.060 - 1.803.600 = Rp 170.460
    Persen = (170.460 / 1.803.600) × 100 = +9,45%
```

### Test Case 3 — Multi-Step Buy

```
Input:
  Broker: Stockbit (buy: 0.15%, sell: 0.25%)
  Posisi Lama: Avg Rp 500, Lot 100
  Beli Baru #1: Harga Rp 450, Lot 50
  Beli Baru #2: Harga Rp 400, Lot 100

Expected Output:
  Total Lembar = (100 + 50 + 100) × 100 = 25.000
  Total Lot = 250
  
  Average Baru:
    = (500×10000 + 450×5000 + 400×10000) / 25000
    = (5.000.000 + 2.250.000 + 4.000.000) / 25.000
    = 11.250.000 / 25.000
    = Rp 450
    
  Total Modal:
    Lama: 5.000.000 + 7.500 = 5.007.500
    Baru1: 2.250.000 + 3.375 = 2.253.375
    Baru2: 4.000.000 + 6.000 = 4.006.000
    Grand Total = 11.266.875
    
  BEP = 11.266.875 / (25.000 × 0.9975) = 11.266.875 / 24.937,5 = 451,82 → Rp 452
```

---

## 8. localStorage Schema

### 8.1 History Item

```javascript
{
  id: "calc_1701234567890",           // unique ID
  timestamp: "2025-11-29T10:30:00Z",  // ISO 8601
  stockCode: "BBCA",                  // optional
  broker: {
    id: "stockbit",
    name: "Stockbit",
    buyFee: 0.15,
    sellFee: 0.25
  },
  positions: [
    { label: "Posisi Lama", price: 1000, lots: 10 },
    { label: "Beli Baru #1", price: 800, lots: 10 },
    { label: "Beli Baru #2", price: 750, lots: 5 }
  ],
  result: {
    averagePrice: 900,
    totalLots: 25,
    totalShares: 2500,
    totalModal: 2253375,
    bep: 905
  }
}
```

### 8.2 Settings

```javascript
// Key: "avgdown_settings"
{
  theme: "dark",           // "light" | "dark"
  lastBroker: "stockbit",  // last used broker ID
  version: "1.0.0"         // app version for migration
}
```

### 8.3 Storage Keys

```
"avgdown_history"   → JSON array of history items (max 50)
"avgdown_settings"  → JSON object of settings
```

---

## 9. Accessibility & UX Notes

- Semua input harus memiliki `<label>` yang terhubung via `for` attribute
- Gunakan `aria-live="polite"` pada area hasil kalkulasi
- Warna profit/loss harus memiliki kontras minimal 4.5:1
- Focus outline harus visible saat navigasi keyboard
- Toast notification harus memiliki `role="alert"`
- Tombol harus memiliki `aria-label` yang deskriptif jika hanya icon

---

## 10. Responsive Breakpoints

```css
/* Mobile first */
/* Default: < 480px (mobile portrait) */

@media (min-width: 480px) {
  /* Mobile landscape */
}

@media (min-width: 768px) {
  /* Tablet */
  /* Input group: 2 kolom side by side */
  /* Charts: side by side */
}

@media (min-width: 1024px) {
  /* Desktop */
  /* Max width container: 800px */
  /* Larger padding */
}

@media (min-width: 1200px) {
  /* Wide desktop */
  /* Max width container: 900px */
}
```
