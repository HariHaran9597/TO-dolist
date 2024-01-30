document.addEventListener('DOMContentLoaded', function() {
  const taskInput = document.getElementById('taskInput');
  const addTaskButton = document.getElementById('addTask');
  const taskList = document.getElementById('taskList');
  const clearCompletedButton = document.getElementById('clearCompleted');
  const searchTaskInput = document.getElementById('searchTask');
  const filterPrioritySelect = document.getElementById('filterPriority');

  // Load tasks from storage on extension popup open
  loadTasks();

  // Add task event
  addTaskButton.addEventListener('click', function() {
    const taskText = taskInput.value.trim();
    if (taskText !== '') {
      addTask(taskText);
      saveTasks();
      taskInput.value = '';
    }
  });

  // Delete, complete, and clear completed task events (event delegation)
  taskList.addEventListener('click', function(event) {
    const target = event.target;
    if (target.classList.contains('delete-task')) {
      const li = target.parentElement;
      taskList.removeChild(li);
      saveTasks();
    } else if (target.classList.contains('complete-task')) {
      const taskText = target.parentElement.querySelector('.task-text');
      taskText.classList.toggle('completed-task');
      saveTasks();
    } else if (target.classList.contains('edit-task')) {
      const taskText = target.parentElement.querySelector('.task-text');
      const newText = prompt('Edit task:', taskText.textContent);
      if (newText !== null) {
        taskText.textContent = newText;
        saveTasks();
      }
    }
  });

  // Clear completed tasks event
  clearCompletedButton.addEventListener('click', function() {
    const completedTasks = Array.from(taskList.getElementsByClassName('completed-task'));
    completedTasks.forEach(task => {
      taskList.removeChild(task.parentElement);
    });
    saveTasks();
  });

  // Search and filter tasks event
  searchTaskInput.addEventListener('input', function() {
    filterTasks();
  });

  filterPrioritySelect.addEventListener('change', function() {
    filterTasks();
  });

  // Function to filter tasks based on search and priority
  function filterTasks() {
    const searchTerm = searchTaskInput.value.toLowerCase();
    const priorityFilter = filterPrioritySelect.value.toLowerCase();

    Array.from(taskList.children).forEach(li => {
      const taskText = li.querySelector('.task-text').textContent.toLowerCase();
      const priority = li.querySelector('.priority').value.toLowerCase();

      const isMatchingSearch = taskText.includes(searchTerm);
      const isMatchingPriority = priorityFilter === '' || priority === priorityFilter;

      li.style.display = isMatchingSearch && isMatchingPriority ? 'flex' : 'none';
    });
  }

  // Function to add a task
  function addTask(text) {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="task-text">${text}</span>
      <span class="edit-task">&#9998;</span>
      <span class="complete-task">&#10004;</span>
      <span class="delete-task">&#10008;</span>
      <input type="date" class="due-date" placeholder="Due Date">
      <select class="priority">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    `;
    taskList.appendChild(li);
  }

  // Function to save tasks to storage
  function saveTasks() {
    const tasks = Array.from(taskList.children).map(li => {
      const taskText = li.querySelector('.task-text').textContent;
      const isCompleted = li.querySelector('.task-text').classList.contains('completed-task');
      const dueDate = li.querySelector('.due-date').value;
      const priority = li.querySelector('.priority').value;
      return { text: taskText, completed: isCompleted, dueDate, priority };
    });
    chrome.storage.sync.set({ tasks });
  }

  // Function to load tasks from storage
  function loadTasks() {
    chrome.storage.sync.get(['tasks'], function(result) {
      if (result.tasks) {
        result.tasks.forEach(task => {
          addTask(task.text);
          if (task.completed) {
            const lastLi = taskList.lastChild;
            lastLi.querySelector('.task-text').classList.add('completed-task');
          }
          const lastLi = taskList.lastChild;
          lastLi.querySelector('.due-date').value = task.dueDate || '';
          lastLi.querySelector('.priority').value = task.priority || 'low';
        });
      }
    });
  }
});
