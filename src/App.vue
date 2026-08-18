<template>
  <div class="wedding-app">
    <!-- Particles background -->
    <div class="particles" aria-hidden="true">
      <span v-for="n in 18" :key="n" class="particle" :style="particleStyle(n)"
        >✦</span
      >
    </div>

    <!-- Hero -->
    <header class="hero text-center">
      <div class="rings-wrapper" aria-hidden="true">
        <svg
          class="rings-svg"
          viewBox="0 0 120 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="40"
            cy="30"
            r="22"
            fill="none"
            stroke="#e8c97a"
            stroke-width="2.5"
            opacity="0.85"
          />
          <circle
            cx="80"
            cy="30"
            r="22"
            fill="none"
            stroke="#e8c97a"
            stroke-width="2.5"
            opacity="0.85"
          />
        </svg>
      </div>
      <p class="eyebrow">{{ config.date }}</p>
      <h1 class="couple-names">
        {{ config.bride }} <span class="amp">&amp;</span> {{ config.groom }}
      </h1>
      <p class="tagline">{{ config.tagline }}</p>
    </header>

    <div class="text-center">
      <HeartImage :src="cupluImg" />
    </div>

    <!-- Upload zone -->
    <main class="container upload-section">
      <div
        class="drop-zone"
        :class="{
          'drop-zone--active': isDragging,
          'drop-zone--uploading': isUploading,
          'drop-zone--done': showSummary && !isUploading,
        }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="triggerFileInput"
        role="button"
        tabindex="0"
        :aria-label="
          isUploading ? 'Se încarcă...' : 'Apasă sau trage imaginile aici'
        "
        @keydown.enter="triggerFileInput"
        @keydown.space.prevent="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*,video/*"
          class="visually-hidden"
          @change="onFileSelect"
          aria-hidden="true"
        />

        <!-- Stare: se încarcă -->
        <div v-if="isUploading" class="drop-zone__uploading">
          <Spinner />
          <p class="uploading-label">
            Se încarcă {{ doneCount }} din {{ queue.length }}…
          </p>
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: overallProgress + '%' }"
            ></div>
          </div>
          <p v-if="etaText" class="eta-label">{{ etaText }}</p>
          <p class="drop-zone__hint">
            Te rugăm nu închide tab-ul și nu bloca ecranul telefonului cât timp
            se încarcă ✦
          </p>
        </div>

        <!-- Stare: după upload reușit -->
        <div v-else-if="showSummary" class="drop-zone__idle">
          <div class="success-icon" aria-hidden="true">🥂</div>
          <p class="drop-zone__title">Mulțumim!</p>
          <p class="drop-zone__sub">
            <span v-if="uploadedFiles.length === 1"
              >Ai adăugat o amintire în albumul nostru.</span
            >
            <span v-else
              >Ai adăugat {{ uploadedFiles.length }} amintiri în albumul
              nostru.</span
            >
          </p>
          <p class="drop-zone__hint">
            Mai ai poze sau clipuri?
            <span class="text-gold">Apasă să alegi din galerie ✦</span>
          </p>
        </div>

        <!-- Stare: prima vizită -->
        <div v-else class="drop-zone__idle">
          <div class="drop-icon">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="4"
                y="14"
                width="38"
                height="30"
                rx="3"
                stroke="currentColor"
                stroke-width="2"
              />
              <circle
                cx="15"
                cy="24"
                r="4"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M4 34 L13 24 L22 32 L30 22 L42 34"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
              <rect
                x="36"
                y="28"
                width="24"
                height="18"
                rx="3"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M60 33 L60 41 L54 37 Z"
                fill="currentColor"
                opacity=".6"
              />
            </svg>
          </div>
          <div class="d-none d-sm-block">
            <p class="drop-zone__title">
              Trage fotografiile și videoclipurile aici
            </p>
            <p class="drop-zone__sub">
              sau <span class="text-gold">alege din galerie</span>
            </p>
          </div>
          <div class="d-sm-none">
            <p class="drop-zone__title">
              Alege fotografiile și videoclipurile <br />din galerie
            </p>
          </div>
          <p class="drop-zone__hint">
            Imagini &amp; video · pentru o experiență optimă, videoclipurile
            scurte se încarcă cel mai bine 🎬
          </p>
        </div>
      </div>

      <!-- Preview grid -->
      <transition-group
        name="fade"
        tag="div"
        class="preview-grid row g-3 mt-4"
        v-if="uploadedFiles.length || errorFiles.length"
      >
        <div
          v-for="file in [...uploadedFiles, ...errorFiles]"
          :key="file.id"
          class="col-6 col-sm-4 col-md-3 col-lg-2"
        >
          <div
            class="preview-card"
            :class="{ 'preview-card--error': file.status === 'error' }"
          >
            <div class="preview-thumb">
              <video
                v-if="file.isVideo"
                :src="file.preview"
                muted
                playsinline
                preload="metadata"
                class="preview-video"
              />
              <img v-else :src="file.preview" :alt="file.name" loading="lazy" />
              <div class="preview-overlay">
                <span v-if="file.isVideo" class="badge-video" aria-label="video"
                  >▶</span
                >
                <span v-if="file.status === 'done'" class="badge-done">✓</span>
                <span
                  v-else-if="file.status === 'error'"
                  class="badge-err"
                  :title="file.error"
                  >✕</span
                >
                <span v-else class="badge-pending">…</span>
              </div>
            </div>
            <p class="preview-name">{{ truncate(file.name) }}</p>
          </div>
        </div>
      </transition-group>

      <!-- Upload error notice -->
      <div v-if="uploadError" class="auth-notice mt-4">
        <p>⚠️ {{ uploadError }}</p>
      </div>
    </main>

    <!-- Footer -->
    <footer class="wedding-footer text-center">
      <p>
        Cu drag, {{ config.bride }} &amp; {{ config.groom }} · {{ config.date }}
      </p>
      <p class="powered-by">
        Powered by
        <a
          href="https://www.instagram.com/vasilesgo/"
          target="_blank"
          rel="noopener noreferrer"
          >vasilesgo</a
        >
        și cumătrul Claudiu
      </p>
    </footer>
  </div>
</template>

<script>
import cupluImg from "@/assets/za-cuplu.png";
import HeartImage from "@/components/HeartImage.vue";
import Spinner from "@/components/Spinner.vue";

// ─── CONFIGURARE ─────────────────────────────────────────────────────────────
const CONFIG = {
  bride: "Andreea",
  groom: "Daniel",
  date: "30 august 2026",
  tagline: "Împărtășiți momentele voastre cu noi ✦",
};

const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB — mai robust pe conexiuni slabe
const MAX_RETRIES = 8;
const CONCURRENCY = 2; // cate fisiere se incarca in paralel
const STORAGE_PREFIX = "wedding-upload:";
const SESSION_MAX_AGE_MS = 6 * 24 * 60 * 60 * 1000; // sesiunile Google expira ~7 zile
// ─────────────────────────────────────────────────────────────────────────────

export default {
  name: "WeddingUpload",
  components: { HeartImage, Spinner },

  data() {
    return {
      config: CONFIG,
      cupluImg,
      isDragging: false,
      isUploading: false,
      uploadError: null,
      queue: [], // toate fisierele din sesiunea curenta, fiecare cu status + progress propriu
      showSummary: false,
      wakeLock: null,
      // ── ETA tracking ──
      totalBytes: 0, // suma marimilor tuturor fisierelor din coada
      bytesUploaded: 0, // bytes confirmati trimisi
      etaSeconds: null, // secunde estimate ramase
      speedSample: { time: 0, bytes: 0 }, // pentru calculul vitezei medii recente
    };
  },

  computed: {
    uploadedFiles() {
      return this.queue.filter((f) => f.status === "done");
    },
    errorFiles() {
      return this.queue.filter((f) => f.status === "error");
    },
    overallProgress() {
      if (!this.queue.length) return 0;
      const total = this.queue.reduce((sum, f) => sum + (f.progress || 0), 0);
      return total / this.queue.length;
    },
    doneCount() {
      return this.uploadedFiles.length + this.errorFiles.length;
    },
    etaText() {
      if (this.etaSeconds == null || this.etaSeconds <= 0) return null;
      const s = Math.round(this.etaSeconds);
      if (s < 60) return `~${s} sec. rămase`;
      const m = Math.floor(s / 60);
      const rem = s % 60;
      if (m < 60) {
        return rem > 0 ? `~${m} min ${rem} sec. rămase` : `~${m} min rămase`;
      }
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `~${h}h ${remM}min rămase`;
    },
  },

  mounted() {
    this.purgeExpiredSessions();
  },

  beforeUnmount() {
    this.releaseWakeLock();
  },

  methods: {
    // ── File handling ─────────────────────────────────────────────────────────
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    onDrop(e) {
      this.isDragging = false;
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
      );
      this.processFiles(files);
    },

    onFileSelect(e) {
      const files = Array.from(e.target.files);
      this.processFiles(files);
      e.target.value = "";
    },

    processFiles(files) {
      this.uploadError = null;
      const valid = files.filter(
        (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
      );
      if (!valid.length) return;

      const newItems = valid.map((f) => ({
        file: f,
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        // nume tehnic unic trimis la Drive, ca sa evitam coliziuni intre invitati
        driveName: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${f.name}`,
        name: f.name,
        isVideo: f.type.startsWith("video/"),
        preview: URL.createObjectURL(f),
        status: "pending",
        progress: 0,
        error: null,
      }));

      // poze intai (feedback rapid), apoi video-uri de la mic la mare
      newItems.sort((a, b) => {
        if (a.isVideo !== b.isVideo) return a.isVideo ? 1 : -1;
        return a.file.size - b.file.size;
      });

      this.queue.push(...newItems);
      this.startUploadQueue();
    },

    // ── Coadă cu concurență limitată ───────────────────────────────────────────
    async startUploadQueue() {
      if (this.isUploading) return; // deja ruleaza, fisierele noi se alatura cozii
      this.isUploading = true;

      // init ETA tracking pe intreaga coada ramasa
      this.totalBytes = this.queue
        .filter((f) => f.status === "pending" || f.status === "uploading")
        .reduce((sum, f) => sum + f.file.size, 0);
      this.bytesUploaded = 0;
      this.etaSeconds = null;
      this.speedSample = { time: Date.now(), bytes: 0 };

      await this.requestWakeLock();

      const workers = Array.from({ length: CONCURRENCY }, () =>
        this.runWorker(),
      );
      await Promise.all(workers);

      await this.releaseWakeLock();
      this.isUploading = false;
      this.etaSeconds = null;
      this.showSummary = this.uploadedFiles.length > 0;
    },

    async runWorker() {
      while (true) {
        const item = this.queue.find((f) => f.status === "pending");
        if (!item) return;
        item.status = "uploading";
        try {
          await this.uploadFile(item);
          item.status = "done";
          item.progress = 100;
          this.clearStoredSession(item);
        } catch (err) {
          item.status = "error";
          item.error = err.message;
        }
      }
    },

    // ── Wake Lock: incearca sa previna stingerea ecranului cat timp se incarca ─
    async requestWakeLock() {
      try {
        if ("wakeLock" in navigator) {
          this.wakeLock = await navigator.wakeLock.request("screen");
          document.addEventListener("visibilitychange", this.reacquireWakeLock);
        }
      } catch (e) {
        this.wakeLock = null; // nesuportat/refuzat - continuam fara el
      }
    },

    async reacquireWakeLock() {
      if (
        document.visibilityState === "visible" &&
        this.isUploading &&
        !this.wakeLock
      ) {
        try {
          this.wakeLock = await navigator.wakeLock.request("screen");
        } catch (e) {
          // ignorat
        }
      }
    },

    async releaseWakeLock() {
      document.removeEventListener("visibilitychange", this.reacquireWakeLock);
      if (this.wakeLock) {
        try {
          await this.wakeLock.release();
        } catch (e) {
          // ignorat
        }
        this.wakeLock = null;
      }
    },

    // ── Persistare sesiune (reluare dupa refresh/inchidere tab) ─────────────────
    storageKey(item) {
      // cheie stabila din identitatea fisierului, NU din driveName (care e mereu nou)
      return `${STORAGE_PREFIX}${item.file.name}::${item.file.size}::${item.file.lastModified}`;
    },

    saveSession(item, uploadUrl) {
      try {
        localStorage.setItem(
          this.storageKey(item),
          JSON.stringify({ uploadUrl, savedAt: Date.now() }),
        );
      } catch (e) {
        // localStorage plin sau indisponibil (mod privat) - nu e fatal
      }
    },

    loadSession(item) {
      try {
        const raw = localStorage.getItem(this.storageKey(item));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.savedAt > SESSION_MAX_AGE_MS) {
          localStorage.removeItem(this.storageKey(item));
          return null; // probabil expirata pe Google
        }
        return parsed;
      } catch (e) {
        return null;
      }
    },

    clearStoredSession(item) {
      try {
        localStorage.removeItem(this.storageKey(item));
      } catch (e) {
        // ignorat
      }
    },

    purgeExpiredSessions() {
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith(STORAGE_PREFIX))
          .forEach((k) => {
            try {
              const parsed = JSON.parse(localStorage.getItem(k));
              if (Date.now() - parsed.savedAt > SESSION_MAX_AGE_MS) {
                localStorage.removeItem(k);
              }
            } catch (e) {
              localStorage.removeItem(k); // intrare corupta
            }
          });
      } catch (e) {
        // ignorat
      }
    },

    // ── Initiere sesiune cu retry — plasa de siguranta la varf de trafic ───────
    // Cand multi invitati pornesc simultan, Google poate throttla (429/403).
    // Reincercam automat cu backoff in loc sa aratam eroare invitatului.
    async createSessionWithRetry(item, mimeType, size) {
      let attempt = 0;
      while (true) {
        try {
          const sessionRes = await fetch("/api/upload-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: item.driveName,
              mimeType,
              size,
            }),
          });

          if (sessionRes.ok) {
            const { uploadUrl } = await sessionRes.json();
            if (!uploadUrl) throw new Error("Lipsește URL-ul de sesiune");
            return uploadUrl;
          }

          // 429/403/5xx = temporar, merita reincercat. 4xx (ex. 400) = definitiv.
          const retryable =
            sessionRes.status === 429 ||
            sessionRes.status === 403 ||
            sessionRes.status >= 500;
          if (!retryable) {
            const err = await sessionRes.json().catch(() => ({}));
            throw new Error(err.error || "Nu am putut porni upload-ul");
          }
          throw new Error(`retryable HTTP ${sessionRes.status}`);
        } catch (e) {
          attempt++;
          if (attempt > MAX_RETRIES) {
            throw new Error(
              "Serverul e ocupat momentan. Încearcă din nou în câteva secunde ✦",
            );
          }
          // backoff exponential cu jitter, ca sa nu reincerce toti in aceeasi clipa
          const backoff =
            Math.min(1000 * 2 ** attempt, 15000) + Math.random() * 500;
          await new Promise((r) => setTimeout(r, backoff));
        }
      }
    },

    // ── Upload-ul propriu-zis: sesiune + chunk-uri + reluare ────────────────────
    async uploadFile(item) {
      const file = item.file;
      const mimeType = file.type || "application/octet-stream";

      let uploadUrl;
      let offset = 0;
      const existing = this.loadSession(item);

      if (existing) {
        // exista o sesiune neterminata (tab inchis/refresh) - intrebam Google unde a ramas
        uploadUrl = existing.uploadUrl;
        offset = await this.queryUploadOffset(uploadUrl, file.size);
        if (offset >= file.size) {
          item.progress = 100;
          this.clearStoredSession(item);
          return; // era deja complet
        }
        // bytes deja pe Google nu se numara in viteza sesiunii curente
        item.progress = (offset / file.size) * 100;
      } else {
        uploadUrl = await this.createSessionWithRetry(
          item,
          mimeType,
          file.size,
        );
        this.saveSession(item, uploadUrl);
      }

      let attempt = 0;

      while (offset < file.size) {
        const end = Math.min(offset + CHUNK_SIZE, file.size);
        const chunk = file.slice(offset, end);

        try {
          const result = await this.putChunk(
            uploadUrl,
            chunk,
            offset,
            end,
            file.size,
            mimeType,
          );
          attempt = 0; // reset dupa succes
          const advanced = (result.nextOffset ?? file.size) - offset;
          if (advanced > 0) {
            this.bytesUploaded += advanced;
            this.updateEta();
          }
          if (result.done) {
            item.progress = 100;
            this.clearStoredSession(item);
            return;
          }
          offset = result.nextOffset;
          item.progress = (offset / file.size) * 100;
        } catch (e) {
          attempt++;
          if (attempt > MAX_RETRIES) {
            throw new Error(
              "Upload eșuat după mai multe încercări. Poți încerca din nou — reia automat de unde a rămas.",
            );
          }
          offset = await this.queryUploadOffset(uploadUrl, file.size);
          const backoff = Math.min(1000 * 2 ** attempt, 30000); // exponential, plafon 30s
          await new Promise((r) => setTimeout(r, backoff));
        }
      }
    },

    // ── Estimare timp ramas ─────────────────────────────────────────────────
    // Foloseste viteza medie recenta (nu cea instantanee, ca sa fie stabila)
    updateEta() {
      const now = Date.now();
      const elapsed = (now - this.speedSample.time) / 1000; // secunde de la ultima masuratoare

      // recalculam viteza doar la fiecare ~1.5s, ca sa nu sara ETA-ul haotic
      if (elapsed < 1.5) return;

      const bytesDelta = this.bytesUploaded - this.speedSample.bytes;
      const speed = bytesDelta / elapsed; // bytes/secunda

      if (speed > 0) {
        const remaining = this.totalBytes - this.bytesUploaded;
        const rawEta = remaining / speed;
        // netezire: media intre estimarea veche si cea noua, evita salturile
        this.etaSeconds =
          this.etaSeconds == null
            ? rawEta
            : this.etaSeconds * 0.5 + rawEta * 0.5;
      }

      this.speedSample = { time: now, bytes: this.bytesUploaded };
    },

    putChunk(uploadUrl, chunk, start, end, totalSize, mimeType) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", mimeType);
        xhr.setRequestHeader(
          "Content-Range",
          `bytes ${start}-${end - 1}/${totalSize}`,
        );

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            resolve({ done: true });
          } else if (xhr.status === 308) {
            const range = xhr.getResponseHeader("Range");
            const nextOffset = range
              ? parseInt(range.split("-")[1], 10) + 1
              : end;
            resolve({ done: false, nextOffset });
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Eroare de rețea"));
        xhr.send(chunk);
      });
    },

    queryUploadOffset(uploadUrl, totalSize) {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Range", `bytes */${totalSize}`);
        xhr.onload = () => {
          if (xhr.status === 308) {
            const range = xhr.getResponseHeader("Range");
            resolve(range ? parseInt(range.split("-")[1], 10) + 1 : 0);
          } else if (xhr.status === 200 || xhr.status === 201) {
            resolve(totalSize);
          } else {
            resolve(0);
          }
        };
        xhr.onerror = () => resolve(0);
        xhr.send();
      });
    },

    // ── Helpers ───────────────────────────────────────────────────────────────
    truncate(name, max = 14) {
      if (name.length <= max) return name;
      const ext = name.lastIndexOf(".");
      if (ext > 0) return name.slice(0, max - 4) + "…" + name.slice(ext);
      return name.slice(0, max) + "…";
    },

    particleStyle(n) {
      const angle = (n / 18) * 360;
      const r = 38 + ((n * 17) % 22);
      const size = 0.55 + ((n * 7) % 10) / 20;
      const delay = ((n * 1.3) % 6).toFixed(1);
      const dur = (8 + ((n * 3) % 6)).toFixed(1);
      return {
        left: `${50 + r * Math.cos((angle * Math.PI) / 180)}%`,
        top: `${50 + r * Math.sin((angle * Math.PI) / 180)}%`,
        fontSize: `${size}rem`,
        animationDelay: `${delay}s`,
        animationDuration: `${dur}s`,
      };
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500&display=swap");

.powered-by {
  font-size: 11px;
  color: var(--muted);
  margin-top: 0.5rem;
}
.powered-by a {
  color: var(--gold);
  text-decoration: none;
  font-weight: 500;
}

:root {
  --gold: #e8c97a;
  --gold-dark: #c9a84c;
  --night: #1a1a2e;
  --card: #23233d;
  --card-hi: #2d2d50;
  --cream: #f5f0e8;
  --muted: #9e9bb0;
  --err: #e07070;
  --radius: 14px;
}

.wedding-app {
  min-height: 100vh;
  background: var(--night);
  color: var(--cream);
  font-family: "Inter", sans-serif;
  font-weight: 300;
  position: relative;
  overflow-x: hidden;
}

.particles {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.particle {
  position: absolute;
  color: var(--gold);
  opacity: 0.18;
  animation: float linear infinite;
  font-size: 0.7rem;
}
@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.12;
  }
  50% {
    opacity: 0.28;
  }
  100% {
    transform: translateY(-40px) rotate(180deg);
    opacity: 0.12;
  }
}

.hero {
  padding: 5rem 1rem 3.5rem;
  position: relative;
  z-index: 1;
}
.rings-wrapper {
  margin: 0 auto 1.8rem;
  width: 100px;
  animation: rings-pulse 4s ease-in-out infinite;
}
.rings-svg {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 0 8px rgba(232, 201, 122, 0.35));
}
@keyframes rings-pulse {
  0%,
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(232, 201, 122, 0.3));
  }
  50% {
    transform: scale(1.04);
    filter: drop-shadow(0 0 16px rgba(232, 201, 122, 0.55));
  }
}
.eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 0.6rem;
}
.couple-names {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(2.8rem, 8vw, 5.5rem);
  font-weight: 300;
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: var(--cream);
  margin-bottom: 0.5rem;
}
.amp {
  font-style: italic;
  color: var(--gold);
  margin: 0 0.3em;
}
.tagline {
  color: var(--muted);
  font-size: 0.95rem;
  letter-spacing: 0.05em;
}

.upload-section {
  position: relative;
  z-index: 1;
  max-width: 820px;
  padding-bottom: 4rem;
}

.drop-zone {
  border: 2px dashed rgba(232, 201, 122, 0.3);
  border-radius: var(--radius);
  background: var(--card);
  padding: 3.5rem 2rem;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.25s,
    background 0.25s,
    transform 0.15s;
  outline: none;
}
.drop-zone:hover,
.drop-zone:focus-visible {
  border-color: var(--gold);
  background: var(--card-hi);
}
.drop-zone--active {
  border-color: var(--gold);
  background: var(--card-hi);
  transform: scale(1.012);
}
.drop-zone--uploading {
  cursor: default;
  pointer-events: none;
}
.drop-zone--done {
  border-color: rgba(232, 201, 122, 0.55);
  border-style: solid;
}

.drop-zone__idle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.drop-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto;
  color: var(--gold);
  opacity: 0.75;
}
.drop-icon svg {
  width: 100%;
  height: 100%;
}
.success-icon {
  font-size: 2.5rem;
  margin-bottom: 0.25rem;
}
.drop-zone__title {
  font-size: 1rem;
  color: var(--cream);
  margin: 0;
}
.drop-zone__sub {
  font-size: 0.9rem;
  color: var(--muted);
  margin: 0;
}
.drop-zone__hint {
  font-size: 0.78rem;
  color: var(--muted);
  opacity: 0.7;
  margin: 0;
}
.text-gold {
  color: var(--gold);
  text-decoration: underline;
}

.drop-zone__uploading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.uploading-label {
  font-size: 0.9rem;
  color: var(--muted);
}
.eta-label {
  font-size: 0.8rem;
  color: var(--gold);
  opacity: 0.85;
  margin: 0;
  letter-spacing: 0.02em;
}
.progress-track {
  width: 100%;
  max-width: 320px;
  height: 4px;
  background: rgba(232, 201, 122, 0.15);
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold-dark), var(--gold));
  border-radius: 4px;
  transition: width 0.2s linear;
}

.preview-card {
  border-radius: 10px;
  overflow: hidden;
  background: var(--card);
}
.preview-card--error {
  opacity: 0.65;
}
.preview-thumb {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}
.preview-thumb img,
.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.preview-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 0.25rem;
  padding: 0.35rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.45), transparent 60%);
}
.badge-done {
  color: #7dde90;
  font-size: 1.1rem;
  font-weight: 500;
}
.badge-err {
  color: var(--err);
  font-size: 1.1rem;
  cursor: help;
}
.badge-pending {
  color: var(--muted);
  font-size: 1.1rem;
}
.badge-video {
  color: var(--gold);
  font-size: 0.85rem;
  margin-right: auto;
  opacity: 0.9;
}
.preview-name {
  font-size: 0.7rem;
  color: var(--muted);
  padding: 0.3rem 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.auth-notice {
  background: rgba(224, 112, 112, 0.1);
  border: 1px solid rgba(224, 112, 112, 0.3);
  border-radius: var(--radius);
  padding: 1rem 1.5rem;
  text-align: center;
  color: var(--err);
  font-size: 0.9rem;
}

.wedding-footer {
  position: relative;
  z-index: 1;
  padding: 2rem 1rem;
  border-top: 1px solid rgba(232, 201, 122, 0.1);
  color: var(--muted);
  font-size: 0.8rem;
  letter-spacing: 0.06em;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
.slide-up-enter-active {
  transition:
    opacity 0.4s,
    transform 0.4s;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 576px) {
  .hero {
    padding: 1.5rem 1rem 0;
  }
  .drop-zone {
    padding: 10px 1rem;
  }
  .drop-zone__title {
    font-size: 1.15rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .particle,
  .rings-wrapper {
    animation: none;
  }
  .drop-zone {
    transition: none;
  }
}
</style>
