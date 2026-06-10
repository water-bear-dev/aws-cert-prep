# AWS Certification Prep Engine

A premium, interactive TypeScript preparation platform for AWS Certifications, starting with the **AWS Certified Machine Learning Engineer - Associate (MLA-C01)** exam.

## Features

* **Multi-Certification Selection Portal**: Choose between different AWS certifications (MLE Associate is active, others marked as Coming Soon).
* **Practice by Exam Domain**: Target specific preparation sections (e.g. Data Preparation, Model Development, Deployment, Monitoring) to master weak areas.
* **Interactive Test Engine**:
  * **Practice Mode**: Untimed with instant check-answer feedback and in-depth, styled explanation blocks.
  * **Exam Simulation**: Timed (165 minutes) with results hidden until final submission.
* **Proficiency Diagnosis**: View diagnostic PASS/FAIL status and performance breakdowns per domain after completing exams.
* **Responsive Dark-Mode UI**: Built with a sleek, glassmorphic dark-theme matching AWS cloud aesthetics.

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/water-bear-dev/aws-cert-prep.git
   cd aws-cert-prep
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build the application for production:
   ```bash
   npm run build
   ```

---

## Question Bank Configuration

To keep the repository clean and protect the questions:
* The source `.docx` documents and parsed question files are ignored by default via `.gitignore`.
* To run the application with your own questions, place your `.docx` files in the root folder, customize the `scripts/parse_exams.py` script, and execute:
  ```bash
  python3 scripts/parse_exams.py
  ```
  This will generate `public/data/tests.json` and extract the diagram images to `public/images/`.
