window.loadNotes = function(container) {
  container.innerHTML = `
    <div class="notes-box fade-in">
      <h2>My Notes</h2>
      <form id="notes-form" autocomplete="off">
        <input id="note-title" type="text" placeholder="Note title (required)" required />
        <textarea id="note-content" rows="4" placeholder="Type your note here..." required></textarea>
        <button type="submit">Add Note</button>
      </form>
      <input id="notes-search" type="search" placeholder="Search notes..." style="margin-bottom: 12px; width: 100%; font-size: 1rem; padding: 8px; border-radius: 6px; border: 1.5px solid var(--border); box-sizing: border-box;"/>
      <ul id="notes-list"></ul>
    </div>
  `;

  let notes = JSON.parse(localStorage.getItem('acadmateNotes') || '[]');

  const form = container.querySelector('#notes-form');
  const titleInput = container.querySelector('#note-title');
  const contentInput = container.querySelector('#note-content');
  const list = container.querySelector('#notes-list');
  const searchInput = container.querySelector('#notes-search');

  let editingIndex = -1; // -1 means no edit

  function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDate(timestamp) {
    const d = new Date(timestamp);
    return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  }

  function renderNotes(filter = '') {
    const filteredNotes = notes.filter(note => 
      note.title.toLowerCase().includes(filter.toLowerCase())
      || note.content.toLowerCase().includes(filter.toLowerCase()));
    
    if (filteredNotes.length === 0) {
      list.innerHTML = `<li style="opacity:.7; font-style: italic; color: #aaa; background: none; box-shadow: none; border: none;">
      No matching notes found. Try adding some!</li>`;
      return;
    }

    list.innerHTML = filteredNotes.map((note, i) => `
      <li data-index="${i}">
        <div style="flex-grow: 1;">
          <strong>${escapeHTML(note.title)}</strong>
          <br/>
          <small style="opacity:0.6; font-size: 0.85rem;">${formatDate(note.timestamp)}</small>
          <p style="margin: 6px 0 0 0; white-space: pre-wrap;">${escapeHTML(note.content)}</p>
        </div>
        <div style="display:flex; flex-direction: column; gap: 6px; margin-left: 14px;">
          <button class="edit-btn" title="Edit note" style="background:#5c6ac4; color:#fff; border:none; border-radius:5px; padding: 5px 10px; cursor:pointer;">Edit</button>
          <button class="delete-btn" title="Delete note" style="background:#ff5565; color:#fff; border:none; border-radius:5px; padding: 5px 10px; cursor:pointer;">Delete</button>
        </div>
      </li>
    `).join('');
  }

  renderNotes();

  function resetForm() {
    form.reset();
    editingIndex = -1;
    form.querySelector('button[type="submit"]').textContent = 'Add Note';
  }

  form.onsubmit = e => {
    e.preventDefault();

    const titleVal = titleInput.value.trim();
    const contentVal = contentInput.value.trim();

    if (!titleVal || !contentVal) {
      alert('Please enter both title and content for your note.');
      return;
    }

    if (editingIndex >= 0) {
      // Update existing note
      notes[editingIndex] = {
        ...notes[editingIndex],
        title: titleVal,
        content: contentVal,
        timestamp: new Date().toISOString()
      };
      editingIndex = -1;
      form.querySelector('button[type="submit"]').textContent = 'Add Note';
    } else {
      // Add new note
      notes.unshift({
        title: titleVal,
        content: contentVal,
        timestamp: new Date().toISOString()
      });
    }

    localStorage.setItem('acadmateNotes', JSON.stringify(notes));
    form.reset();
    renderNotes(searchInput.value);
    titleInput.focus();
  };

  list.onclick = function(e) {
    const li = e.target.closest('li[data-index]');
    if (!li) return;
    const idx = parseInt(li.getAttribute('data-index'), 10);

    if (e.target.classList.contains('delete-btn')) {
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(idx, 1);
        localStorage.setItem('acadmateNotes', JSON.stringify(notes));
        renderNotes(searchInput.value);
        resetForm();
      }
    } else if (e.target.classList.contains('edit-btn')) {
      // Populate form for editing
      editingIndex = idx;
      titleInput.value = notes[idx].title;
      contentInput.value = notes[idx].content;
      form.querySelector('button[type="submit"]').textContent = 'Save Changes';
      titleInput.focus();
    }
  };

  searchInput.oninput = e => {
    renderNotes(e.target.value);
  };
};
