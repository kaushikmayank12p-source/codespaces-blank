// ==========================================
// CONFIGURATION & DOM REFERENCES
// ==========================================
const CONFIG = {
  API_BASE_URL: 'https://api.nasa.gov/planetary/apod',
  API_KEY_STORAGE_KEY: 'daily-space-explorer:nasa-api-key',
  DEMO_API_KEY: 'DEMO_KEY',
  REQUEST_TIMEOUT_MS: 15000
};

const DOM = {
  datePicker: document.getElementById('date-picker'),
  fetchBtn: document.getElementById('fetch-btn'),
  loader: document.getElementById('loader'),
  mediaContainer: document.getElementById('media-container'),
  mediaTitle: document.getElementById('media-title'),
  mediaDate: document.getElementById('media-date'),
  mediaExplanation: document.getElementById('media-explanation')
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getApiKey() {
  try {
    return localStorage.getItem(CONFIG.API_KEY_STORAGE_KEY) || CONFIG.DEMO_API_KEY;
  } catch (error) {
    return CONFIG.DEMO_API_KEY;
  }
}

function clearUI() {
  DOM.mediaContainer.innerHTML = '';
  DOM.mediaTitle.textContent = '';
  DOM.mediaDate.textContent = '';
  DOM.mediaExplanation.textContent = '';
}

function toggleLoadingState(isLoading) {
  if (isLoading) {
    DOM.loader.classList.remove('hidden');
    DOM.fetchBtn.disabled = true;
  } else {
    DOM.loader.classList.add('hidden');
    DOM.fetchBtn.disabled = false;
  }
}

// ==========================================
// CORE MEDIA RENDERING LOGIC
// ==========================================
function renderImage(data) {
  const img = document.createElement('img');
  img.src = data.url;
  img.alt = data.title || 'NASA APOD space asset';
  img.loading = 'eager';
  img.className = 'media-frame img'; // Added explicit styling hooks

  // Seamlessly transition to HD image upon load completion
  if (data.hdurl && data.hdurl !== data.url) {
    img.addEventListener('load', () => {
      if (img.naturalWidth > 0 && img.src === data.url) {
        img.src = data.hdurl;
      }
    }, { once: true });
  }

  // Gracefully catch image asset loading errors
  img.addEventListener('error', () => {
    if (img.src !== data.url) {
      img.src = data.url;
      return;
    }
    DOM.mediaTitle.textContent = 'Mission Error';
    DOM.mediaExplanation.textContent = 'The specified space image failed to load. Please verify your connection or select another date.';
  });

  DOM.mediaContainer.appendChild(img);
}

function renderVideo(data) {
  const iframe = document.createElement('iframe');
  iframe.src = data.url;
  iframe.title = data.title || 'NASA APOD video feature';
  iframe.className = 'media-frame iframe'; // Added explicit styling hooks
  iframe.loading = 'lazy';
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  
  DOM.mediaContainer.appendChild(iframe);
}

// ==========================================
// API CLIENT IMPLEMENTATION
// ==========================================
async function fetchAPOD(date = '') {
  toggleLoadingState(true);
  clearUI();

  const selectedDate = date || today;
  const targetUrl = new URL(CONFIG.API_BASE_URL);
  targetUrl.searchParams.set('api_key', getApiKey());
  targetUrl.searchParams.set('date', selectedDate);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(targetUrl, { signal: controller.signal });
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('NASA demo access is rate-limited. Add a personal NASA API key for reliable access.');
      }
      if (response.status === 403) {
        throw new Error('NASA rejected this API key. Add a valid personal NASA API key and try again.');
      }
      throw new Error(`NASA returned an error status (${response.status}).`);
    }

    const payload = await response.json();

    // Direct content type resolution
    if (payload.media_type === 'image' && payload.url) {
      renderImage(payload);
    } else if (payload.media_type === 'video' && payload.url) {
      renderVideo(payload);
    } else {
      throw new Error('Unsupported asset media type encountered.');
    }

    // Populate textual payload parameters safely using optional chaining
    DOM.mediaTitle.textContent = payload?.title || 'Untitled Space Discovery';
    DOM.mediaDate.textContent = `Captured: ${payload?.date || selectedDate}`;
    DOM.mediaExplanation.textContent = payload?.explanation || 'No descriptive context provided for this discovery.';

  } catch (error) {
    console.error('APOD client interaction failed:', error);
    DOM.mediaTitle.textContent = 'Mission Error';
    
    if (error.name === 'AbortError') {
      DOM.mediaExplanation.textContent = 'NASA service response window timed out. Check connectivity metrics and retry.';
    } else if (error instanceof TypeError) {
      DOM.mediaExplanation.textContent = 'Network transport layers blocked. Ensure standard access loops target http://localhost:8000.';
    } else {
      DOM.mediaExplanation.textContent = error.message || 'Unable to download asset content arrays from the NASA endpoint.';
    }
  } finally {
    clearTimeout(timeoutId);
    toggleLoadingState(false);
  }
}

// ==========================================
// APPLICATION LIFECYCLE INITIALIZATION
// ==========================================
const today = getLocalDateString();
DOM.datePicker.max = today;
DOM.datePicker.value = today;

DOM.fetchBtn.addEventListener('click', () => {
  if (DOM.datePicker.value) fetchAPOD(DOM.datePicker.value);
});

DOM.datePicker.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && DOM.datePicker.value) {
    fetchAPOD(DOM.datePicker.value);
  }
});

// Run client runtime lifecycle loop on window readiness
fetchAPOD();

