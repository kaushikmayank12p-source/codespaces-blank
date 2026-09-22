const datePicker = document.getElementById('date-picker');
const fetchBtn = document.getElementById('fetch-btn');
const loader = document.getElementById('loader');
const mediaContainer = document.getElementById('media-container');
const mediaTitle = document.getElementById('media-title');
const mediaDate = document.getElementById('media-date');
const mediaExplanation = document.getElementById('media-explanation');

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Set maximum date to today so users can't pick future dates
const today = getLocalDateString();
datePicker.max = today;
datePicker.value = today;

async function fetchAPOD(date = '') {
  loader.classList.remove('hidden');
  fetchBtn.disabled = true;
  mediaContainer.innerHTML = '';
  mediaTitle.textContent = '';
  mediaDate.textContent = '';
  mediaExplanation.textContent = '';

  const selectedDate = date || today;
  const url = new URL('https://api.nasa.gov/planetary/apod');
  url.searchParams.set('api_key', 'DEMO_KEY');
  url.searchParams.set('date', selectedDate);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to retrieve space data.');
    const data = await res.json();

    if (data.media_type === 'image' && data.url) {
      const img = document.createElement('img');
      img.src = data.url;
      img.alt = data.title || 'NASA APOD image';
      img.loading = 'eager';
      if (data.hdurl && data.hdurl !== data.url) {
        img.addEventListener('load', () => {
          if (img.naturalWidth > 0 && img.src === data.url) {
            img.src = data.hdurl;
          }
        }, { once: true });
      }
      img.addEventListener('error', () => {
        if (img.src !== data.url) {
          img.src = data.url;
          return;
        }
        mediaTitle.textContent = 'Mission Error';
        mediaExplanation.textContent = 'The NASA image could not be displayed. Please try another date or check your connection.';
      });
      mediaContainer.appendChild(img);
    } else if (data.media_type === 'video' && data.url) {
      const iframe = document.createElement('iframe');
      iframe.src = data.url;
      iframe.title = data.title || 'NASA APOD video';
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.loading = 'lazy';
      mediaContainer.appendChild(iframe);
    } else {
      throw new Error('Unsupported media type returned by the API.');
    }

    mediaTitle.textContent = data.title || 'Untitled Space Discovery';
    mediaDate.textContent = `Captured: ${data.date || selectedDate}`;
    mediaExplanation.textContent = data.explanation || 'No description provided for this space image.';
  } catch (err) {
    console.error('APOD request failed:', err);
    mediaTitle.textContent = 'Mission Error';
    mediaExplanation.textContent = err.message || 'Could not load data from NASA. Please try another date or check your connection.';
  } finally {
    loader.classList.add('hidden');
    fetchBtn.disabled = false;
  }
}

// Event listeners
fetchBtn.addEventListener('click', () => {
  if (datePicker.value) {
    fetchAPOD(datePicker.value);
  }
});

datePicker.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && datePicker.value) {
    fetchAPOD(datePicker.value);
  }
});

// Load today's photo immediately on startup
fetchAPOD();
