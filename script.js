const gallery        = document.getElementById('gallery');
const cards          = () => [...gallery.querySelectorAll('.card')];
const emptyState     = document.getElementById('emptyState');
const emptyQuery     = document.getElementById('emptyQuery');
const lightbox       = document.getElementById('lightbox');
const lbImg          = document.getElementById('lbImg');
const lbTitle        = document.getElementById('lbTitle');
const lbCat          = document.getElementById('lbCat');
const totalCount     = document.getElementById('totalCount');
const uploadedCount  = document.getElementById('uploadedCount');

let activeFilter = 'all';
let visibleCards = [];
let currentIndex = 0;
let uploadedTotal = 0;

// ── Stats ──
function updateStats() {
  totalCount.textContent = cards().length;
  uploadedCount.textContent = uploadedTotal;
}

// ── Filter ──
document.getElementById('filterTabs').addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  activeFilter = tab.dataset.filter;
  applyFilters();
});

function applyFilters() {
  let count = 0;
  cards().forEach(card => {
    const show = activeFilter === 'all' || card.dataset.category === activeFilter;
    card.classList.toggle('hidden', !show);
    if (show) count++;
  });
  visibleCards = cards().filter(c => !c.classList.contains('hidden'));
  emptyState.style.display = count === 0 ? 'block' : 'none';
  emptyQuery.textContent = activeFilter;
}

// ── View Toggle ──
document.getElementById('gridView').addEventListener('click', function () {
  gallery.classList.remove('list-mode');
  document.getElementById('listView').classList.remove('active');
  this.classList.add('active');
});
document.getElementById('listView').addEventListener('click', function () {
  gallery.classList.add('list-mode');
  document.getElementById('gridView').classList.remove('active');
  this.classList.add('active');
});

// ── Delete ──
gallery.addEventListener('click', e => {
  const delBtn = e.target.closest('.del-btn');
  if (!delBtn) return;
  const card = delBtn.closest('.card');
  card.style.transition = 'opacity .3s, transform .3s';
  card.style.opacity = '0';
  card.style.transform = 'scale(.9)';
  setTimeout(() => { card.remove(); applyFilters(); updateStats(); }, 300);
});

// ── Lightbox ──
gallery.addEventListener('click', e => {
  const zoomBtn = e.target.closest('.zoom-btn');
  const img = !zoomBtn && e.target.closest('.card-img-wrap') && e.target.closest('img');
  const trigger = zoomBtn || (img && img.closest('.card').querySelector('.zoom-btn'));
  if (!trigger) return;
  visibleCards = cards().filter(c => !c.classList.contains('hidden'));
  currentIndex = visibleCards.indexOf(trigger.closest('.card'));
  openLightbox(trigger.dataset.src, trigger.dataset.title, trigger.dataset.cat);
});

function openLightbox(src, title, cat) {
  lbImg.src = src;
  lbTitle.textContent = title;
  lbCat.textContent = cat;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lbImg.src = '';
}

document.getElementById('lbClose').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.getElementById('lbPrev').addEventListener('click', () => navigate(-1));
document.getElementById('lbNext').addEventListener('click', () => navigate(1));

function navigate(dir) {
  visibleCards = cards().filter(c => !c.classList.contains('hidden'));
  currentIndex = (currentIndex + dir + visibleCards.length) % visibleCards.length;
  const btn = visibleCards[currentIndex].querySelector('.zoom-btn');
  if (btn) openLightbox(btn.dataset.src, btn.dataset.title, btn.dataset.cat);
}

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  navigate(-1);
  if (e.key === 'ArrowRight') navigate(1);
});

// ── AUTO DETECT category from filename ──
const CATEGORY_KEYWORDS = {
  nature:       ['nature','forest','mountain','ocean','lake','river','tree','flower','sky','sunset','sunrise','beach','waterfall','jungle','lavender','aurora','mist','cliff','field','grass','snow','desert','valley'],
  architecture: ['architecture','building','tower','bridge','city','urban','house','church','temple','castle','museum','skyscraper','eiffel','colosseum','rome','paris','street','road','interior'],
  travel:       ['travel','tokyo','paris','bali','santorini','greece','italy','japan','india','london','dubai','thailand','vietnam','indonesia','airport','vacation','trip','tour'],
  portrait:     ['portrait','person','face','woman','man','girl','boy','model','selfie','people','human','smile','eye','hair','studio','golden'],
  abstract:     ['abstract','art','pattern','texture','color','colour','neon','light','dark','blur','wave','geometric','shape','design','creative','digital','fractal','liquid'],
  food:         ['food','burger','pizza','sushi','pasta','cake','dessert','coffee','tea','fruit','vegetable','meal','dish','restaurant','cook','bake','chocolate','bread','salad','soup','steak','taco']
};

function detectCategory(name) {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return 'abstract';
}

function cleanFileName(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

// ── UPLOAD MODAL ──
const uploadModal     = document.getElementById('uploadModal');
const step1           = document.getElementById('step1');
const step2           = document.getElementById('step2');
const dropZone        = document.getElementById('dropZone');
const fileInput       = document.getElementById('fileInput');
const previewImg      = document.getElementById('previewImg');
const photoNameInput  = document.getElementById('photoNameInput');
const otherInput      = document.getElementById('otherInput');
const otherCatInput   = document.getElementById('otherCatInput');
const uploadError     = document.getElementById('uploadError');
const confirmBtn      = document.getElementById('confirmUpload');

let uploadedDataURL = null;

// Show/hide Other input when chip changes
document.querySelectorAll('input[name="cat"]').forEach(radio => {
  radio.addEventListener('change', () => {
    otherInput.style.display = radio.value === 'other' && radio.checked ? 'block' : 'none';
    if (radio.value === 'other') otherCatInput.focus();
  });
});

function openModal() {
  uploadModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  resetModal();
}
function closeModal() {
  uploadModal.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('openUpload').addEventListener('click', openModal);
document.getElementById('closeUpload').addEventListener('click', closeModal);
document.getElementById('cancelUpload').addEventListener('click', closeModal);
uploadModal.addEventListener('click', e => { if (e.target === uploadModal) closeModal(); });

// Change photo button resets to step 1
document.getElementById('changeFile').addEventListener('click', () => {
  resetModal();
});

function resetModal() {
  fileInput.value = '';
  uploadError.textContent = '';
  uploadedDataURL = null;
  photoNameInput.value = '';
  otherCatInput.value = '';
  otherInput.style.display = 'none';
  // reset chips to nature
  document.querySelector('input[name="cat"][value="nature"]').checked = true;
  previewImg.src = '';
  step1.style.display = 'block';
  step2.style.display = 'none';
  confirmBtn.disabled = true;
}

function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    uploadError.textContent = '⚠ Please select a valid image (JPG, PNG, WEBP, GIF).';
    return;
  }
  uploadError.textContent = '';
  const autoName = cleanFileName(file.name);
  photoNameInput.value = autoName;
  const reader = new FileReader();
  reader.onload = ev => {
    uploadedDataURL  = ev.target.result;
    previewImg.src   = uploadedDataURL;
    step1.style.display = 'none';
    step2.style.display = 'block';
    confirmBtn.disabled = false;
    photoNameInput.focus();
    photoNameInput.select();
  };
  reader.readAsDataURL(file);
}

fileInput.addEventListener('change', () => loadFile(fileInput.files[0]));

// Drag & drop on drop zone
dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', ()  => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  loadFile(e.dataTransfer.files[0]);
});

// Confirm → add card to gallery
confirmBtn.addEventListener('click', () => {
  if (!uploadedDataURL) return;
  const name = photoNameInput.value.trim() || 'My Photo';
  const selectedRadio = document.querySelector('input[name="cat"]:checked');
  let cat = selectedRadio ? selectedRadio.value : 'nature';

  // Handle Other → use typed custom category
  if (cat === 'other') {
    const custom = otherCatInput.value.trim();
    if (!custom) { uploadError.textContent = '⚠ Please type your custom category.'; return; }
    cat = custom.toLowerCase().replace(/\s+/g, '-');
    // Add new chip to upload modal if not already there
    addCustomChip(cat, custom);
  }
  uploadError.textContent = '';

  const catLabel = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ');
  const now = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // Add filter tab to main page if this category doesn't exist yet
  const filterTabs = document.getElementById('filterTabs');
  if (!filterTabs.querySelector(`[data-filter="${cat}"]`)) {
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.filter = cat;
    btn.textContent = catLabel;
    filterTabs.appendChild(btn);
  }

  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.category = cat;
  card.dataset.title    = name;
  card.innerHTML = `
    <div class="card-img-wrap">
      <img src="${uploadedDataURL}" alt="${name}"/>
      <div class="img-name-tag"><i class="fa-solid fa-tag"></i> ${name}</div>
      <div class="card-overlay">
        <button class="icon-btn zoom-btn" title="View"
          data-src="${uploadedDataURL}" data-title="${name}" data-cat="${catLabel}">
          <i class="fa-solid fa-expand"></i>
        </button>
        <button class="icon-btn del-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
    <div class="card-info">
      <div class="card-top">
        <span class="cat-tag other">${catLabel}</span>
        <span class="card-date">${now}</span>
      </div>
      <p class="card-title">${name}</p>
    </div>`;

  gallery.prepend(card);
  uploadedTotal++;
  closeModal();
  applyFilters();
  updateStats();
  document.querySelector('.gallery-wrapper').scrollIntoView({ behavior: 'smooth' });
});

// Add a new chip to the upload modal category list (persists for future uploads)
function addCustomChip(catValue, catRaw) {
  const chips = document.querySelector('.cat-chips');
  // Don't add if already exists
  if (chips.querySelector(`input[value="${catValue}"]`)) return;

  const catLabel = catRaw.charAt(0).toUpperCase() + catRaw.slice(1);
  const label = document.createElement('label');
  label.className = 'chip-label';
  label.innerHTML = `<input type="radio" name="cat" value="${catValue}"/><span>🏷 ${catLabel}</span>`;

  // Insert before the "Other" chip
  const otherChip = chips.querySelector('input[value="other"]').closest('.chip-label');
  chips.insertBefore(label, otherChip);

  // Wire up the change event for the new chip
  label.querySelector('input').addEventListener('change', () => {
    otherInput.style.display = 'none';
  });
}

// ── DOWNLOAD (works for both Unsplash URLs and local uploaded images) ──
document.getElementById('lbDownload').addEventListener('click', async () => {
  const src   = lbImg.src;
  const title = lbTitle.textContent || 'photo';
  const filename = title.replace(/\s+/g, '_').toLowerCase() + '.jpg';

  try {
    // For local base64 images (uploaded by user)
    if (src.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = src;
      a.download = filename;
      a.click();
      return;
    }
    // For external URLs (Unsplash) — fetch as blob so browser saves the file
    const res  = await fetch(src);
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    // Fallback: open in new tab so user can right-click save
    window.open(src, '_blank');
  }
});

// ── Init ──
applyFilters();
updateStats();
