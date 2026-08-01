<!--
Template ini digunakan khusus untuk PR "Release" dari branch `dev` ke `main`.
Judul PR mengikuti format:
Release: v0.X.0 - [Nama Milestone]
-->

## Versi
<!-- Contoh:
v0.5.0
-->
vX.X.X

## Milestone Terkait
<!-- Contoh:
Milestone 4 - Dashboard React (Read-Only)
-->
Milestone X - [Nama Milestone]

## Apa yang Baru
<!--
Jelaskan fitur, perubahan, atau peningkatan yang masuk pada versi ini.
Gunakan bullet point singkat dan spesifik.
Contoh:
- Dashboard React untuk monitoring status node secara real-time
- Endpoint baru untuk expose status sistem
- Konfigurasi CORS untuk komunikasi frontend-backend
-->
- 
- 

## Keputusan Penting
<!--
Tuliskan ADR jika terdapat keputusan arsitektur signifikan.

Jika tidak ada ADR baru, jelaskan alasannya.
Contoh:
- Tidak ada ADR baru - perubahan hanya berupa konfigurasi teknis dan tidak mengubah desain arsitektur utama
-->
- 

## Test yang Dijalankan
<!--
Centang test yang relevan.

Jika suatu jenis test tidak dilakukan, berikan alasan.
Contoh:
- Unit test (tidak berlaku - perubahan hanya pada layer presentasi)
- Integration test (tidak berlaku - tidak ada perubahan komunikasi antar komponen)
- Verifikasi manual: fitur berjalan sesuai skenario
-->

- [ ] Unit test
  <!-- Jika tidak dilakukan, jelaskan alasan -->
- [ ] Integration test
  <!-- Jika tidak dilakukan, jelaskan alasan -->
- [ ] Scenario test (jika berlaku, misalnya failover, recovery, atau multi-node behavior)
  <!-- Jika tidak dilakukan, jelaskan alasan -->
- [ ] Verifikasi manual
  <!-- Jelaskan skenario manual yang diverifikasi -->

## Keterbatasan Diketahui
<!--
Tuliskan edge case, fitur yang belum tersedia, atau batasan implementasi pada versi ini.

Jangan dikosongkan. Jika tidak ada keterbatasan yang diketahui, tuliskan:
"Tidak ada keterbatasan diketahui pada versi ini."
-->
- 

## Checklist Definition of Done
<!--
Sesuai 03-ENGINEERING_STANDARDS.md Bagian 5.
Checklist harus mencerminkan kondisi sebenarnya.
-->

- [ ] Kode berjalan dan dapat didemonstrasikan
- [ ] Test relevan ditulis dan lulus (atau alasan pengecualian sudah dijelaskan)
- [ ] Keputusan desain signifikan sudah didokumentasikan (ADR bila relevan)
- [ ] Commit history jelas dan mencerminkan progres milestone