# Distributed Key-Value Store with Raft Consensus

**Status**: In Development (Fase 2 - Planning)
**Author**: [Nama Anda]
**Last updated**: 2026-07-26

---

## 1. Deskripsi Singkat

Distributed Key-Value Store adalah penyimpanan data key-value terdistribusi (mirip miniatur etcd) yang berjalan di beberapa node/proses sekaligus. Sistem ini menggunakan **algoritma Raft** sebagai consensus layer untuk menjaga konsistensi dan ketersediaan data meskipun salah satu node mengalami kegagalan, dilengkapi dashboard berbasis React untuk memvisualisasikan kondisi cluster secara real-time.

Dokumentasi lengkap konteks dan tujuan proyek tersedia di:
- [`docs/01-PROJECT_CONTEXT.md`](docs/01-PROJECT_CONTEXT.md) - latar belakang dan posisi proyek
- [`docs/02-PROJECT_OVERVIEW.md`](docs/02-PROJECT_OVERVIEW.md) - tujuan, scope, dan kriteria keberhasilan
- [`docs/03-ENGINEERING_STANDARDS.md`](docs/03-ENGINEERING_STANDARDS.md) - standar proses pengembangan
- [`docs/adr/`](docs/adr/) - catatan keputusan arsitektur (ADR)

---

## 2. Cara Menjalankan

### Prasyarat
- Node.js versi 18+

### Menjalankan (mode development, tanpa Docker)

Buka 2 terminal:

**Terminal 1 - Orchestrator (otomatis start 3 node Raft: A, B, C)**
```cmd
cd node
npm install
npm run orchestrator
```

**Terminal 2 - Dashboard**
```cmd
cd dashboard
npm install
npm run dev
```

Buka browser ke URL yang ditampilkan terminal dashboard (biasanya `http://localhost:8000`).

### Endpoint yang Tersedia
- Dashboard: `http://localhost:8000`
- Orchestrator control API: `http://localhost:7000` (`GET /nodes`, `POST /kill/:id`, `POST /revive/:id`)
- Node API per node: `http://localhost:4001`, `:4002`, `:4003` (`GET /status`, `POST /client/set`, `GET /client/get/:key`)

### Menjalankan via Docker Compose
> **Status**: TBD - stretch goal, belum diimplementasikan. Lihat ADR-003 untuk keputusan deployment topology.

---

## 3. Scope

### Masuk (In-Scope) - MVP v1
- Leader election (randomized election timeout)
- Log replication antar node
- Basic KV operation: `set` dan `get`
- Dashboard React (read-only, real-time state visualization)
- Fitur kill/revive node untuk simulasi kegagalan saat demo

### Di Luar Scope (Out-of-Scope) - Ditunda Secara Sengaja
- Log persistence ke disk
- Snapshot / log compaction
- Membership change / cluster reconfiguration
- Business model / monetisasi
- Fitur berbasis AI/ML

Rincian lengkap ada di [`docs/02-PROJECT_OVERVIEW.md`](docs/02-PROJECT_OVERVIEW.md) Bagian 5.

---

## 4. Demo

> **Status**: Seluruh skenario di bawah sudah diverifikasi berjalan (Milestone 0-5). Video/GIF demo aktual: **TBD** - rekaman belum diunggah ke README ini.

Skenario yang terbukti bekerja dan dapat direplikasi:
1. Cluster start-up dan leader terpilih otomatis dalam waktu wajar
2. Client melakukan `set`/`get` melalui leader; follower menolak dengan redirect info `leaderId`
3. Leader dimatikan (via tombol Kill di dashboard) → re-election terjadi otomatis, follower baru menjadi `candidate` lalu `leader`
4. Data yang sudah committed sebelum leader mati tetap konsisten dan dapat diakses dari leader baru
5. Kill 2 dari 3 node lalu revive salah satu → cluster kembali mencapai quorum dan memilih leader baru
6. Seluruh proses di atas teramati real-time di dashboard React (perubahan warna kartu: hijau=leader, kuning=candidate, biru=follower, abu-abu=unreachable)

**Catatan**: node yang di-revive kehilangan state sebelumnya (term kembali ke 0, log kosong) - ini konsekuensi dari keputusan in-memory log (ADR-002), bukan bug.

---

## 5. Risk Assessment Singkat

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Race condition pada concurrent RPC (dua node kirim vote request bersamaan) | State korup, bug sulit direproduksi | Pengujian dengan skenario timing yang sengaja divariasikan |
| Timing bug pada election timeout | Split vote berulang atau leader tidak pernah terpilih | Logging perubahan state (term, role) untuk analisis pola timing |

Rincian lengkap ada di [`docs/02-PROJECT_OVERVIEW.md`](docs/02-PROJECT_OVERVIEW.md) dan [`docs/03-ENGINEERING_STANDARDS.md`](docs/03-ENGINEERING_STANDARDS.md).

---

## 6. Pernyataan Batasan yang Jujur

Implementasi ini **tidak** diklaim sebagai "100% sesuai spesifikasi paper Raft secara lengkap" (Ongaro & Ousterhout, 2014). Target yang ditetapkan adalah kebenaran fungsional pada skenario umum (leader gagal → re-election → konsistensi data terjaga). Edge case yang belum ditangani (misalnya kasus network partition yang kompleks) akan didokumentasikan secara terbuka di bagian ini seiring pengembangan, bukan disembunyikan.

---

## 7. Lisensi

TBD.