# 🌿 MangroveAI – Klasifikasi Daun Bakau Berbasis Deep Learning CNN

## 📖 Gambaran Umum
MangroveAI adalah sistem klasifikasi daun bakau berbasis deep learning yang menggunakan Convolutional Neural Network (CNN) untuk mengidentifikasi dan membedakan tiga spesies mangrove: **Avicennia alba**, **Rhizophora apiculata**, dan **Sonneratia alba**. Sistem ini membantu peneliti, mahasiswa biologi, dan konservasionis dalam identifikasi spesies mangrove secara akurat dan cepat melalui analisis citra daun.

## 🎯 Spesies yang Diklasifikasikan
1. **Avicennia alba** (Api-api Putih)
2. **Rhizophora apiculata** (Bakau Minyak)
3. **Sonneratia alba** (Pidada)

## 🚀 Fitur Utama
- **Klasifikasi Tiga Spesies**: Mengidentifikasi daun dari tiga spesies mangrove utama
- **Dual Mode Input**:
  - **Upload Gambar**: Unggah gambar daun untuk diklasifikasikan
  - **Live Camera**: Klasifikasi real-time menggunakan kamera perangkat
- **Hasil Deteksi Real-time**: Menampilkan prediksi spesies dengan confidence score
- **Antarmuka Web Responsif**: Dibangun dengan Flask untuk kemudahan akses
- **Model CNN Terlatih**: Menggunakan arsitektur Convolutional Neural Network yang dioptimalkan

## 🗂️ Struktur Proyek
KlasifikasiMangrove/
├── app.py                 # Aplikasi utama Flask
├── labels.json            # Label kelas untuk model AI
├── model_klasifikasi_pro.h5 # model AI
├── static/                # CSS, JavaScript, dan aset
│   ├── style.css          # style website
│   ├── script.js          # logic function website
│   ├── uploads/           # ini gambar hasil upload dan foto di website
│   └── images/            # gambar yang dipake di Website
├── templates/             # Halaman HTML
│   ├── index.html         # Halaman utama
└── .gitignore             # Aturan pengecualian Git
