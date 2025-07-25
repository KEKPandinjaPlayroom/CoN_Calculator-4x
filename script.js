const result = document.getElementById('result');
const toggleBtn = document.querySelector('.theme-toggle');
const historyContainer = document.getElementById('historyContainer');
const screensaver = document.getElementById('screensaver');
const notifySound = document.getElementById('notifySound');

let scaledTotalSeconds = 0;
let intervalMain = null;
let timers = [];
let timerIdCounter = 1;

function updateResult() {
  const days = parseInt(document.getElementById('days').value) || 0;
  const hours = parseInt(document.getElementById('hours').value) || 0;
  const minutes = parseInt(document.getElementById('minutes').value) || 0;
  const seconds = parseInt(document.getElementById('seconds').value) || 0;

  const originalTotalSeconds = (days * 86400) + (hours * 3600) + (minutes * 60) + seconds;
  if (originalTotalSeconds === 0) return;

  scaledTotalSeconds = Math.floor(originalTotalSeconds / 4);
  displayTime(scaledTotalSeconds, result);

  if (intervalMain) clearInterval(intervalMain);
  intervalMain = setInterval(() => {
    if (scaledTotalSeconds > 0) {
      scaledTotalSeconds--;
      displayTime(scaledTotalSeconds, result);
    } else {
      clearInterval(intervalMain);
      playSound();
    }
  }, 1000);

  addToHistory(scaledTotalSeconds);
}

function displayTime(seconds, element) {
  let remaining = seconds;
  const days = Math.floor(remaining / 86400);
  remaining %= 86400;
  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const parts = [];
  if (days > 0) parts.push(`${days} Tage`);
  if (hours > 0) parts.push(`${hours} Std`);
  if (minutes > 0) parts.push(`${minutes} Min`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} Sek`);

  element.textContent = parts.join(', ');
}

function addToHistory(seconds) {
    const id = Date.now();
    const name = `Timer ${timerIdCounter++}`;
    const entry = createHistoryEntry({ id, name, secondsLeft: seconds });
    document.getElementById('historyContainer').appendChild(entry);
    timers.push({ id, name, secondsLeft: seconds });
    saveTimers();
    startCountdown(id);
}

function createHistoryEntry(timer) {
    const entry = document.createElement('div');
    entry.className = 'history-entry';
    entry.dataset.id = timer.id;
  
    // Floating name header
    const nameHeader = document.createElement('div');
    nameHeader.className = 'entry-name-header';
    nameHeader.textContent = timer.name;
  
    const progress = document.createElement('div');
    progress.className = 'progress-bar';
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progress.appendChild(progressFill);
  
    const timeEl = document.createElement('div');
    timeEl.className = 'history-time';
    displayTime(timer.secondsLeft, timeEl);
  
    const nameWrapper = document.createElement('div');
    nameWrapper.className = 'history-name-wrapper';
  
    const nameInput = document.createElement('input');
    nameInput.className = 'history-name-input';
    nameInput.value = timer.name;
    nameInput.style.display = 'none';
  
    nameInput.addEventListener('blur', () => {
      const newName = nameInput.value || 'Timer';
      nameHeader.textContent = newName;
      updateTimerName(timer.id, newName);
      nameInput.style.display = 'none';
    });
  
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '✏️';
    editBtn.onclick = () => {
      nameInput.style.display = 'inline-block';
      nameInput.focus();
    };
  
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.onclick = () => {
      entry.remove();
      timers = timers.filter(t => t.id !== timer.id);
      saveTimers();
    };
  
    nameWrapper.appendChild(nameInput);
  
    entry.appendChild(nameHeader);
    entry.appendChild(progress);
    entry.appendChild(timeEl);
    entry.appendChild(nameWrapper);
    entry.appendChild(editBtn);
    entry.appendChild(deleteBtn);
  
    entry.querySelector('.progress-fill')?.style.setProperty('--progress', '100%');
    return entry;
  }
  

function playSound() {
  notifySound.currentTime = 0;
  notifySound.play();
}


function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  toggleBtn.textContent = newTheme === 'dark' ? '🌙' : '☀️';
  createScreensaver(); // Update screensaver for theme
}

function createScreensaver() {
  screensaver.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const circle = document.createElement('div');
    circle.classList.add('circle');
    const size = Math.random() * 80 + 20;
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.left = `${Math.random() * 100}%`;
    circle.style.top = `${Math.random() * 100}%`;
    circle.style.animationDuration = `${10 + Math.random() * 20}s`;
    screensaver.appendChild(circle);
  }
}

function clearAllTimers() {
    document.getElementById('custom-confirm').classList.remove('hidden');
  }
  function confirmYes() {
    document.getElementById('historyContainer').innerHTML = '';
    timers = [];
    saveTimers();
    document.getElementById('custom-confirm').classList.add('hidden');
  }
  
  function confirmNo() {
    document.getElementById('custom-confirm').classList.add('hidden');
  }
  

function saveTimers() {
  localStorage.setItem('timers', JSON.stringify(timers));
}

function loadTimers() {
  const saved = JSON.parse(localStorage.getItem('timers') || '[]');
  timers = saved;
  timers.forEach(timer => {
    const entry = createHistoryEntry(timer);
    document.getElementById('historyContainer').appendChild(entry);
    startCountdown(timer.id);
  });
}

function startCountdown(id) {
    const timer = timers.find(t => t.id === id);
    if (!timer) return;
  
    const entry = document.querySelector(`.history-entry[data-id="${id}"]`);
    const timeEl = entry.querySelector('.history-time');
    const progressFill = entry.querySelector('.progress-fill');
    const total = timer.secondsLeft;
  
    const interval = setInterval(() => {
      if (timer.secondsLeft > 0) {
        timer.secondsLeft--;
        displayTime(timer.secondsLeft, timeEl);
        const progressPercent = (timer.secondsLeft / total) * 100;
        progressFill.style.width = `${progressPercent}%`;
        saveTimers();
      } else {
        clearInterval(interval);
        playSound();
        progressFill.style.width = `0%`;
      }
    }, 1000);
  }
  
  

function updateTimerName(id, newName) {
  const t = timers.find(t => t.id === id);
  if (t) {
    t.name = newName;
    saveTimers();
  }
}

window.onload = () => {
    createScreensaver();
    loadTimers();
};
  