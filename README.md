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

> **Status**: TBD - instruksi akan dilengkapi setelah Fase 4 (Development) menghasilkan sistem yang dapat dijalankan.

Target akhir menjalankan sistem:

```bash
docker compose up
```

Target akses:
- Dashboard: `http://localhost:TBD`
- Node API (contoh): `http://localhost:TBD/client/set`, `http://localhost:TBD/client/get`

Detail lengkap (prasyarat, environment variable, port tiap node) akan dilengkapi di bagian ini setelah `docker-compose.yml` final tersedia (lihat ADR-003 - Deployment Topology, TBD).

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

> **Status: TBD.**
> Bagian ini akan berisi video/GIF yang menunjukkan skenario:
> 1. Cluster start-up dan leader terpilih otomatis
> 2. Client melakukan `set`/`get` melalui leader
> 3. Leader dimatikan secara paksa → re-election terjadi < 1 detik
> 4. Data yang sudah committed tetap konsisten setelah leader baru terpilih
>
> Akan diisi setelah Milestone 5 (Fase 4) selesai.

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