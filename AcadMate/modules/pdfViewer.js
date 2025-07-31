window.loadPdfViewer = function(container) {
  container.innerHTML = `
    <div class="pdf-viewer-container fade-in">
      <div class="pdf-left-panel">
        <div class="pdf-folder-controls">
          <input type="text" id="new-subject-name" placeholder="New Subject Name" title="Enter new subject name" />
          <button id="create-subject-btn">Create Folder</button>
        </div>
        <div>
          <label for="subject-select">Select Subject Folder:</label>
          <select id="subject-select"></select>
        </div>
        <div class="pdf-upload-section">
          <label for="upload-pdf-input" class="upload-label" title="Upload PDF">📄 Upload PDF</label>
          <input type="file" id="upload-pdf-input" accept="application/pdf" style="display:none" />
        </div>
        <div>
          <h3>PDF Documents</h3>
          <ul id="pdf-list" class="pdf-list"></ul>
        </div>
      </div>
      <div class="pdf-main-viewer">
        <canvas id="pdf-canvas" style="border-radius: 16px; box-shadow: 0 8px 48px rgba(44,68,152,0.15);"></canvas>
        <div class="pdf-controls">
          <button id="prev-page">&#8592; Prev</button>
          <span>Page <span id="page-num">0</span> / <span id="page-count">0</span></span>
          <button id="next-page">Next &#8594;</button>
          <button id="zoom-in">Zoom +</button>
          <button id="zoom-out">Zoom -</button>
          <button id="fit-width">Fit Width</button>
        </div>
      </div>
    </div>
  `;

  // Elements
  const subjectSelect = container.querySelector('#subject-select');
  const createSubjectBtn = container.querySelector('#create-subject-btn');
  const newSubjectInput = container.querySelector('#new-subject-name');
  const uploadInput = container.querySelector('#upload-pdf-input');
  const pdfList = container.querySelector('#pdf-list');
  const canvas = container.querySelector('#pdf-canvas');
  const ctx = canvas.getContext('2d');
  const prevPageBtn = container.querySelector('#prev-page');
  const nextPageBtn = container.querySelector('#next-page');
  const pageNumSpan = container.querySelector('#page-num');
  const pageCountSpan = container.querySelector('#page-count');
  const zoomInBtn = container.querySelector('#zoom-in');
  const zoomOutBtn = container.querySelector('#zoom-out');
  const fitWidthBtn = container.querySelector('#fit-width');

  // PDF.js Setup
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.min.js';

  // Storage keys
  const STORAGE_KEY = 'acadmatePdfFolders';

  // State
  let folders = {}; // { folderName: [ {name: string, dataUrl: string}, ... ] }
  let currentFolder = null;
  let currentPdf = null;
  let pdfDoc = null;
  let currentPage = 1;
  let scale = 1.0;

  // Load from localStorage
  function loadFolders() {
    const stored = localStorage.getItem(STORAGE_KEY);
    folders = stored ? JSON.parse(stored) : {};
    if (!folders['General']) {
      folders['General'] = [];
    }
  }

  function saveFolders() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  }

  // Populate folder select options
  function refreshFolderSelect() {
    subjectSelect.innerHTML = '';
    Object.keys(folders).forEach(folder => {
      const option = document.createElement('option');
      option.value = folder;
      option.textContent = folder;
      subjectSelect.appendChild(option);
    });
    if (!currentFolder || !folders[currentFolder]) {
      currentFolder = Object.keys(folders)[0];
    }
    subjectSelect.value = currentFolder;
  }

  // Render PDF list for currentFolder
  function renderPdfList() {
    pdfList.innerHTML = '';
    if (!folders[currentFolder]) return;
    folders[currentFolder].forEach((pdf, index) => {
      const li = document.createElement('li');
      li.className = 'pdf-list-item';
      li.textContent = pdf.name;
      li.title = pdf.name;
      li.style.cursor = 'pointer';
      if (currentPdf === pdf) {
        li.classList.add('active-pdf');
      }
      li.addEventListener('click', () => {
        loadPdf(pdf);
      });
      pdfList.appendChild(li);
    });
  }

  // Load and render a pdf
  async function loadPdf(pdf) {
    currentPdf = pdf;
    if (!pdf) {
      clearCanvas();
      updatePagination(0, 0);
      return;
    }
    try {
      const loadingTask = pdfjsLib.getDocument({ data: atob(pdf.dataUrl.split(',')[1]) });
      pdfDoc = await loadingTask.promise;
      currentPage = 1;
      scale = 1.0;
      renderPage(currentPage);
      renderPdfList();
      statusMsg('');
    } catch (err) {
      console.error('Error loading PDF:', err);
      statusMsg('Error loading PDF.');
    }
  }

  // Clear canvas
  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Render current page
  async function renderPage(num) {
    if (!pdfDoc) return;
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    await page.render(renderContext).promise;
    updatePagination(num, pdfDoc.numPages);
  }

  // Update page number display
  function updatePagination(now, total) {
    pageNumSpan.textContent = now;
    pageCountSpan.textContent = total;
  }

  // PDF controls
  prevPageBtn.addEventListener('click', () => {
    if (!pdfDoc) return;
    if (currentPage <= 1) return;
    currentPage--;
    renderPage(currentPage);
  });
  nextPageBtn.addEventListener('click', () => {
    if (!pdfDoc) return;
    if (currentPage >= pdfDoc.numPages) return;
    currentPage++;
    renderPage(currentPage);
  });
  zoomInBtn.addEventListener('click', () => {
    if (!pdfDoc) return;
    if (scale >= 3) return;
    scale += 0.25;
    renderPage(currentPage);
  });
  zoomOutBtn.addEventListener('click', () => {
    if (!pdfDoc) return;
    if (scale <= 0.5) return;
    scale -= 0.25;
    renderPage(currentPage);
  });
  fitWidthBtn.addEventListener('click', () => {
    if (!pdfDoc) return;
    currentPage = 1;
    scale = 1.0;
    renderPage(currentPage);
  });

  // Folder selection
  subjectSelect.addEventListener('change', () => {
    currentFolder = subjectSelect.value;
    currentPdf = null;
    pdfDoc = null;
    clearCanvas();
    updatePagination(0, 0);
    renderPdfList();
    statusMsg('');
  });

  // Create new folder
  createSubjectBtn.addEventListener('click', () => {
    const newName = newSubjectInput.value.trim();
    if (!newName) {
      alert('Please enter a folder/subject name');
      return;
    }
    if (folders[newName]) {
      alert('Folder already exists');
      return;
    }
    folders[newName] = [];
    saveFolders();
    newSubjectInput.value = '';
    loadFolders();
    refreshFolderSelect();
    subjectSelect.value = newName;
    subjectSelect.dispatchEvent(new Event('change'));
  });

  // Upload PDF file(s) to current folder
  uploadInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    for (let file of files) {
      if (file.type !== 'application/pdf') {
        alert(`${file.name} is not a PDF file.`);
        continue;
      }
      try {
        const dataUrl = await readFileAsDataURL(file);
        folders[currentFolder].push({
          name: file.name,
          dataUrl: dataUrl
        });
      } catch (err) {
        console.error('Failed to read file', file.name, err);
      }
    }
    saveFolders();
    renderPdfList();
    e.target.value = ''; // reset input
    statusMsg('Upload complete');
  });

  // Helper: read file as Data URL
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(e);
      reader.readAsDataURL(file);
    });
  }

  // Status message helper (can be extended to show UI feedback)
  function statusMsg(msg) {
    // For now console log. Optional: add a visible status display
    console.log('PDF Viewer:', msg);
  }

  // Initialization
  loadFolders();
  refreshFolderSelect();
  subjectSelect.dispatchEvent(new Event('change'));
};
