# Literature Review Helper Web Application

## Vision

This project aims to develop a **web application** that assists students, researchers, and professionals across various fields (engineering, health, chemistry, social sciences, etc.) in conducting **literature reviews** efficiently, systematically, and with full reproducibility.

The application will integrate with **external research engines via APIs** to collect and summarize relevant academic information. It will also generate **automated reports** summarizing the research process and results, allowing users to **replicate or refine searches** in the future.

---

## Objectives

The main goal is to simplify and accelerate the literature review process by:
- Retrieving relevant academic papers from multiple sources;
- Generating concise summaries and identifying key themes;
- Producing structured reports with metadata and reproducibility parameters;
- Enabling repeatable searches and report regeneration.

---

## Target Users

- University and postgraduate students  
- Researchers and academics  
- Professionals who perform technical or scientific reviews  
- Research centers and educational institutions

---

## Vision and Scope

### Vision
To become a reference platform for automated literature reviews, improving **efficiency, reproducibility, and scientific quality**.

### Scope
The initial version (MVP) will include:
- User input for a **research topic or query**  
- Integration with multiple **academic search APIs**.
- Storage of search history for **future replication**

---

## MVP — Minimum Viable Product

| Category | Functionality | Description |
|-----------|----------------|-------------|
| Search | API integration with at least two academic search engines | Retrieve relevant papers and metadata |
| Processing | Automatic summarization | Use NLP to generate short summaries of papers |
| Reporting | Report generation  | Compile results, summaries, and parameters |
| Persistence | Search history storage | Save and re-run previous searches |
| UI/UX | Simple and intuitive web interface | Dashboard for managing searches and reports |

---

## Proposed Technology Stack

- **Frontend:** React (TypeScript, TailwindCSS)  
- **Backend:** Spring Boot (Java)  
- **Build & Deployment:** Maven, GitHub Actions (CI/CD)
