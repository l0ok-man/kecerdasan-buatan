# Sistem Pemilihan Laptop Terbaik (MFEP)

**Mata Kuliah:** Kecerdasan Buatan (_Artificial Intelligence_)  
**Topik:** Sistem Pendukung Keputusan (_Decision Support System_)  
**Metode:** MFEP (_Multi Factor Evaluation Process_)

---

## Ringkasan Proyek

Proyek ini adalah sebuah aplikasi web statis satu halaman yang dirancang untuk membantu pengguna dalam menyeleksi dan memilih laptop terbaik dari berbagai alternatif. Pengambilan keputusan dilakukan menggunakan metode **Multi Factor Evaluation Process (MFEP)**, yang sangat cocok untuk mengevaluasi beberapa kriteria yang memiliki tingkat kepentingan (bobot) yang berbeda-beda.

Tampilan antarmuka proyek ini dibangun dengan gaya desain **Neubrutalism**, menawarkan visual yang tebal, kontras tinggi, dinamis, dan sangat responsif untuk layar HP maupun Komputer.

---

## Kriteria & Bobot (Faktor Evaluasi)

Sistem menggunakan 4 kriteria (faktor) utama. Penilaian dilakukan pada rentang skor **1 - 100** (di mana skor 100 berarti sangat baik/sangat sesuai dengan harapan).

1. **Harga (Bobot: 0.3 / 30%)**  
   _Asumsi: Semakin murah harganya, skor yang diberikan harus semakin tinggi._
2. **RAM (Bobot: 0.3 / 30%)**  
   _Asumsi: Kapasitas memori semakin besar, skor semakin tinggi._
3. **Baterai (Bobot: 0.2 / 20%)**  
   _Asumsi: Semakin tahan lama daya baterai, skor semakin tinggi._
4. **Berat (Bobot: 0.2 / 20%)**  
   _Asumsi: Semakin ringan laptopnya, skor semakin tinggi._

> **Catatan Penting:** Total nilai bobot keseluruhan secara matematis wajib berjumlah persis **1.0**.

---

## Fitur Utama Sistem

1. **Konfigurasi Bobot Interaktif:** Pengguna bisa mengedit bobot masing-masing faktor secara bebas. Sistem memiliki validasi cerdas jika total bobot lebih atau kurang dari 1.0 (memunculkan peringatan).
2. **Formulir Input Alternatif:** Pengguna dapat mendaftarkan tipe laptop tanpa batas, memasukkan nama dan nilai (skor) untuk ke-4 faktor pengujian.
3. **Komputasi Real-time:** Tidak perlu memuat ulang (refresh) halaman. Setiap perubahan bobot, penambahan data, atau penghapusan laptop akan langsung dikalkulasi detik itu juga.
4. **Papan Peringkat (Leaderboard):** Data langsung diurutkan dari skor total tertinggi hingga terendah di dalam tabel observasi. Peringkat pertama akan otomatis disorot (highlight) dengan warna hijau.
5. **Rincian Breakdown Juara:** Penjelasan transparan terkait bagaimana laptop peraih skor tertinggi (Peringkat 1) mendapatkan total nilainya melalui jabaran $\Sigma (\text{Skor} \times \text{Bobot})$.
6. **Default Data:** Sudah dibekali dengan minimal 3 data simulasi sejak pertama dibuka sehingga bisa langsung didemonstrasikan di kelas.

---

## Cara Menjalankan Program

Proyek ini murni disusun menggunakan tumpukan teknologi _Client-Side_ (HTML, CSS, dan Vanilla JavaScript) tanpa dependensi modul Node.js atau _database_.

1. Buka folder proyek.
2. Klik dua kali pada file `index.html`.
3. File akan langsung terbuka dan siap digunakan melalui _Web Browser_ (Google Chrome, Firefox, Edge, atau Safari).

---

## Struktur Direktori Berkas

```text
Kecerdasan Buatan/
│
├── index.html        <- Struktur tampilan (UI) web dan form input
├── style.css         <- Desain visual sistem (Neubrutalism Design System)
├── app.js            <- Logika matematika MFEP dan manipulasi data dinamis
└── README.md         <- Dokumentasi proyek (File ini)
```
