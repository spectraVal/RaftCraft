# ADR-002: Penyimpanan Log Raft - In-Memory vs Persist ke Disk

**Status**: Accepted
**Date**: 2026-07-27
**Deciders**: [Nama Anda]

---

## Konteks

Setiap node Raft menyimpan log entries (`{term, index, command}`) yang menjadi dasar replikasi data ke seluruh cluster. Menurut spesifikasi paper Raft, log seharusnya dipersist ke stable storage (disk) sebelum node merespons RPC, karena log yang hilang saat node restart dapat menyebabkan pelanggaran terhadap jaminan konsistensi (misalnya node "lupa" bahwa ia sudah vote di term tertentu, atau kehilangan entry yang sudah di-commit).

Namun demikian, implementasi persistence yang benar (fsync ke disk, write-ahead logging, recovery saat restart) menambah kompleksitas signifikan dan bukan bagian dari inti masalah yang ingin dibuktikan pemahamannya pada MVP ini (lihat `02-PROJECT_OVERVIEW.md` Bagian 5 - log persistence eksplisit masuk daftar Out-of-Scope).

## Opsi yang Dipertimbangkan

### Opsi A - In-Memory (log disimpan sebagai array/struktur data di memori proses)
- Log dan state (`currentTerm`, `votedFor`, `log[]`) hilang setiap kali proses node di-restart.
- Implementasi jauh lebih sederhana - tidak perlu file I/O, format serialisasi, atau logika recovery.
- Fokus pengujian dapat sepenuhnya diarahkan ke correctness algoritma consensus (election, replication), bukan reliability I/O.

### Opsi B - Persist ke Disk (write-ahead log sederhana)
- Setiap perubahan state signifikan (vote, log append) ditulis ke file sebelum node merespons RPC, sesuai spesifikasi paper Raft.
- Node yang restart dapat memulihkan state dari disk, mendekati perilaku sistem production-grade.
- Menambah kompleksitas: format file, strategi fsync, logika recovery saat startup, serta skema pengujian tambahan (crash-recovery testing).

## Keputusan

**Opsi A - In-Memory** dipilih untuk MVP v1.

Alasan utama:
1. **Kesesuaian dengan scope yang telah disepakati** - log persistence secara eksplisit masuk daftar Out-of-Scope MVP (`02-PROJECT_OVERVIEW.md` Bagian 5), keputusan ini murni menegaskan konsekuensi teknis dari keputusan scope yang sudah diambil, bukan keputusan baru yang berdiri sendiri.
2. **Isolasi kompleksitas** - dengan log in-memory, kegagalan/bug yang muncul saat testing dapat dipastikan berasal dari logic consensus, bukan tercampur dengan bug pada lapisan I/O/disk. Ini penting mengingat sistem terdistribusi sudah cukup sulit di-debug tanpa variabel tambahan.
3. **Momentum development** - sejalan dengan prinsip milestone granular pada `03-ENGINEERING_STANDARDS.md` Bagian 8, menghindari terjebak pada detail implementasi (persistence) sebelum fondasi inti (leader election, log replication) terbukti benar.

## Konsekuensi

**Dampak positif:**
- Implementasi Milestone 1-3 (Fase 4) dapat difokuskan penuh pada correctness algoritma Raft.
- Siklus development-testing lebih cepat karena tidak ada dependency pada file I/O.

**Trade-off yang diterima:**
- Node yang di-restart akan kehilangan seluruh state (term, vote, log) - perilaku ini **berbeda dari Raft production-grade** dan harus dikomunikasikan secara eksplisit saat demo maupun wawancara, sesuai prinsip transparansi pada `02-PROJECT_OVERVIEW.md` Bagian 7.
- Skenario crash-recovery (node mati lalu restart dengan state terjaga) **tidak dapat didemonstrasikan** pada MVP ini - yang dapat didemonstrasikan hanyalah node yang dimatikan permanen selama sesi demo (kill/revive dalam arti proses tetap hidup atau digantikan proses baru yang kosong, bukan proses yang sama dengan state pulih).
- Jika proyek dilanjutkan ke fase berikutnya, implementasi persistence akan memerlukan ADR baru yang mengevaluasi ulang trade-off ini dengan mempertimbangkan format storage dan strategi fsync secara spesifik.

## Status Terkait

Keputusan ini merupakan turunan langsung dari scope yang ditetapkan di `02-PROJECT_OVERVIEW.md`. Perubahan scope di masa depan (misalnya log persistence dimasukkan kembali ke scope aktif) mewajibkan ADR baru yang men-supersede ADR ini.
