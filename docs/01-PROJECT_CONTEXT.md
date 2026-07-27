# Project Context

**Project**: Distributed Key-Value Store with Raft Consensus
**Document type**: Project Context
**Status**: Active
**Last updated**: 2026-07-26

---

## 1. Latar Belakang

Proyek ini dibangun sebagai portofolio teknis independen oleh seorang *fresh graduate software engineer* tanpa pengalaman kerja formal di industri. Karena pelamar di tahap karir ini tidak memiliki riwayat kerja yang bisa dijadikan bukti kompetensi, proyek portofolio berfungsi sebagai sinyal utama kemampuan teknis dan cara berpikir engineering kepada pihak yang mengevaluasi (recruiter, hiring manager, interviewer teknis).

Proyek dipilih setelah proses evaluasi terhadap beberapa alternatif ide (real-time collaborative editor berbasis CRDT, network packet visualizer, rate limiter/job scheduler dashboard). Distributed key-value store dengan Raft consensus dipilih karena memenuhi kriteria berikut secara konsisten dibanding alternatif lain:

- Dapat di-deploy penuh sebagai sistem yang berjalan nyata (bukan simulasi/animasi kosong).
- Sulit direduksi menjadi "wrapper" dari library/tool pihak ketiga yang sudah menyelesaikan bagian tersulitnya.
- Topik relevan langsung dengan materi system design interview di level industri.
- Selaras dengan level kompetensi yang ingin ditunjukkan oleh kandidat fresh graduate untuk membedakan diri dari kandidat lain.

## 2. Masalah yang Menjadi Dasar Proyek

Sistem terdistribusi modern (database, message queue, service discovery) membutuhkan mekanisme agar seluruh node dalam cluster tetap sepakat (*consensus*) terhadap satu sumber kebenaran data, meskipun sebagian node mengalami kegagalan atau jaringan mengalami partisi. Kegagalan menangani masalah ini dengan benar dapat menyebabkan *split-brain* (dua node yang sama-sama mengklaim sebagai leader) dan korupsi data.

Algoritma Raft (Ongaro & Ousterhout, 2014) dirancang untuk menyelesaikan masalah ini dengan pendekatan yang lebih mudah dipahami dibanding algoritma pendahulunya (Paxos), tanpa mengorbankan *correctness*.

## 3. Posisi Proyek dalam Lanskap Industri

Proyek ini **bukan** produk end-user dan **bukan** database production-ready. Proyek ini adalah implementasi edukatif dari *consensus layer* — komponen infrastruktur yang secara konsep setara dengan apa yang mendasari sistem produksi seperti:

- etcd (dipakai Kubernetes)
- Consul (HashiCorp)
- CockroachDB (Raft-based distributed SQL)
- Kafka (KRaft mode)

Framing yang digunakan dalam mengomunikasikan proyek ini secara konsisten adalah: *"komponen consensus yang berbiaya tinggi apabila salah diimplementasikan, karena dipakai sebagai fondasi sistem produksi berskala besar."* Business model konvensional (target pasar, model pendapatan) secara sengaja **tidak** diterapkan pada proyek ini, karena proyek ini berada di kategori infrastruktur/building block, bukan produk dengan end-user.

## 4. Batasan yang Disengaja (Deliberate Constraints)

Untuk menjaga proyek tetap dapat diselesaikan dalam skala waktu solo development, batasan berikut ditetapkan secara sadar sejak awal, bukan akibat keterbatasan pemahaman:

- **AI/ML tidak menjadi fitur inti.** Area ini (adaptive election timeout, failure prediction, adaptive log compaction) diidentifikasi sebagai berpotensi menjadi *buzzword stacking* tanpa substansi jika ditambahkan sebelum fondasi consensus-nya solid. Area ini didokumentasikan sebagai kemungkinan fase lanjutan opsional, bukan bagian dari scope aktif.
- **Business model tidak dikembangkan** karena tidak relevan dengan kategori proyek (lihat Bagian 3).
- **Kubernetes dihindari sebagai target deployment** karena berisiko overkill untuk skala proyek dan berpotensi jadi buzzword stacking yang sama seperti kasus AI/ML.

## 5. Audiens Dokumen Ini

Dokumen ini dan dokumen pendamping (`02-PROJECT_OVERVIEW.md`, `03-ENGINEERING_STANDARDS.md`) ditulis untuk dapat dibaca oleh:
- Pembuat proyek sendiri, sebagai rujukan saat proyek dilanjutkan setelah jeda waktu.
- Pihak evaluator eksternal (recruiter, interviewer) yang ingin memahami konteks dan maturity proses di balik proyek.
