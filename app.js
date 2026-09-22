const datePicker = document.getElementById('date-picker');
const fetchBtn = document.getElementById('fetch-btn');
const loader = document.getElementById('loader');
const mediaContainer = document.getElementById('media-container');
const mediaTitle = document.getElementById('media-title');
const mediaDate = document.getElementById('media-date');
const mediaExplanation = document.getElementById('media-explanation');

// Set maximum date to today so users can't pick future dates
const today = new Date().toISOString().split('T')[0];
datePicker.max = today;
datePicker.value = today;hackatim
async function fetchAPOD(date = '') {
  loader.classList.remove('hidden');
  mediaContainer.innerHTML = '';
  mediaTitle.textContent = '';
  mediaDate.textContent = '';
  mediaExplanation.textContent = '';

  const queryDate = date ? `&date=${date}` : '';
  const url = `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY${queryDate}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to retrieve space data.');
    const data = await res.json();

    // Render media based on whether it is an image or YouTube/Vimeo video
    if (data.media_type === 'image') {
      const img = document.createElement('img');
      img.src = data.url;
      img.alt = data.title;
      mediaContainer.appendChild(img);
    } else if (data.media_type === 'video') {
      const iframe = document.createElement('iframe');
      iframe.src = data.url;
      iframe.setAttribute('allowfullscreen', 'true');
      mediaContainer.appendChild(iframe);
    }

    mediaTitle.textContent = data.title;
    mediaDate.textContent = `Captured: ${data.date}`;
    mediaExplanation.textContent = data.explanation;
  } catch (err) {
    mediaTitle.textContent = 'Mission Error';
    mediaExplanation.textContent = 'Could not load data from NASA. Please try another date or check your connection.';
  } finally {
    loader.classList.add('hidden');
  }
}

// Event listeners
fetchBtn.addEventListener('click', () => {
  if (datePicker.value) {
    fetchAPOD(datePicker.value);
  }
});

// Load today's photo immediately on startup
fetchAPOD();
