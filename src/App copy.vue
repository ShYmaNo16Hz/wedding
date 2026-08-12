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

    <!-- Upload zone -->
    <main class="container upload-section">
      <div
        class="drop-zone"
        :class="{
          'drop-zone--active': isDragging,
          'drop-zone--uploading': isUploading,
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
          accept="image/*"
          class="visually-hidden"
          @change="onFileSelect"
          aria-hidden="true"
        />

        <div v-if="!isUploading" class="drop-zone__idle">
          <div class="drop-icon">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="8"
                y="14"
                width="48"
                height="36"
                rx="4"
                stroke="currentColor"
                stroke-width="2"
              />
              <circle
                cx="22"
                cy="26"
                r="5"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M8 38 L20 26 L32 36 L44 24 L56 36"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <p class="drop-zone__title">Trage fotografiile aici</p>
          <p class="drop-zone__sub">
            sau <span class="text-gold">alege din galerie</span>
          </p>
          <p class="drop-zone__hint">
            JPEG, PNG, HEIC · max {{ config.maxSizeMB }} MB / fișier
          </p>
        </div>

        <div v-else class="drop-zone__uploading">
          <div class="upload-spinner" aria-hidden="true"></div>
          <p class="uploading-label">
            Se încarcă {{ currentUploadIndex }} din {{ pendingFiles.length }}…
          </p>
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: overallProgress + '%' }"
            ></div>
          </div>
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
              <img :src="file.preview" :alt="file.name" loading="lazy" />
              <div class="preview-overlay">
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

      <!-- Summary banner -->
      <transition name="slide-up">
        <div v-if="showSummary" class="summary-banner mt-5">
          <div class="summary-inner">
            <span class="summary-icon">🥂</span>
            <div>
              <p class="summary-title">Mulțumim!</p>
              <p class="summary-sub">
                {{ uploadedFiles.length }}
                {{ uploadedFiles.length === 1 ? "fotografie" : "fotografii" }}
                adăugate în albumul nostru
              </p>
            </div>
            <button
              class="btn-reset"
              @click="resetAll"
              aria-label="Încarcă alte fotografii"
            >
              + Adaugă mai multe
            </button>
          </div>
        </div>
      </transition>

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
    </footer>
  </div>
</template>

<script>
// ─── CONFIGURARE ─────────────────────────────────────────────────────────────
const CONFIG = {
  bride: "Andreea",
  groom: "Daniel",
  date: "30 august 2026",
  tagline: "Împărtășiți momentele voastre cu noi ✦",
  maxSizeMB: 25,
  appsScriptUrl:
    "https://script.google.com/macros/s/AKfycbyFbzFoBmIzqP_O24fcfZJdMp45hMcgs-VaX7jf48bXRUooaHJCfRwhAhJHN4Ew3Dtr/exec",
};
// ─────────────────────────────────────────────────────────────────────────────

export default {
  name: "WeddingUpload",

  data() {
    return {
      config: CONFIG,
      isDragging: false,
      isUploading: false,
      uploadError: null,
      pendingFiles: [],
      uploadedFiles: [],
      errorFiles: [],
      currentUploadIndex: 0,
      currentFileProgress: 0,
      showSummary: false,
    };
  },

  computed: {
    overallProgress() {
      const done = this.currentUploadIndex - 1;
      const total = this.pendingFiles.length;
      if (total === 0) return 0;
      const base = (done / total) * 100;
      const current = this.currentFileProgress / total;
      return Math.min(base + current, 100);
    },
  },

  methods: {
    // ── File handling ─────────────────────────────────────────────────────────
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    onDrop(e) {
      this.isDragging = false;
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/"),
      );
      this.processFiles(files);
    },

    onFileSelect(e) {
      const files = Array.from(e.target.files);
      this.processFiles(files);
      e.target.value = "";
    },

    processFiles(files) {
      const maxBytes = CONFIG.maxSizeMB * 1024 * 1024;
      this.showSummary = false;
      this.uploadError = null;

      const valid = files.filter((f) => {
        if (f.size > maxBytes) {
          this.errorFiles.push({
            id: Date.now() + Math.random(),
            name: f.name,
            preview: URL.createObjectURL(f),
            status: "error",
            error: `Fișier prea mare (max ${CONFIG.maxSizeMB} MB)`,
          });
          return false;
        }
        return true;
      });

      if (!valid.length) return;

      this.pendingFiles = valid.map((f) => ({
        file: f,
        id: Date.now() + Math.random(),
        name: f.name,
        preview: URL.createObjectURL(f),
        status: "pending",
      }));

      this.startUploadQueue();
    },

    // ── Upload queue ──────────────────────────────────────────────────────────
    async startUploadQueue() {
      this.isUploading = true;
      this.currentUploadIndex = 0;

      for (let i = 0; i < this.pendingFiles.length; i++) {
        this.currentUploadIndex = i + 1;
        this.currentFileProgress = 0;
        const item = this.pendingFiles[i];
        try {
          await this.uploadViaAppsScript(item);
          this.uploadedFiles.push({ ...item, status: "done" });
        } catch (err) {
          this.errorFiles.push({
            ...item,
            status: "error",
            error: err.message,
          });
        }
      }

      this.isUploading = false;
      this.pendingFiles = [];
      this.showSummary = this.uploadedFiles.length > 0;
    },

    // ── Upload via Google Apps Script (fără login invitat) ────────────────────
    uploadViaAppsScript(item) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            this.currentFileProgress = (e.loaded / e.total) * 50;
          }
        };

        reader.onload = async () => {
          try {
            const base64 = reader.result.split(",")[1];
            this.currentFileProgress = 50;

            // Trimitem ca text/plain — nu declanșează preflight OPTIONS
            // Apps Script răspunde cu CORS headers corecte pentru acest tip
            const response = await fetch(CONFIG.appsScriptUrl, {
              method: "POST",
              headers: { "Content-Type": "text/plain" },
              body: JSON.stringify({
                name: item.name,
                mimeType: item.file.type || "image/jpeg",
                file: base64,
              }),
            });

            this.currentFileProgress = 100;

            // Apps Script face redirect 302 → urmărim redirect-ul automat
            // răspunsul final poate fi opac dacă nu sunt CORS headers — verificăm doar status
            if (!response.ok && response.status !== 0) {
              throw new Error(`HTTP ${response.status}`);
            }

            // Dacă am ajuns aici, upload-ul a reușit
            // (status 0 = răspuns opac din no-cors, tot înseamnă că a ajuns la server)
            resolve();
          } catch (err) {
            reject(err);
          }
        };

        reader.onerror = () => reject(new Error("Nu s-a putut citi fișierul"));
        reader.readAsDataURL(item.file);
      });
    },

    // ── Helpers ───────────────────────────────────────────────────────────────
    resetAll() {
      this.uploadedFiles = [];
      this.errorFiles = [];
      this.pendingFiles = [];
      this.showSummary = false;
      this.uploadError = null;
    },

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
/* ── Fonts ── */
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500&display=swap");

/* ── Tokens ── */
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

/* ── Base ── */
.wedding-app {
  min-height: 100vh;
  background: var(--night);
  color: var(--cream);
  font-family: "Inter", sans-serif;
  font-weight: 300;
  position: relative;
  overflow-x: hidden;
}

/* ── Particles ── */
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

/* ── Hero ── */
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

/* ── Upload section ── */
.upload-section {
  position: relative;
  z-index: 1;
  max-width: 820px;
  padding-bottom: 4rem;
}

/* ── Drop zone ── */
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

/* idle state */
.drop-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 1.2rem;
  color: var(--gold);
  opacity: 0.75;
}
.drop-icon svg {
  width: 100%;
  height: 100%;
}
.drop-zone__title {
  font-size: 1.15rem;
  color: var(--cream);
  margin-bottom: 0.25rem;
}
.drop-zone__sub {
  font-size: 0.9rem;
  color: var(--muted);
  margin-bottom: 0.5rem;
}
.drop-zone__hint {
  font-size: 0.78rem;
  color: var(--muted);
  opacity: 0.7;
}
.text-gold {
  color: var(--gold);
  text-decoration: underline;
}

/* uploading state */
.drop-zone__uploading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.upload-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(232, 201, 122, 0.2);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.uploading-label {
  font-size: 0.9rem;
  color: var(--muted);
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

/* ── Preview grid ── */
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
.preview-thumb img {
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
.preview-name {
  font-size: 0.7rem;
  color: var(--muted);
  padding: 0.3rem 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Summary banner ── */
.summary-banner {
  background: linear-gradient(135deg, var(--card-hi), #2a2a40);
  border: 1px solid rgba(232, 201, 122, 0.2);
  border-radius: var(--radius);
  padding: 1.5rem 2rem;
}
.summary-inner {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
}
.summary-icon {
  font-size: 2rem;
}
.summary-title {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.4rem;
  color: var(--gold);
  margin: 0;
}
.summary-sub {
  font-size: 0.85rem;
  color: var(--muted);
  margin: 0.1rem 0 0;
}
.btn-reset {
  margin-left: auto;
  background: transparent;
  border: 1px solid var(--gold);
  color: var(--gold);
  border-radius: 8px;
  padding: 0.5rem 1.1rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}
.btn-reset:hover {
  background: var(--gold);
  color: var(--night);
}

/* ── Error notice ── */
.auth-notice {
  background: rgba(224, 112, 112, 0.1);
  border: 1px solid rgba(224, 112, 112, 0.3);
  border-radius: var(--radius);
  padding: 1rem 1.5rem;
  text-align: center;
  color: var(--err);
  font-size: 0.9rem;
}

/* ── Footer ── */
.wedding-footer {
  position: relative;
  z-index: 1;
  padding: 2rem 1rem;
  border-top: 1px solid rgba(232, 201, 122, 0.1);
  color: var(--muted);
  font-size: 0.8rem;
  letter-spacing: 0.06em;
}

/* ── Transitions ── */
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

/* ── Responsive ── */
@media (max-width: 576px) {
  .hero {
    padding: 3.5rem 1rem 2.5rem;
  }
  .drop-zone {
    padding: 2.5rem 1rem;
  }
  .summary-inner {
    flex-direction: column;
    text-align: center;
  }
  .btn-reset {
    margin: 0.5rem auto 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .particle,
  .rings-wrapper,
  .upload-spinner {
    animation: none;
  }
  .drop-zone {
    transition: none;
  }
}
</style>
