# ARMONI • UPT RSUD Sultan Syarif Mohamad Alkadrie

Alkadrie Regulatory, Legal, Ethics & Compliance Integrated System.

Repository ini berisi frontend static untuk GitHub Pages dan terhubung ke Supabase sebagai system of record. Dokumen legal, SOP, evidence, dan arsip tidak disimpan di GitHub.

## Fitur

- Dashboard eksekutif dengan KPI regulasi, dokumen, compliance, kasus, kontrak, lisensi, dan archive health.
- Regulatory Hub dengan pencarian, status berlaku, metadata sumber, dan relasi.
- Legal Document Studio dengan form terstruktur, legal basis selector, Tata Naskah validator, workflow timeline, dan nomor dokumen draft.
- Approval Inbox dan Signature Center.
- SOP Studio, Compliance Matrix, Legal Cases, Ethics Cases, Contracts, Licenses, Incoming/Outgoing Mail.
- Template governance dan archive health.
- Audit Explorer dan Administration.
- Supabase Auth, role-aware UI, session-aware navigation, dan Preview/Demo tanpa database.
- Responsive desktop/tablet/mobile, PWA manifest, hash-routing, dan fallback 404.
- GitHub Actions deployment ke GitHub Pages.

## Arsitektur

Frontend GitHub Pages → Supabase Auth/Data API → PostgreSQL + RLS → Supabase Storage / Edge Functions → Google Drive archive.

Jangan pernah menaruh service-role key, Google credential, atau AI secret di frontend. config.js hanya berisi Supabase publishable key. Supabase mendokumentasikan publishable key untuk client-side use dengan syarat RLS dan least privilege diterapkan.

## GitHub Pages

Di repository GitHub: Settings → Pages → Source: GitHub Actions.

Workflow menggunakan actions/configure-pages@v5, actions/upload-pages-artifact@v4, dan actions/deploy-pages@v4.

URL default setelah deployment:
https://rsudssma-pnk.github.io/legal/

## Supabase

Project URL:
https://nbewlpbbvtwtuvamadle.supabase.co

Tabel legal yang disiapkan:
- legal_regulatory_sources
- legal_regulations
- legal_documents
- legal_document_versions
- legal_document_regulations
- legal_workflow_tasks
- legal_approval_history
- legal_authority_policies
- legal_sop_steps
- legal_compliance_obligations
- legal_compliance_assessments
- legal_contracts
- legal_licenses
- legal_cases
- legal_ethics_cases
- legal_mail_register
- legal_templates
- legal_archive_objects
- legal_audit_events
- legal_number_sequences

## Role

Role blueprint yang ditambahkan ke database:
SUPER_ADMIN, LEGAL_ADMIN, ETHICS_ADMIN, COMPLIANCE_ADMIN, DOCUMENT_MANAGER, UNIT_OWNER, DIRECTOR, AUDITOR.

Role diberikan melalui mekanisme admin Supabase, bukan melalui client publik.

## Mode demo

Preview / Demo menampilkan seluruh UI dengan data contoh lokal. Mode ini tidak membaca atau menulis database sehingga aman untuk presentasi dan review layout.

## Tata Naskah

UI dan validator awal mengikuti blueprint implementasi Perwali Pontianak Nomor 65 Tahun 2023 yang digunakan sebagai basis proyek, termasuk aturan font, margin, page number, paraf, TTE, paper/electronic mode, security classification, dan Authority Matrix.

## UAT

Cakupan acceptance yang dirancang mengikuti matriks UAT pada blueprint: login/RLS, valid regulation, superseded regulation, create SK, document generation, mandatory field gate, missing paraf, max three hierarchy paraf, electronic/paper output, signed immutability, backup retry, hash mismatch, revoked regulation impact, confidential case, template versioning, dan restore.

## Implementasi lanjutan

Generator DOCX/PDF high-fidelity dan Google Drive backup service harus ditempatkan di backend/Edge Function. GitHub Pages hanya menyajikan UI statis dan client-side orchestration.
