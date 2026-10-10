/**
 * Accretion - Firebase Authentication & Cloud Save Synchronization
 * Runs completely in the browser via Firebase CDN modules.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// === INSERT YOUR FIREBASE CONFIG HERE ===
const firebaseConfig = window.ACCRETION_FIREBASE_CONFIG || {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

let currentUser = null;
let currentProfile = null;
let pendingGoogleUser = null;

// --- INITIALIZE UI ---
function injectAuthUI() {
  // Top Status Pill
  const pill = document.createElement("div");
  pill.id = "accretion-auth-pill";
  pill.className = "accretion-user-pill";
  document.body.appendChild(pill);
  updateUserPill();

  // Auth Modal Backdrop & Window
  const overlay = document.createElement("div");
  overlay.id = "accretion-auth-overlay";
  overlay.className = "accretion-auth-backdrop";
  overlay.style.display = "none"; // Controlled by auth state listener

  overlay.innerHTML = `
    <div class="accretion-auth-modal">
      <div class="auth-header">
        <h2 class="auth-title">Orbital Command</h2>
        <div class="auth-subtitle">Pilot Console Authentication</div>
      </div>

      <div class="auth-tabs" id="authTabs">
        <button type="button" class="auth-tab-btn active" data-tab="login">Sign In</button>
        <button type="button" class="auth-tab-btn" data-tab="register">Sign Up</button>
      </div>

      <!-- EMAIL LOGIN FORM -->
      <form id="loginForm">
        <div class="auth-form-group">
          <label>Pilot Identifier (Email)</label>
          <input type="email" id="loginEmail" required autocomplete="email" placeholder="commander@orbit.io" />
        </div>
        <div class="auth-form-group">
          <label>Security Key</label>
          <input type="password" id="loginPassword" required autocomplete="current-password" placeholder="••••••••" />
        </div>
        <button type="submit" class="auth-primary-btn">Engage Console</button>
      </form>

      <!-- EMAIL REGISTRATION FORM -->
      <form id="registerForm" style="display: none;">
        <div class="auth-form-group">
          <label>Pilot Identifier (Email)</label>
          <input type="email" id="regEmail" required autocomplete="email" placeholder="commander@orbit.io" />
        </div>
        <div class="auth-form-group">
          <label>Pilot Age (Required)</label>
          <input type="number" id="regAge" min="1" max="125" required placeholder="e.g. 18" />
        </div>
        <div class="auth-form-group">
          <label>Set Security Key</label>
          <input type="password" id="regPassword" required minlength="6" placeholder="Min. 6 characters" />
        </div>
        <button type="submit" class="auth-primary-btn">Initialize Pilot Record</button>
      </form>

      <!-- GOOGLE AGE CONFIRMATION FORM -->
      <form id="googleAgeForm" style="display: none;">
        <div class="auth-form-group">
          <label>Confirm Pilot Age to Finalize Record</label>
          <input type="number" id="googleAge" min="1" max="125" required placeholder="Enter age" />
        </div>
        <button type="submit" class="auth-primary-btn">Complete Registration</button>
      </form>

      <div class="auth-divider">OR AUTHENTICATE WITH</div>
      
      <button type="button" class="auth-google-btn" id="googleSignInBtn">
        <svg viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        Sign In With Google
      </button>

      <button type="button" class="auth-guest-btn" id="guestBtn">Continue as Guest (Offline Storage)</button>
      <div class="auth-status-msg" id="authStatusMsg"></div>
    </div>
  `;

  document.body.appendChild(overlay);
  bindEvents();
}

function updateUserPill() {
  const pill = document.getElementById("accretion-auth-pill");
  if (!pill) return;

  if (currentUser && currentProfile) {
    pill.innerHTML = `
      <span>🛰️ ${escapeHtml(currentUser.email || "Pilot")} [Age: ${currentProfile.age}]</span>
      <button id="authCloudSyncBtn" title="Sync Save State to Cloud">Sync</button>
      <button id="authSignOutBtn">Logout</button>
    `;
    document.getElementById("authSignOutBtn")?.addEventListener("click", async () => {
      await signOut(auth);
      document.getElementById("accretion-auth-overlay").style.display = "flex";
    });
    document.getElementById("authCloudSyncBtn")?.addEventListener("click", pushCloudSave);
  } else {
    pill.innerHTML = `
      <span>🛰️ Guest Protocol</span>
      <button id="authOpenModalBtn">Sign In</button>
    `;
    document.getElementById("authOpenModalBtn")?.addEventListener("click", () => {
      document.getElementById("accretion-auth-overlay").style.display = "flex";
    });
  }
}

function setStatus(msg, isError = false) {
  const statusEl = document.getElementById("authStatusMsg");
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.className = "auth-status-msg " + (isError ? "error" : "success");
}

function bindEvents() {
  const tabs = document.querySelectorAll(".auth-tab-btn");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const googleAgeForm = document.getElementById("googleAgeForm");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.tab;
      googleAgeForm.style.display = "none";
      if (target === "login") {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
      } else {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
      }
      setStatus("");
    });
  });

  // Login submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("Authenticating...");
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus("Access Granted.", false);
      document.getElementById("accretion-auth-overlay").style.display = "none";
    } catch (err) {
      setStatus(err.message, true);
    }
  });

  // Registration submission
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("Establishing pilot record...");
    const email = document.getElementById("regEmail").value;
    const age = parseInt(document.getElementById("regAge").value, 10);
    const password = document.getElementById("regPassword").value;

    if (!age || age < 1) {
      setStatus("Valid age is required.", true);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Create user document in Firestore with age
      await setDoc(doc(db, "users", cred.user.uid), {
        email: email,
        age: age,
        createdAt: new Date().toISOString()
      }, { merge: true });

      setStatus("Pilot Record Registered.", false);
      document.getElementById("accretion-auth-overlay").style.display = "none";
      pushCloudSave();
    } catch (err) {
      setStatus(err.message, true);
    }
  });

  // Google Sign-In button
  document.getElementById("googleSignInBtn").addEventListener("click", async () => {
    setStatus("Opening Google Console...");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, "users", result.user.uid));

      if (userDoc.exists() && userDoc.data().age) {
        // User already has a profile with age
        document.getElementById("accretion-auth-overlay").style.display = "none";
        pullCloudSave();
      } else {
        // New Google user: Prompt for age
        pendingGoogleUser = result.user;
        loginForm.style.display = "none";
        registerForm.style.display = "none";
        googleAgeForm.style.display = "block";
        setStatus("Confirm your age to finalize pilot registration.", false);
      }
    } catch (err) {
      setStatus(err.message, true);
    }
  });

  // Google age confirmation submission
  googleAgeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const age = parseInt(document.getElementById("googleAge").value, 10);
    if (!pendingGoogleUser || !age || age < 1) {
      setStatus("Valid age is required.", true);
      return;
    }

    try {
      await setDoc(doc(db, "users", pendingGoogleUser.uid), {
        email: pendingGoogleUser.email,
        age: age,
        createdAt: new Date().toISOString()
      }, { merge: true });

      currentProfile = { age };
      document.getElementById("accretion-auth-overlay").style.display = "none";
      updateUserPill();
      pullCloudSave();
    } catch (err) {
      setStatus(err.message, true);
    }
  });

  // Guest button
  document.getElementById("guestBtn").addEventListener("click", () => {
    document.getElementById("accretion-auth-overlay").style.display = "none";
  });
}

// --- SAVE STATE CLOUD SYNC ---
function getLocalSaveString() {
  return localStorage.getItem("accretion_save") || 
         localStorage.getItem("AccretionSave") || 
         localStorage.getItem("accretion_game_state") || 
         null;
}

function setLocalSaveString(str) {
  if (!str) return;
  localStorage.setItem("accretion_save", str);
  localStorage.setItem("AccretionSave", str);
  localStorage.setItem("accretion_game_state", str);
}

async function pushCloudSave() {
  if (!currentUser) return;
  const saveState = getLocalSaveString();
  if (!saveState) return;

  try {
    await setDoc(doc(db, "users", currentUser.uid), {
      saveState: saveState,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log("[CloudSave] Synced to Firestore.");
  } catch (err) {
    console.warn("[CloudSave] Push failed:", err);
  }
}

async function pullCloudSave() {
  if (!currentUser) return;
  try {
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    if (userDoc.exists() && userDoc.data().saveState) {
      setLocalSaveString(userDoc.data().saveState);
      console.log("[CloudSave] Pulled from Firestore.");
    }
  } catch (err) {
    console.warn("[CloudSave] Pull failed:", err);
  }
}

// Escape strings for safe UI rendering
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (s) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[s]));
}

// Listen for Auth changes
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      currentProfile = userDoc.data();
      document.getElementById("accretion-auth-overlay").style.display = "none";
      updateUserPill();
      pullCloudSave();
    } else {
      // Missing profile document
      document.getElementById("accretion-auth-overlay").style.display = "flex";
    }
  } else {
    currentProfile = null;
    updateUserPill();
    document.getElementById("accretion-auth-overlay").style.display = "flex";
  }
});

// Periodic save push (every 60 seconds)
setInterval(() => {
  if (currentUser) pushCloudSave();
}, 60000);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectAuthUI);
} else {
  injectAuthUI();
}
