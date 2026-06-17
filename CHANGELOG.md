# Changelog

All notable changes to the AWS Certification Prep Engine will be documented in this file.

## [Unreleased]

### Added
- **Multi-Certification Support**: Expanded the platform to support AWS Certified Machine Learning Engineer (Associate), Solutions Architect (Associate & Professional), DevOps Engineer (Professional), Security (Specialty), Data Engineer (Associate), Developer (Associate), and SysOps Administrator (Associate).
- **Dynamic Parser**: Python `parse_exams.py` script now scans directories within `QuestionBank/` to dynamically process `.docx` files for different certifications and export separate JSON test banks.
- **Uniform Exam Naming**: Exams automatically adopt a uniform title format: `<certificate-name> - Practice Exam - #<number>`.

### Changed
- **Domain Filtering & Ordering**: App now filters out any test domains that contain fewer than 10 questions and alphabetically sorts the remaining valid domains to ensure numerical ordering.
- **Hero Banner Localization**: Dashboard's hero banner dynamically renders the correct title and exam code (e.g., `DEA-C01`, `SOA-C02`) based on the currently selected certification.
- **Layout Consistency**: Refactored the "Available Practice Exams" grid to enforce a strict 2-column layout to match the "Practice by Domain" layout.

### Fixed
- **Domain Extraction**: Fixed a bug where the Python parser falsely grouped irrelevant explanation paragraphs into domains. It now strictly enforces extraction of explicit "Domain X: ..." strings.
