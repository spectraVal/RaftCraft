# Engineering Standards

**Project**: Distributed Key-Value Store with Raft Consensus
**Document type**: Engineering Standards & Process
**Status**: Active
**Last updated**: 2026-07-26

---

## 1. Prinsip Dasar

Standar dalam dokumen ini mengadopsi praktik engineering yang lazim digunakan tim profesional, diadaptasi untuk konteks solo development. Adaptasi ini **bukan** pengurangan standar, melainkan penyesuaian mekanisme kolaborasi (yang secara alami membutuhkan lebih dari satu orang) menjadi mekanisme disiplin diri, dengan tetap mempertahankan tujuan aslinya: keputusan yang dapat dipertanggungjawabkan, kode yang dapat diverifikasi, dan proses yang dapat direplikasi oleh pihak lain.

Proses birokrasi tim besar (rapat stakeholder, sprint ceremony multi-role, review berlapis) secara sengaja tidak diadopsi karena tidak relevan untuk kontributor tunggal dan berisiko menyebabkan *analysis paralysis* — kondisi di mana waktu habis di tahap perencanaan tanpa progres implementasi.

## 2. Standar Riset & Pengambilan Keputusan

- Keputusan teknis signifikan wajib merujuk pada sumber primer (paper akademik asli), bukan hanya rangkuman sekunder (blog, video tutorial), untuk mempertahankan keakuratan pemahaman.
- Setiap keputusan arsitektur signifikan didokumentasikan menggunakan format **Architecture Decision Record (ADR)**, dengan struktur baku:
  - **Konteks** — situasi/masalah yang melatarbelakangi keputusan
  - **Opsi yang dipertimbangkan** — minimal dua alternatif nyata
  - **Keputusan** — opsi yang dipilih
  - **Konsekuensi** — trade-off yang diterima akibat keputusan tersebut
- ADR disimpan di direktori `docs/adr/` dengan penomoran berurutan (`ADR-001`, `ADR-002`, dst.), tidak diubah setelah disetujui — perubahan keputusan dicatat sebagai ADR baru yang men-supersede ADR lama.

## 3. Standar Version Control

- Setiap milestone development dikerjakan dalam commit atau branch terpisah dengan pesan commit yang menjelaskan **apa** dan **mengapa**, bukan hanya deskripsi perubahan permukaan.
- Riwayat commit disusun agar dapat dibaca sebagai narasi progres proyek — mencerminkan urutan milestone yang telah direncanakan pada dokumen planning.
- Branch `main` selalu berada pada kondisi dapat dijalankan (runnable); pekerjaan yang belum selesai dikerjakan di branch terpisah.

## 4. Standar Testing

Testing diperlakukan sebagai bagian inti pengembangan, bukan aktivitas tambahan di akhir.

| Level | Cakupan | Wajib untuk |
|---|---|---|
| Unit test | Transisi state Raft (follower→candidate→leader), vote counting, term comparison logic | Setiap komponen state machine inti |
| Integration test | Perilaku multi-proses (leader terpilih dalam waktu wajar, replikasi log berhasil) | Setiap milestone yang melibatkan komunikasi antar node |
| Scenario test | Failover (leader dimatikan → verifikasi re-election dan konsistensi data) | Wajib sebelum milestone dinyatakan selesai |

**Catatan khusus sistem terdistribusi**: karena sifatnya non-deterministik dan timing-dependent, pengujian manual satu kali tidak dianggap cukup untuk memvalidasi correctness. Skenario kritis (race condition, split vote) diuji dengan kondisi timing yang sengaja divariasikan.

## 5. Definition of Done (per Milestone)

Sebuah milestone dinyatakan selesai apabila memenuhi seluruh kriteria berikut:
1. Kode berjalan dan dapat didemonstrasikan (bukan hanya "secara teori benar").
2. Test yang relevan (sesuai Bagian 4) ditulis dan lulus.
3. Keputusan desain signifikan yang diambil selama milestone tersebut telah didokumentasikan (ADR bila relevan).
4. Perubahan tercermin dalam commit history dengan pesan yang jelas.

## 6. Standar Dokumentasi

- **README** wajib memuat: deskripsi singkat sistem, cara menjalankan (setup instructions), scope MVP (in-scope dan out-of-scope secara eksplisit), serta risk assessment singkat.
- **Klaim yang ditulis harus proporsional terhadap apa yang benar-benar diimplementasikan.** Klaim berlebihan (misalnya "100% sesuai spesifikasi paper") dihindari; keterbatasan dan edge case yang belum ditangani dicantumkan secara terbuka.
- Demo disertakan dalam bentuk video atau GIF di README sebagai bukti fungsional, khususnya untuk skenario yang sulit direplikasi pihak lain secara langsung (multi-proses, network partition).

## 7. Standar Deployment

- Target deployment utama: **Docker Compose**, dengan container terpisah untuk tiap node dan dashboard — memastikan proses deployment dapat direplikasi pihak lain dengan satu perintah.
- Deployment ke infrastruktur publik (VPS) bersifat opsional (stretch goal), digunakan hanya jika dibutuhkan tautan demo langsung untuk keperluan personal branding.
- Orkestrasi berskala besar (Kubernetes) dihindari secara sengaja karena tidak proporsional terhadap skala sistem, dan berisiko menjadi kompleksitas tanpa nilai tambah nyata (over-engineering).

## 8. Manajemen Ritme Kerja (Adaptasi Solo)

Untuk mencegah kegagalan proses yang umum terjadi pada proyek solo (kehilangan momentum sebelum implementasi inti selesai), diterapkan dua mekanisme berikut:

- **Time-boxing per fase**: riset maksimum 1 minggu; planning dan arsitektur maksimum 3–4 hari. Dokumen yang belum sempurna tetap dilanjutkan ke tahap berikutnya, direvisi seiring berjalannya development.
- **Milestone granular dengan checkpoint yang dapat diamati**: setiap unit pekerjaan dirancang agar menghasilkan sesuatu yang dapat dijalankan dan diverifikasi di akhir sesi kerja, untuk menjaga umpan balik yang mempertahankan momentum pengerjaan — bukan hanya perubahan logika internal yang tidak terlihat hasilnya.

## 9. Standar Komunikasi Progres

Setiap milestone yang selesai dicatat dengan ringkas: apa yang dibangun, keputusan penting yang diambil, dan kendala yang ditemukan. Catatan ini menjadi bahan mentah untuk narasi proyek yang akan dikomunikasikan kepada evaluator eksternal (recruiter/interviewer), sehingga proses dan hasil akhir dapat dijelaskan secara koheren.
