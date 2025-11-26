let notes = [];
let currentNoteId = null;
let recognition = null;
let isRecording = false;

// Load notes from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    loadNotesFromStorage();
    initializePage();
});


// LOCAL STORAGE FUNCTIONS
function saveNotesToStorage() {
    localStorage.setItem('buildupNotes', JSON.stringify(notes));
}

function loadNotesFromStorage() {
    const savedNotes = localStorage.getItem('buildupNotes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    }
}


// PAGE INITIALIZATION
function initializePage() {
    const currentPage = window.location.pathname;
    
    // Initialize sidebar toggle
    initSidebarToggle();
    
    // Initialize search functionality
    initSearch();
    
    // Page-specific initialization
    if (currentPage.includes('home.html') || currentPage.includes('sidebar.html')) {
        initHomePage();
    } else if (currentPage.includes('newnote.html')) {
        initNewNotePage();
    } else if (currentPage.includes('landing.html') || currentPage === '/' || currentPage.includes('index.html')) {
        initLandingPage();
    }
    
    // Initialize "New Note" buttons across all pages
    initNewNoteButtons();
}

// SIDEBAR TOGGLE FUNCTIONALITY

function initSidebarToggle() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    const sidebarWrapper = document.querySelector('.sidebar-wrapper');
    
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            if (sidebarWrapper) {
                sidebarWrapper.classList.toggle('collapsed');
            }
        });
    }
}


// SEARCH FUNCTIONALITY

function initSearch() {
    const searchInputs = document.querySelectorAll('.searchbar input');
    const clearBtns = document.querySelectorAll('.searchbar .btn');
    
    searchInputs.forEach(searchInput => {
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                performSearch(this.value);
            });
        }
    });
    
    clearBtns.forEach(clearBtn => {
        if (clearBtn.textContent.includes('Clear')) {
            clearBtn.addEventListener('click', function() {
                searchInputs.forEach(input => {
                    if (input) {
                        input.value = '';
                        performSearch('');
                    }
                });
            });
        }
    });
}

function performSearch(query) {
    const cards = document.querySelectorAll('.grid .card');
    const lowerQuery = query.toLowerCase();
    
    cards.forEach(card => {
        const title = card.querySelector('.title')?.textContent.toLowerCase() || '';
        const content = card.querySelector('.cont')?.textContent.toLowerCase() || '';
        
        if (title.includes(lowerQuery) || content.includes(lowerQuery)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}


// NEW NOTE BUTTONS INITIALIZATION

function initNewNoteButtons() {
    const newNoteBtns = document.querySelectorAll('.btn-primary, .cta-btn');
    
    newNoteBtns.forEach(btn => {
        const btnText = btn.textContent.toLowerCase();
        if (btnText.includes('new note') || btnText.includes('new note')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'newnote.html';
            });
        }
    });
}


// HOME PAGE FUNCTIONALITY

function initHomePage() {
    renderNotes();
    initFilterTabs();
}

function renderNotes(filter = 'All') {
    const grid = document.querySelector('.grid');
    if (!grid) return;
    
    // Store welcome cards
    const welcomeCards = [];
    const existingCards = grid.querySelectorAll('.card');
    existingCards.forEach(card => {
        if (card.querySelector('.title')?.textContent.includes('Welcome') || 
            card.querySelector('.title')?.textContent.includes('Stay Consistent')) {
            welcomeCards.push(card.cloneNode(true));
        }
    });
    
    // Clear grid
    grid.innerHTML = '';
    
    // Re-add welcome cards if filter is All
    if (filter === 'All') {
        welcomeCards.forEach(card => grid.appendChild(card));
    }
    
    // Filter and render notes
    let filteredNotes = notes;
    if (filter !== 'All') {
        filteredNotes = notes.filter(note => note.category === filter);
    }
    
    filteredNotes.forEach(note => {
        const card = createNoteCard(note);
        grid.appendChild(card);
    });
}

function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => editNote(note.id);
    card.style.cursor = 'pointer';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    card.innerHTML = `
        <div class="title">${note.title || 'Untitled'}</div>
        <p class="cont">${textContent.substring(0, 150)}${textContent.length > 150 ? '...' : ''}</p>
        <span class="date">${note.date}</span>
    `;
    
    return card;
}

function editNote(noteId) {
    localStorage.setItem('editNoteId', noteId);
    window.location.href = 'newnote.html';
}

function initFilterTabs() {
    const tabs = document.querySelectorAll('.filter .tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            // Filter notes
            renderNotes(this.textContent);
        });
    });
}


// NEW NOTE PAGE FUNCTIONALITY

function initNewNotePage() {
    // Check if editing existing note
    const editNoteId = localStorage.getItem('editNoteId');
    if (editNoteId) {
        loadNoteForEditing(editNoteId);
        localStorage.removeItem('editNoteId');
    }
    
    // Initialize editor toolbar
    initEditorToolbar();
    
    // Initialize save button
    const saveBtn = document.getElementById('saveNote');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveNote);
    }
    
    // Initialize image upload
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }
    
    // Initialize PDF upload
    const pdfInput = document.getElementById('pdfInput');
    if (pdfInput) {
        pdfInput.addEventListener('change', handlePDFUpload);
    }
    
    // Initialize camera
    const cameraBtn = document.getElementById('cameraOpen');
    if (cameraBtn) {
        cameraBtn.addEventListener('click', openCamera);
    }
    
    // Initialize voice recording
    const voiceStart = document.getElementById('voiceStart');
    const voiceStop = document.getElementById('voiceStop');
    if (voiceStart) {
        voiceStart.addEventListener('click', startVoiceRecording);
    }
    if (voiceStop) {
        voiceStop.addEventListener('click', stopVoiceRecording);
    }
    
    // Initialize confetti
    const confettiBtn = document.getElementById('confetti');
    if (confettiBtn) {
        confettiBtn.addEventListener('click', triggerConfetti);
    }
    
    // Initialize color pickers
    const textColorPicker = document.getElementById('textColorPicker');
    const bgColorPicker = document.getElementById('bgColorPicker');
    
    if (textColorPicker) {
        textColorPicker.addEventListener('change', function() {
            document.execCommand('foreColor', false, this.value);
        });
    }
    
    if (bgColorPicker) {
        bgColorPicker.addEventListener('change', function() {
            const editor = document.getElementById('editor');
            if (editor) {
                editor.style.backgroundColor = this.value;
            }
        });
    }


    // Initialize heading selector
    const headingSelect = document.getElementById('headingSelect');
    if (headingSelect) {
        headingSelect.addEventListener('change', function() {
            document.execCommand('formatBlock', false, this.value);
        });
    }
}

function loadNoteForEditing(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    const titleInput = document.getElementById('noteTitle');
    const editor = document.getElementById('editor');
    
    if (titleInput) titleInput.value = note.title;
    if (editor) editor.innerHTML = note.content;
    
    currentNoteId = noteId;
}

function initEditorToolbar() {
    const tools = document.querySelectorAll('.tool[data-cmd]');
    
    tools.forEach(tool => {
        tool.addEventListener('click', function() {
            const cmd = this.getAttribute('data-cmd');
            document.execCommand(cmd, false, null);
        });
    });
}

function saveNote() {
    const titleInput = document.getElementById('noteTitle');
    const editor = document.getElementById('editor');
    
    if (!titleInput || !editor) return;
    
    const title = titleInput.value.trim();
    const content = editor.innerHTML.trim();
    
    if (!title && !content) {
        alert('Please add a title or content to save the note.');
        return;
    }
    
    const note = {
        id: currentNoteId || Date.now().toString(),
        title: title || 'Untitled',
        content: content || 'No content',
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        category: 'All'
    };
    
    if (currentNoteId) {
        // Update existing note
        const index = notes.findIndex(n => n.id === currentNoteId);
        if (index !== -1) {
            notes[index] = note;
        }
    } else {
        // Add new note
        notes.push(note);
    }
    
    saveNotesToStorage();
    
    // Show success message
    showNotification('Note saved successfully! 🎉');
    
    // Redirect to home after a delay
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 1500);
}

function deleteNote() {
    if (!currentNoteId) {
        alert('No note selected to delete.');
        return;
    }

    const confirmDelete = confirm('Are you sure you want to delete this note?');

    if (!confirmDelete) return;

    // Find note index
    const index = notes.findIndex(n => n.id === currentNoteId);

    if (index === -1) {
        alert('Note not found.');
        return;
    }

    // Remove note from array
    notes.splice(index, 1);

    // Save updated notes
    saveNotesToStorage();

    // Show success message
    showNotification('Note deleted successfully 🗑️');

    // Redirect to home after a delay
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 1500);
}

const deleteBtn = document.getElementById('deleteNoteBtn');
if (deleteBtn) {
    deleteBtn.addEventListener('click', deleteNote);
}




function handleImageUpload(event) {
    const files = event.target.files;
    const editor = document.getElementById('editor');
    
    if (!editor) return;
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.margin = '10px 0';
            img.style.borderRadius = '8px';
            editor.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function handlePDFUpload(event) {
    const file = event.target.files[0];
    const editor = document.getElementById('editor');
    
    if (!editor || !file) return;
    
    const pdfDiv = document.createElement('div');
    pdfDiv.style.padding = '10px';
    pdfDiv.style.background = 'rgba(114,81,213,0.1)';
    pdfDiv.style.borderRadius = '8px';
    pdfDiv.style.margin = '10px 0';
    pdfDiv.innerHTML = `📄 PDF attached: ${file.name}`;
    
    editor.appendChild(pdfDiv);
}


function startVoiceRecording() {
    const editor = document.getElementById('editor');
    const voiceStart = document.getElementById('voiceStart');
    const voiceStop = document.getElementById('voiceStop');
    
    if (!editor) return;
    
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
        return;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = function() {
        isRecording = true;
        voiceStart.disabled = true;
        voiceStop.disabled = false;
        voiceStart.textContent = '🎙️ Recording...';
    };
    
    recognition.onresult = function(event) {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        
        // Add transcript to editor
        const span = document.createElement('span');
        span.textContent = transcript + ' ';
        editor.appendChild(span);
    };
    
    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        stopVoiceRecording();
    };
    
    recognition.start();
}

function stopVoiceRecording() {
    if (recognition) {
        recognition.stop();
    }
    
    const voiceStart = document.getElementById('voiceStart');
    const voiceStop = document.getElementById('voiceStop');
    
    if (voiceStart) {
        voiceStart.disabled = false;
        voiceStart.textContent = 'Voice';
    }
    if (voiceStop) {
        voiceStop.disabled = true;
    }
    
    isRecording = false;
}


function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 25px';
    notification.style.background = '#7251D5';
    notification.style.color = 'white';
    notification.style.borderRadius = '12px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    notification.style.zIndex = '10000';
    notification.style.fontWeight = 'bold';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}




// RESPONSIVE HANDLING

window.addEventListener('resize', function() {
    const sidebar = document.querySelector('.sidebar');
    
    if (window.innerWidth > 768) {
        if (sidebar) sidebar.classList.remove('collapsed');
    }
});

