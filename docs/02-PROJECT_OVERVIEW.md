# Project Overview

**Project**: Distributed Key-Value Store with Raft Consensus
**Document type**: Program Overview & Goals
**Status**: Active
**Last updated**: 2026-07-26

---

## 1. Deskripsi Singkat

Sebuah penyimpanan data key-value terdistribusi (mirip miniatur etcd), berjalan di beberapa proses/node sekaligus, yang tetap konsisten dan tersedia meskipun salah satu node mengalami kegagalan. Sistem menggunakan algoritma Raft sebagai *consensus layer*, dilengkapi dashboard berbasis React untuk memvisualisasikan kondisi cluster secara real-time.

**Catatan presisi istilah**: "Raft" merujuk pada algoritma/mekanisme consensus. "Distributed KV Store" merujuk pada aplikasi yang menggunakan Raft sebagai fondasinya. Yang dibangun dalam proyek ini adalah yang kedua — sebuah aplikasi yang memakai Raft, bukan Raft sebagai produk berdiri sendiri.

## 2. Tujuan Proyek

### Tujuan Utama
Mendemonstrasikan pemahaman mendalam terhadap bagaimana sistem terdistribusi menjaga **konsistensi** dan **ketersediaan** data pada saat terjadi kegagalan node — masalah fundamental yang mendasari hampir seluruh sistem skala besar.

### Tujuan Turunan
- Menunjukkan kemampuan menerjemahkan spesifikasi algoritma dari paper akademik menjadi sistem yang benar-benar berjalan.
- Menunjukkan kemampuan menangani kondisi non-deterministik dan konkurensi (RPC antar proses, race condition, timing-dependent behavior).
- Menunjukkan disiplin proses engineering (dokumentasi keputusan, testing, deployment yang dapat direplikasi) meski dikerjakan solo.

## 3. Manfaat & Relevansi

| Bagi | Manfaat |
|---|---|
| Kandidat (pembuat proyek) | Sinyal karir kuat — topik yang umumnya baru dikuasai mendalam di level engineer menengah-senior, jarang dimiliki fresh graduate |
| Evaluator/interviewer | Bahan diskusi teknis konkret untuk menguji kedalaman pemahaman system design, bukan sekadar CRUD app generik |
| Kredibilitas teknis | Prinsip yang diterapkan identik dengan yang dipakai sistem produksi nyata (Kubernetes/etcd, CockroachDB, Consul, Kafka KRaft) |

## 4. Kriteria Keberhasilan (Definition of Success)

Proyek dianggap berhasil mencapai MVP apabila sistem dapat mendemonstrasikan skenario berikut secara konsisten:

1. Cluster 3 node berhasil memilih satu leader secara otomatis saat start-up.
2. Client dapat melakukan `set`/`get` data melalui leader, dan data terreplikasi ke seluruh follower yang hidup.
3. Ketika leader dimatikan (disimulasikan), cluster secara otomatis memilih leader baru dalam waktu di bawah 1 detik.
4. Data yang sudah *committed* sebelum leader mati tetap konsisten dan dapat diakses setelah leader baru terpilih.
5. Seluruh proses di atas dapat diamati secara visual melalui dashboard React secara real-time.

## 5. Scope

### Masuk (In-Scope) — MVP v1
- Leader election (dengan randomized election timeout)
- Log replication antar node
- Basic KV operation: `set` dan `get`
- Dashboard React (read-only, real-time state visualization)
- Fitur kill/revive node untuk simulasi kegagalan saat demo

### Di Luar Scope (Out-of-Scope) — Ditunda Secara Sengaja
- Log persistence ke disk
- Snapshot / log compaction
- Membership change / cluster reconfiguration (dynamic add/remove node)
- Business model / monetisasi (tidak relevan — lihat `01-PROJECT_CONTEXT.md` Bagian 3)
- Fitur berbasis AI/ML (didokumentasikan sebagai kemungkinan fase lanjutan opsional, bukan bagian aktif proyek)

Item pada daftar "Out-of-Scope" dicantumkan secara eksplisit untuk membedakan antara *keterbatasan yang disadari* dan *kelalaian* — bagian penting dari komunikasi proyek kepada evaluator eksternal.

## 6. Target Non-Fungsional

| Parameter | Target |
|---|---|
| Jumlah node cluster | 3 (toleransi 1 node gagal, quorum minimum 2) |
| Election timeout | 150–300 ms (randomized) |
| Heartbeat interval | ~50 ms |
| Waktu re-election setelah leader mati | < 1 detik |

## 7. Pernyataan Batasan yang Jujur

Implementasi ini **tidak** diklaim sebagai "100% sesuai spesifikasi paper Raft secara lengkap". Target yang ditetapkan adalah kebenaran fungsional pada skenario umum (leader gagal → re-election → konsistensi data terjaga). Edge case yang belum ditangani (misalnya kasus jaringan partition yang kompleks) didokumentasikan secara terbuka, bukan disembunyikan, sebagai bagian dari transparansi teknis proyek.
