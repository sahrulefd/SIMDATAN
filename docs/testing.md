# Quality Assurance & Testing Plan
## Multi-Tier Testing Matrix: Unit, Integration, UAT, Security

This document outlines the testing strategy to ensure SIMDATAN is secure, reliable, and compliant with all functional objectives.

---

### 1. Unit Testing
Unit testing focuses on isolated functions, helper classes, and database models.
- **Backend (PHPUnit / Pest)**:
  - Test Eloquent Model Relationships (e.g. Lahan belongs to Petani).
  - Test Automated Productivity Logic: $\text{Luas}=2.0, \text{Hasil}=10.0 \implies \text{Productivity}=5.0$.
  - Command: `php artisan test --group=unit`
- **Frontend (Vitest / React Testing Library)**:
  - Test Form Inputs (NIK validator, phone format).
  - Test utility formatters (number abbreviations, date formatting).

---

### 2. Integration Testing
Integration tests evaluate interactions between components, services, and the database.
- **Backend API Endpoints**:
  - Test login credentials flow (valid, invalid, expired).
  - Test JWT token protection middleware on secure routes.
  - Test Excel validation logic during bulk uploads.
- **Frontend-Backend Integration**:
  - Verify that Axios fetches and populates React Query states correctly.
  - Test leaf map coordinate rendering when loading data coordinates.

---

### 3. Black Box & White Box Testing
- **Black Box (Behavioral)**:
  - Validating user operations via UI buttons: Submit harvest form, verify success alerts, click download Excel, ensure correct file download.
  - Test search results matching input queries without looking at underlying SQL codes.
- **White Box (Structural)**:
  - Audit database transactions during imports to confirm correct table insertions and rollbacks on failure.
  - Inspect authorization code logic (RBAC) to ensure unauthorized users fail with standard HTTP 403.

---

### 4. User Acceptance Testing (UAT)
UAT verifies that the application satisfies the requirements of Dinas Pertanian personnel.
- **Scenario 1: Petugas Lapangan Crop Input**:
  - Petugas logs in, opens a Lahan, fills and uploads a harvest file, selects submit. Status is checked as `Submit`.
- **Scenario 2: Admin Approval**:
  - Admin reviews `Submit` harvest log. Admin clicks Approve. Status changes to `Approve`, and dashboard totals increase.

---

### 5. Security Testing
- **Brute Force Protection**: Verify that user accounts lock or throttle after 5 failed login attempts (Rate Limiter).
- **SQL Injection**: Attempt passing escape sequences into search queries to verify they are sanitized by Laravel's PDO.
- **Cross-Site Scripting (XSS)**: Attempt posting script tags (`<script>alert(1)</script>`) in field activity logs. Ensure sanitization on render.
