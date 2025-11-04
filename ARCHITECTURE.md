# Project Management App – Architecture Report

## 1. Tech Stack and Rationale

### Frontend

* **Framework:** React 18 + Vite + TypeScript
  I chose this stack for its **fast development experience**, **type safety**, and **excellent performance**.

  * **Vite** provides near-instant builds and hot reloads.
  * **React** is stable and well-supported, making UI logic modular and maintainable.
  * **TypeScript** adds confidence in large codebases by catching issues early.

* **Styling:** Tailwind CSS / Vanilla CSS
  A lightweight combination that allows fast prototyping while keeping bundle size small.

* **Routing:** React Router v6
  Used for intuitive navigation across authenticated routes.

### Backend

* **API Layer:** Supabase Edge Functions
  I use Edge Functions as the abstraction layer between frontend and backend logic. It keeps the client simple and secure by offloading business rules to the backend.

* **Database:** PostgreSQL
  Although Supabase currently hosts the database, my long-term plan is to migrate to a **dedicated PostgreSQL instance**.
  The reason is **speed and control** — for large-scale workloads and performance-sensitive features, direct access to PostgreSQL with optimized indexing and connection pooling provides better latency and query throughput. Speed matters for user experience (UX), especially in interactive tools like project management systems.

---

## 2. High-Level Architecture

Here’s how data flows through the system, written simply:

```
Frontend (React + Vite) ─► Edge Functions (API Layer) ─► PostgreSQL (Primary Data Store)
```

* The **frontend** handles UI rendering, authentication, and interactions.
* **Edge Functions** act as middlemen — validating requests, applying role-based logic, and connecting to the database.
* The **database** stores projects, tasks, members, and comments.

This separation ensures the frontend never talks directly to the database, enabling better security, migration flexibility, and scalability.

---

#### Why Edge Functions (Critical for Scalability):

```

  Traditional Supabase Query Approach             
                                  
 Frontend ─► direct queries ─► DB       
                                    
 ❌ Tight coupling, hard to migrate              

 Edge Functions Approach (Our Strategy)          
 
 Frontend ─► Edge Functions ─► DB        
               
 ✅ Abstraction layer, easy migration            

```

By introducing an abstraction layer via Edge Functions, I can easily migrate the backend from Supabase to a standalone PostgreSQL server in the future — without touching the frontend.

---

## 3. Future Extension: Audio-to-Text Transcription for Note-Taking

I’ve previously implemented a **speech-to-text feature** in my project [Speaking Arabic](http://speaking-arabic.netlify.app/) using **Google Speech-to-Text API**, which transcribes spoken Arabic into text in real time. That experience taught me key lessons about accuracy, latency, and user experience that I plan to apply here.

### Integration Plan

1. **Frontend**

   * Add an **audio recording button** using the browser’s `MediaRecorder` API.
   * Once recording is finished, upload the audio blob to cloud storage.

2. **Backend**

   * An **Edge Function** will receive the uploaded audio file’s URL.
   * It will send the file to **Google Speech-to-Text API** for transcription.
   * The transcription text will be saved into the `notes` table, linked to a project or task.

### Potential Challenges

* **Latency:** Real-time transcription requires efficient streaming and may add noticeable delay for long recordings.
* **Cost:** High usage could make API calls expensive; batching or caching may help.
* **Accuracy:** Domain-specific terms (e.g., project names) may require a custom model or keyword biasing.
* **Privacy:** All audio files must be stored securely and deleted after processing.

### Provider Selection

Based on prior experience, I’d select **Google Speech-to-Text** due to:

* Strong accuracy in multiple languages.
* Familiar integration pattern (REST or gRPC).
* Real-time streaming support.
* Consistent reliability at scale.

Other possible alternatives (for future evaluation) include **OpenAI Whisper API** and **AssemblyAI**, but for now, Google’s SDK remains the most mature.

---

## 4. Scaling from 1,000 → 100,000 Users

As the app grows, two primary dimensions matter: **performance** and **reliability**.

### Key Scaling Considerations

#### (1) Backend & Database

* Migrate from Supabase to a **dedicated PostgreSQL server** with connection pooling (e.g., via PgBouncer).
* Add **read replicas** and **partitioning** for heavy query loads.
* Introduce **Redis caching** for frequently accessed resources.
* Offload long-running tasks (e.g., file uploads or speech transcription) to asynchronous job queues like **Celery** or **BullMQ**.

#### (2) Frontend & Delivery

* Host on **Vercel or Cloudflare Pages** with CDN caching for global access.
* Implement **code splitting** and **lazy loading** to reduce initial load time.
* Use **Service Workers** for background sync and offline-first capability (future phase).

#### (3) Monitoring & Observability

* Add centralized logs and metrics via **Sentry** and **Grafana**.
* Measure slow queries using **pg_stat_statements** and optimize proactively.

---

### Summary

* **Tech Stack:** React + Vite + Edge Functions + PostgreSQL
  → balances development speed and future performance scalability.
* **Architecture:** Clear separation of frontend ↔ Edge Functions ↔ PostgreSQL ensures maintainability.
* **Audio-to-Text:** Plan to integrate Google Speech-to-Text API, leveraging real-world experience from my [Speaking Arabic](http://speaking-arabic.netlify.app/) app.
* **Scaling:** Migrate to dedicated PostgreSQL, add caching, and distribute via CDN for smooth growth to 100K users.
