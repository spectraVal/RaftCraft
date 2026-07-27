# ADR-003: Deployment Topology

**Status**: Accepted
**Date**: 2026-07-27
**Deciders**: [Nama Anda]

---

## Konteks

Sistem terdiri dari beberapa proses yang harus berjalan bersamaan dan saling terhubung: 3 node Raft (masing-masing proses Node.js terpisah) dan 1 dashboard React. Untuk keperluan demo (baik saat interview maupun sebagai bukti fungsional di README, lihat `03-ENGINEERING_STANDARDS.md` Bagian 6), proses menjalankan sistem perlu dapat direplikasi oleh pihak lain dengan mudah, tanpa bergantung pada konfigurasi environment lokal milik pembuat proyek.

Perlu dipertimbangkan juga bahwa proyek ini adalah portofolio edukatif solo (lihat `01-PROJECT_CONTEXT.md`), sehingga kompleksitas infrastruktur deployment harus proporsional terhadap skala sistem - bukan dipilih karena terlihat canggih.

## Opsi yang Dipertimbangkan

### Opsi A - Docker Compose
- Satu file `docker-compose.yml` mendefinisikan 4 service (3 node + 1 dashboard), dijalankan dengan satu perintah (`docker compose up`).
- Berjalan sepenuhnya secara lokal di mesin mana pun yang memiliki Docker terinstal - tidak memerlukan biaya hosting.
- Reproducibility tinggi: environment antar node konsisten karena berbasis image yang sama.

### Opsi B - Deploy ke VPS Publik (mis. DigitalOcean, Railway)
- Sistem berjalan live dan dapat diakses melalui URL publik kapan saja, tanpa perlu pihak lain menjalankan apa pun secara lokal.
- Memerlukan biaya hosting berkelanjutan (meski kecil) dan konfigurasi tambahan (networking antar container di lingkungan cloud, environment variable, keamanan port yang terekspos).
- Menambah permukaan kegagalan (uptime, biaya, maintenance) yang tidak berkontribusi langsung pada tujuan utama proyek (pembuktian pemahaman Raft).

### Opsi C - Kubernetes
- Orkestrasi container dengan fitur scaling, self-healing, dan service discovery bawaan.
- Kompleksitas setup (manifest YAML, cluster provisioning) jauh melebihi kebutuhan sistem 4-proses berskala kecil ini.
- Berisiko dipersepsikan sebagai *buzzword stacking* - menambahkan teknologi populer tanpa kebutuhan teknis nyata, pola yang sama dengan pertimbangan yang menyebabkan AI/ML dikeluarkan dari scope (lihat `01-PROJECT_CONTEXT.md` Bagian 4).

## Keputusan

**Opsi A - Docker Compose** dipilih sebagai target deployment utama. **Opsi B** ditetapkan sebagai *stretch goal* opsional, dikerjakan hanya jika dibutuhkan tautan demo publik untuk keperluan personal branding setelah MVP selesai. **Opsi C** ditolak.

Alasan utama:
1. **Reproducibility tanpa biaya** - pihak evaluator eksternal (recruiter/interviewer) dapat menjalankan sistem sendiri dengan satu perintah, tanpa Anda perlu menanggung biaya hosting berkelanjutan untuk sistem yang sifatnya demo, bukan layanan produksi.
2. **Proporsionalitas terhadap skala** - sistem 4-proses tidak membutuhkan fitur orkestrasi lanjutan (auto-scaling, self-healing) yang menjadi alasan keberadaan Kubernetes; menggunakannya berisiko memindahkan effort dari pembuktian pemahaman distributed systems ke pembuktian kemampuan infrastruktur yang tidak menjadi fokus proyek ini.
3. **Cukup untuk bukti fungsional** - kombinasi Docker Compose lokal + video/GIF demo di README (lihat `README.md` Bagian 4) sudah memadai sebagai bukti sistem berjalan nyata, sesuai standar dokumentasi yang ditetapkan.

## Konsekuensi

**Dampak positif:**
- Tidak ada biaya infrastruktur berkelanjutan selama fase development maupun setelah MVP selesai.
- Setup environment konsisten antar mesin, mengurangi risiko bug "hanya terjadi di laptop saya".

**Trade-off yang diterima:**
- Sistem tidak dapat diakses langsung melalui link publik kecuali Opsi B (stretch goal) dikerjakan - evaluator eksternal perlu menjalankan Docker Compose sendiri atau mengandalkan video/GIF demo di README.
- Jika Opsi B suatu saat dikerjakan, konfigurasi tambahan (environment variable untuk komunikasi antar container di cloud, exposed port, dsb.) akan memerlukan penyesuaian terhadap `docker-compose.yml` yang dibangun di bawah keputusan ini - kemungkinan dicatat sebagai ADR terpisah jika perubahannya signifikan.

## Status Terkait

Keputusan ini konsisten dengan `03-ENGINEERING_STANDARDS.md` Bagian 7. Opsi B (VPS) bukan pelanggaran terhadap ADR ini selama statusnya tetap opsional/stretch goal dan tidak menggantikan Docker Compose sebagai jalur utama menjalankan sistem.
