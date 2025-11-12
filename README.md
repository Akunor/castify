# Castify

Castify turns dense business content into short, digestible audio briefings. It supports executives and knowledge teams who need to stay informed about reports, policies, research and meeting packs without being tethered to a screen.

> This repository is shared publicly for transparency. Castify is delivered as a hosted product—please use the live platform for real workloads instead of self-deploying the code in this repo.

---

## Product overview

- **Rapid document intelligence** — upload single files or whole project folders and receive curated audio summaries.
- **Governed knowledge hubs** — organise material into projects, monitor parsing status and keep track of transcripts.
- **Actionable playback** — listen in-app, skim transcripts and revisit highlights whenever needed.

---

## Platform workflow

1. **Ingest**: source documents (PDF, DOCX, TXT, Markdown) are added to Castify.  
2. **Interpret**: the platform extracts key insights and crafts a conversational script using LLM orchestration.  
3. **Deliver**: narrated audio and transcripts appear in the dashboard for on-the-go listening and easy reference.

---

## Technology foundation

- **Next.js** (App Router) & **TypeScript** power the application layer.
- **Supabase** handles authentication, database storage and file delivery.
- **OpenAI** provides language understanding and speech synthesis.
- **Tailwind CSS** with shadcn/ui underpins the product experience.

This architectural snapshot is here to help reviewers understand the system; operational tooling, automation and environment configuration live in private infrastructure.

---

## Availability

- **Live platform**: request access via the Castify team to experience the production deployment.  
- **Demo enquiries**: contact [Akunor](https://github.com/Akunor) to arrange a guided walkthrough or discuss partnerships.

---

## Roadmap highlights

- Richer narrative styles and multi-voice productions.
- Collaboration features for team reviews and approvals.
- Enhanced mobile listening experiences and offline support.

---

## License

The code is published publicly for review purposes but is not licensed. Commercial usage should occur through the official Castify service if/when available.