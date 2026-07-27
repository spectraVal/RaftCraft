# ADR-001: Protokol RPC Antar Node

**Status**: Accepted
**Date**: 2026-07-26
**Deciders**: [Nama Anda]

---

## Konteks

Setiap node dalam cluster Raft perlu berkomunikasi satu sama lain melalui dua jenis RPC utama sesuai spesifikasi paper Raft:

- `RequestVote` - dikirim oleh candidate saat proses leader election
- `AppendEntries` - dikirim oleh leader untuk heartbeat dan replikasi log

Komunikasi ini bersifat sinkron (request-response), sering (heartbeat setiap ~50ms per target non-functional yang ditetapkan di `02-PROJECT_OVERVIEW.md`), dan menjadi jalur kritis bagi correctness sistem. Pemilihan protokol RPC memengaruhi kemudahan debugging, kompleksitas implementasi, dan kecepatan iterasi selama development - faktor yang relevan mengingat proyek dikerjakan solo dengan waktu terbatas.

## Opsi yang Dipertimbangkan

### Opsi A - HTTP/JSON (REST-style, menggunakan Express.js)
- Setiap RPC diimplementasikan sebagai endpoint HTTP (`POST /request-vote`, `POST /append-entries`), payload berupa JSON.
- Pengujian manual dapat dilakukan langsung menggunakan `curl` atau Postman tanpa tooling tambahan.
- Ekosistem Node.js untuk HTTP server (Express) sudah familiar dan minim setup.

### Opsi B - gRPC (Protocol Buffers)
- RPC didefinisikan melalui skema `.proto`, komunikasi menggunakan HTTP/2 dengan serialisasi biner.
- Performa serialisasi/deserialisasi lebih efisien dibanding JSON, dan skema tipe data lebih ketat (strongly typed).
- Umum digunakan pada implementasi Raft production-grade (misalnya etcd menggunakan gRPC).

## Keputusan

**Opsi A - HTTP/JSON** dipilih untuk versi MVP (v1).

Alasan utama:
1. **Kemudahan debugging** - payload JSON dapat diperiksa langsung lewat `curl`/Postman/browser devtools tanpa perlu decode biner atau tooling `.proto`, penting mengingat debugging distributed system (race condition, timing bug) sudah menjadi risiko signifikan yang teridentifikasi di risk assessment proyek.
2. **Kecepatan iterasi** - tidak perlu waktu tambahan untuk setup skema Protocol Buffers dan code generation di tahap awal, saat prioritas utama adalah memvalidasi correctness logic Raft.
3. **Kesesuaian skala proyek** - MVP ini adalah implementasi edukatif untuk portofolio (lihat `01-PROJECT_CONTEXT.md`), bukan sistem production yang dituntut performa tinggi; keunggulan performa gRPC tidak menjadi faktor penentu pada skala ini.

## Konsekuensi

**Dampak positif:**
- Proses debugging dan testing manual selama development jauh lebih cepat.
- Kurva belajar lebih rendah, memungkinkan fokus penuh pada correctness logic Raft di Fase 4 milestone awal.

**Trade-off yang diterima:**
- Overhead serialisasi JSON dan HTTP/1.1 lebih besar dibanding gRPC - tidak relevan secara praktis untuk skala 3 node dengan heartbeat interval ~50ms yang ditetapkan, namun perlu dicatat sebagai keterbatasan yang disadari, bukan diabaikan.
- Tidak ada strong typing bawaan seperti Protocol Buffers - validasi struktur payload RPC perlu ditangani manual di level aplikasi.
- Jika proyek ini suatu saat dikembangkan ke arah yang lebih mendekati production-grade, migrasi ke gRPC kemungkinan perlu dipertimbangkan ulang sebagai ADR terpisah yang men-supersede keputusan ini.

## Status Terkait

Keputusan ini bersifat final untuk scope MVP v1 dan tidak diubah retroaktif. Perubahan keputusan di masa depan akan dicatat sebagai ADR baru (misalnya `ADR-004`) yang secara eksplisit men-supersede ADR ini, sesuai standar yang ditetapkan di `03-ENGINEERING_STANDARDS.md` Bagian 2.
