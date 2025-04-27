// Select elements
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const inputArea = document.getElementById('inputArea');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const taskNameInput = document.getElementById('taskNameInput');
const dueDateInput = document.getElementById('dueDateInput');
const locationInput = document.getElementById('locationInput');
const locationTypeInput = document.getElementById('locationTypeInput');
const clock = document.getElementById('clock');
const menuButton = document.getElementById('menuButton');
const menuOverlay = document.getElementById('menuOverlay');

// Show input area when plus add Task clicked
addTaskBtn?.addEventListener('click', () => {
    inputArea.style.display = 'block';
});

// Save task on Save button click
saveTaskBtn?.addEventListener('click', () => {
    const taskText = taskNameInput.value.trim();
    const dueInput = dueDateInput.value;
    const locationText = locationInput.value.trim();
    const locationType = locationTypeInput.value;

    if (taskText && dueInput) {
        const task = {
            name: taskText,
            due: dueInput,
            location: locationText,
            type: locationType
        };

        // Save to LocalStorage
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        displayTasks();
        
        // Clear form
        taskNameInput.value = '';
        dueDateInput.value = '';
        locationInput.value = '';
        locationTypeInput.value = 'Home';
        inputArea.style.display = 'none';
    }
});

// Display all tasks from LocalStorage
function displayTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    taskList.innerHTML = '';

    tasks.forEach((task, index) => {
        const dueDate = new Date(task.due);
        const now = new Date();
        let timeLeftMs = dueDate - now;
        let timeLeftText = '';

        if (timeLeftMs > 0) {
            const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
            timeLeftText = `Due in ${hours}h ${minutes}m`;
        } else {
            timeLeftText = 'Overdue';
        }

        const taskItem = document.createElement('div');
        taskItem.className = 'task';

        taskItem.innerHTML = `
            <div>
                <strong>${task.name}</strong><br>
                <small>${dueDate.toLocaleString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                })} (${timeLeftText})</small><br>
                <small>Location: ${task.location} (${task.type})</small>
            </div>
            <button onclick="completeTask(${index})">Complete</button>
        `;
        taskList.appendChild(taskItem);
    });
}

// Complete (delete) a task
function completeTask(index) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.splice(index, 1); // Remove the selected task
    localStorage.setItem('tasks', JSON.stringify(tasks));

    displayTasks(); // Refresh main page task list
    displayTasksForDate(selectedDate); // Refresh selected date tasks

    // rebuild calendar
    buildCalendar();
}


// Update live clock every second
function updateClock() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true
    };
    if(clock) clock.textContent = now.toLocaleString('en-US', options);
}

setInterval(updateClock, 1000);
updateClock();

// Show/Hide Menu
menuButton?.addEventListener('click', () => {
    menuOverlay.classList.toggle('show');
});

// Load tasks when page starts
if (taskList) {
    displayTasks();
}
const calendarGrid = document.getElementById('calendarGrid');
const calendarHeader = document.getElementById('calendarHeader');
const taskListDisplay = document.getElementById('taskList');

if (calendarGrid) {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();

    function buildCalendar() {
        calendarGrid.innerHTML = ''; // Clear old grid

        const firstDayOfMonth = new Date(year, month, 1);
        const startingDay = firstDayOfMonth.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const taskDates = tasks.map(task => task.due.split('T')[0]);

        const monthNames = ["January", "February", "March", "April", "May", "June", 
                            "July", "August", "September", "October", "November", "December"];

       // calendarHeader.textContent = `${monthNames[month]} ${year}`;
       document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;

        // Add day names on top
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        dayNames.forEach(dayName => {
            const dayNameCell = document.createElement('div');
            dayNameCell.classList.add('day-name');
            dayNameCell.textContent = dayName;
            calendarGrid.appendChild(dayNameCell);
        });

        // Blank starting cells
        for (let i = 0; i < startingDay; i++) {
            const blank = document.createElement('div');
            calendarGrid.appendChild(blank);
        }

        // FILL DAY NUMBERS
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day');
            dayCell.textContent = day;
        
            const clickedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
            if (taskDates.includes(clickedDateStr)) {
                dayCell.classList.add('has-task'); // green dot
            }
        
            dayCell.addEventListener('click', () => {
                selectedDate = clickedDateStr;
                displayTasksForDate(clickedDateStr);
            });

            calendarGrid.appendChild(dayCell);
        }
    }

    buildCalendar(); // Build at start
    document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
        month--;
        if (month < 0) {
            month = 11;
            year--;
        }
        buildCalendar();
    });
    
    document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
        month++;
        if (month > 11) {
            month = 0;
            year++;
        }
        buildCalendar();
    });
}


//*DISPLAY TASKS WHEN CLICKING ON A DATE*/
function displayTasksForDate(dateStr) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    taskListDisplay.innerHTML = '';

    const filteredTasks = tasks.filter(task => {
        const taskDateStr = task.due.split('T')[0];

        return taskDateStr === dateStr;
    });

    const [year, month, day] = dateStr.split('-');

    const monthsList = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    
    const readableDate = `${monthsList[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
    
    const groupDiv = document.createElement('div');
    groupDiv.classList.add('date-group');

    const heading = document.createElement('h3');
    heading.textContent = readableDate;
    groupDiv.appendChild(heading);

    if (filteredTasks.length === 0) {
        const noTask = document.createElement('div');
        noTask.textContent = "No tasks for this date.";
        groupDiv.appendChild(noTask);
    } else {
        filteredTasks.forEach((task, index) => {
            const card = document.createElement('div');
            card.classList.add('task-card');
            const taskDate = new Date(task.due);
            const timeStr = taskDate.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12:true});

            card.innerHTML = `
                <strong>${task.name}</strong><br>
                <small>${timeStr}</small><br>
                <small>Location: ${task.location} (${task.type})</small><br>
                <button style="margin-top:10px; background:#10b981; color:white; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;" onclick="completeTask(${index})">
                    Complete
                </button>
            `;
            groupDiv.appendChild(card);
        });
    }

    taskListDisplay.appendChild(groupDiv);
}

window.addEventListener('DOMContentLoaded', () => {
    const cancelButton = document.getElementById('cancelTaskButton');
    const inputArea = document.getElementById('inputArea');
    const addTaskButton = document.getElementById('addTaskButton');

    cancelButton.addEventListener('click', () => {
        inputArea.style.display = 'none';

        //Clear fields where we input the tasks
        document.getElementById('taskName').value = '';
        document.getElementById('dueDate').value = '';
        document.getElementById('locationInput').value = '';
        document.getElementById('locationType').value = 'Home';
    });

    addTaskButton.addEventListener('click', () => {
        inputArea.style.display = 'block';
    });
});


const closeMenuButton = document.getElementById('closeMenuButton');

closeMenuButton?.addEventListener('click', () => {
    menuOverlay.classList.remove('show');
});

// Close Menu when clicking a link
const menuLinks = document.querySelectorAll('.menuLink');

menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const currentPage = window.location.pathname.split('/').pop();
        const targetPage = this.getAttribute('data-page');

        if (currentPage === targetPage) {
            e.preventDefault(); // Don't reload
            menuOverlay.classList.remove('show'); // Just close
        }
        // Else: normal behavior
    });
});
