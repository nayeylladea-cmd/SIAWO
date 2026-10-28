# Lunelle Wedding
### Sistem Akuntansi Pendapatan dan Piutang Usaha Wedding Organizer

🌐 **Demo Login:** [Lunelle Wedding](https://nayeylladea-cmd.github.io/SIAWO/Front-End/HTML/login.html)
🌐 **Demo Website:** [Lunelle Wedding](https://nayeylladea-cmd.github.io/SIAWO/)

---

## 📌 Deskripsi Proyek

Lunelle Wedding merupakan aplikasi berbasis web yang dirancang untuk membantu pengelolaan transaksi keuangan pada usaha Wedding Organizer, khususnya dalam pencatatan pendapatan dan pemantauan piutang usaha.

Aplikasi ini mengintegrasikan data pelanggan, paket wedding, transaksi, dan pembayaran untuk menyajikan informasi keuangan secara lebih terstruktur. Proyek ini dikembangkan sebagai penerapan konsep Sistem Informasi Akuntansi dengan memanfaatkan teknologi web dan database.

## 🎯 Tujuan

- Mempermudah pencatatan data pelanggan dan paket wedding.
- Mengelola transaksi pemesanan dan pembayaran pelanggan.
- Menyajikan informasi pendapatan berdasarkan pembayaran yang diterima.
- Memantau sisa piutang pelanggan yang belum dilunasi.
- Menyediakan dashboard untuk melihat ringkasan informasi keuangan usaha.

## ✨ Fitur Aplikasi

### 1. Dashboard
Menampilkan ringkasan informasi usaha, seperti jumlah pelanggan, transaksi, pendapatan, dan piutang.

### 2. Data Pelanggan
Mengelola informasi pelanggan, termasuk nama, nomor telepon, email, dan alamat.

### 3. Paket Wedding
Menyimpan informasi paket layanan wedding organizer, harga, dan deskripsi paket.

### 4. Transaksi Wedding
Mencatat transaksi pemesanan paket wedding, tanggal transaksi, tanggal acara, nilai transaksi, dan status pembayaran.

### 5. Pembayaran
Mencatat pembayaran pelanggan berdasarkan transaksi, meliputi tanggal pembayaran, jumlah pembayaran, metode pembayaran, dan keterangan.

### 6. Pengelolaan Piutang
Membantu memantau sisa tagihan pelanggan dengan membandingkan total transaksi dan pembayaran yang telah diterima.

### 7. Informasi Pendapatan dan Piutang
Menyajikan informasi terkait penerimaan pembayaran dan saldo piutang untuk mendukung pemantauan keuangan usaha.

## 🛠️ Teknologi dan Tools yang Digunakan

- **Visual Studio Code (VS Code)** — editor untuk menulis dan mengelola kode program.
- **HTML5** — membangun struktur halaman web.
- **CSS3** — mengatur desain, tata letak, dan tampilan antarmuka.
- **JavaScript** — menangani interaksi pengguna dan logika aplikasi.
- **Node.js** — menjalankan backend aplikasi pada lingkungan lokal.
- **Supabase** — layanan database PostgreSQL dan akses data aplikasi.
- **Git** — mengelola versi kode dan mencatat perubahan proyek.
- **GitHub** — menyimpan repository kode sumber secara online.
- **GitHub Pages** — memublikasikan antarmuka website agar dapat diakses secara online.

## 📂 Struktur Proyek

```text
SIAWO/
├── Back-End/
│   ├── app.js
│   └── database.sql
├── Front-End/
│   ├── CSS/
│   │   └── style.css
│   ├── HTML/
│   │   └── index.html
│   └── JS/
│       └── script.js
├── index.html
└── README.md
```

## 🗄️ Database

Aplikasi menggunakan Supabase dengan PostgreSQL sebagai database. Terdapat empat tabel utama:

| Tabel | Fungsi |
|---|---|
| `pelanggan` | Menyimpan informasi pelanggan. |
| `paket_wedding` | Menyimpan informasi paket dan harga layanan. |
| `transaksi_wedding` | Menyimpan data pemesanan dan total transaksi. |
| `pembayaran` | Menyimpan catatan pembayaran pelanggan. |

Relasi antartabel digunakan untuk menghubungkan pelanggan, paket wedding, transaksi, dan pembayaran sehingga informasi pendapatan serta piutang dapat dihitung berdasarkan data yang tercatat.

## 🚀 Cara Menjalankan Aplikasi

### Menjalankan secara lokal

1. Pastikan Node.js telah terpasang.
2. Buka folder proyek melalui Visual Studio Code.
3. Pastikan konfigurasi koneksi database telah disesuaikan.
4. Buka terminal pada direktori utama proyek.
5. Jalankan perintah berikut:

```bash
node Back-End/app.js
```

6. Buka browser dan akses:

```text
http://localhost:3000
```

*Catatan: cara ini memerlukan backend dan dependensi aplikasi yang telah dikonfigurasi dengan benar.*

### Mengakses website online

Website dapat diakses melalui GitHub Pages:

[https://nayeylladea-cmd.github.io/SIAWO/](https://nayeylladea-cmd.github.io/SIAWO/)

Ketersediaan fitur yang membutuhkan backend bergantung pada konfigurasi layanan database dan backend yang digunakan. GitHub Pages sendiri hanya menyajikan file frontend statis.

## 🔐 Keamanan Data

Aplikasi menggunakan Supabase untuk pengelolaan data. Row Level Security (RLS) dan kebijakan akses perlu dikonfigurasi sesuai kebutuhan agar data hanya dapat diakses oleh pihak yang memiliki izin.

Kunci rahasia seperti `service_role` dan kredensial backend tidak boleh dimasukkan ke kode frontend atau dipublikasikan di repository.

## 📚 Konteks Pengembangan

Lunelle Wedding dikembangkan sebagai proyek pembelajaran Sistem Informasi Akuntansi untuk memahami penerapan teknologi informasi dalam pencatatan transaksi, pendapatan, penerimaan pembayaran, dan pengelolaan piutang pada usaha Wedding Organizer.

## 📌 Status Proyek

Proyek masih dalam tahap pengembangan dan pengujian. Fitur serta integrasi aplikasi dapat mengalami perubahan seiring proses penyempurnaan.

---

**Lunelle Wedding**  
*Sistem Akuntansi Pendapatan dan Piutang Usaha Wedding Organizer*
