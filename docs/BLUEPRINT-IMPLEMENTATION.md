# Blueprint → Implementation Matrix

| Blueprint area | Implementasi repo |
| --- | --- |
| Executive Dashboard | dashboard view |
| Regulatory Intelligence | regulatory sources + regulations + Regulatory Hub |
| Legal Document Studio | documents + versions + citations + workflow |
| Tata Naskah Engine | machine validation TN-001 sampai TN-015 |
| Authority & Signature | authority policy + approval history + signature center |
| SOP / Policy | SOP Studio + sop steps |
| Compliance | compliance obligations + assessments + matrix |
| Legal / Ethics | legal cases + restricted ethics cases |
| Contract / License | contract board + license expiry |
| Mail Control | incoming / outgoing register |
| Templates | template governance lifecycle |
| Archive / Backup | archive health + archive object model |
| Audit | audit explorer + audit event model |
| AI / RAG | guardrail-first shell; no secret AI call in frontend |
| Google Drive | archive pointer model; secret-backed sync belongs server-side |
| QA / UAT | UAT scenarios in README and blueprint |
| GitHub Pages | static Pages workflow |

## Boundary

Blueprint membedakan norma hukum dengan rekomendasi arsitektur. Repository mengikuti boundary tersebut: aplikasi tidak mengubah norma hukum, dan kewenangan tanda tangan tetap ditentukan Authority Matrix institusi yang disahkan.
