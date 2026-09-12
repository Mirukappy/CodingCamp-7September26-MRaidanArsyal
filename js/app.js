let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let links = JSON.parse(localStorage.getItem('links')) || [];
let timerInterval;
let defaultTime = 25 * 60;
let timeLeft = defaultTime;

// --- GREETING & CLOCK ---
function updateClock() {
    const now = new Date();
    document.getElementById('time-display').textContent = now.toLocaleTimeString('en-US', { hour12: false });
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date-display').textContent = now.toLocaleDateString('en-US', options);

    const hour = now.getHours();
    let greeting = 'Evening';
    if (hour < 12) greeting = 'Morning';
    else if (hour < 18) greeting = 'Afternoon';
    document.getElementById('greeting-time').textContent = greeting;
}
setInterval(updateClock, 1000);
updateClock();

const nameEl = document.getElementById('user-name');
nameEl.textContent = localStorage.getItem('dashboardName') || 'Raida';
nameEl.addEventListener('blur', () => {
    localStorage.setItem('dashboardName', nameEl.textContent);
});

// --- LIGHT/DARK MODE ---
const themeBtn = document.getElementById('theme-toggle');
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// --- FOCUS TIMER ---
const timerDisplay = document.getElementById('timer-display');
function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;
}

// Edit Pomodoro Time Logic
document.getElementById('btn-set-time').addEventListener('click', () => {
    const newMinutes = parseInt(document.getElementById('time-input').value);
    if (newMinutes > 0 && newMinutes <= 120) {
        clearInterval(timerInterval);
        timerInterval = null;
        defaultTime = newMinutes * 60;
        timeLeft = defaultTime;
        updateTimerDisplay();
    } else {
        alert("Please enter a time between 1 and 120 minutes.");
    }
});

document.getElementById('btn-start').addEventListener('click', () => {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                alert("Focus session complete!");
            }
        }, 1000);
    }
});

document.getElementById('btn-stop').addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
});

document.getElementById('btn-reset').addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = defaultTime;
    updateTimerDisplay();
});

// --- TO-DO LIST ---
function renderTasks() {
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        if (task.done) li.classList.add('done');
        
        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask(${index})">
                <span contenteditable="true" onblur="editTask(${index}, this.textContent)">${task.text}</span>
            </div>
            <button class="btn-danger btn-small" onclick="deleteTask(${index})">Del</button>
        `;
        list.appendChild(li);
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

document.getElementById('btn-add-task').addEventListener('click', () => {
    const input = document.getElementById('task-input');
    const text = input.value.trim();
    
    if (text === '') return;
    if (tasks.some(t => t.text.toLowerCase() === text.toLowerCase())) {
        alert("This task already exists!");
        return;
    }

    tasks.push({ text, done: false });
    input.value = '';
    renderTasks();
});

window.toggleTask = (index) => { tasks[index].done = !tasks[index].done; renderTasks(); };
window.deleteTask = (index) => { tasks.splice(index, 1); renderTasks(); };
window.editTask = (index, newText) => { tasks[index].text = newText; localStorage.setItem('tasks', JSON.stringify(tasks)); };

// --- QUICK LINKS ---
function renderLinks() {
    const container = document.getElementById('links-container');
    container.innerHTML = '';
    links.forEach((link, index) => {
        const a = document.createElement('a');
        let formattedUrl = link.url;
        if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            formattedUrl = 'https://' + formattedUrl;
        }
        
        a.href = formattedUrl;
        a.target = '_blank';
        a.className = 'link-badge';
        a.innerHTML = `
            ${link.name} 
            <button class="delete-link" onclick="event.preventDefault(); deleteLink(${index})">×</button>
        `;
        container.appendChild(a);
    });
    localStorage.setItem('links', JSON.stringify(links));
}

document.getElementById('btn-add-link').addEventListener('click', () => {
    const nameInput = document.getElementById('link-name');
    const urlInput = document.getElementById('link-url');
    if (nameInput.value && urlInput.value) {
        links.push({ name: nameInput.value, url: urlInput.value });
        nameInput.value = ''; urlInput.value = '';
        renderLinks();
    }
});

window.deleteLink = (index) => { links.splice(index, 1); renderLinks(); };

// INITIAL RENDER
renderTasks();
renderLinks();