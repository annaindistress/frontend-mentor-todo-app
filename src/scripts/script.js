'use strict';

const TEST_DATA = [
  {
    id: 1,
    content: 'Complete Todo App on Frontend Mentor',
    checked: false,
  },
  {
    id: 2,
    content: 'Pick up groceries',
    checked: false,
  },
  {
    id: 3,
    content: 'Read for 1 hour',
    checked: false,
  },
  {
    id: 4,
    content: '10 minutes meditation',
    checked: false,
  },
  {
    id: 5,
    content: 'Jog around the park 3x',
    checked: false,
  },
  {
    id: 6,
    content: 'Complete online JavaScript course',
    checked: true,
  },
];

const docStyles = document.head.querySelector('link[rel=stylesheet]');
const themeToggle = document.querySelector('.header__theme-toggle');
const formElement = document.querySelector('.header__form');
const inputElement = document.querySelector('.header__input');
const taskListElement = document.querySelector('.tasks__list');
const taskFooterElement = document.querySelector('.tasks__footer');
const taskFilterElement = document.querySelector('.tasks__filter');
const taskAmountElement = document.querySelector('.tasks__amount');
const taskInstructionElement = document.querySelector('.task__instruction');

class Task {
  constructor(content, id = '', checked = false) {
    this.content = content;
    this.id = id === '' ? (Date.now() + '').slice(-10) : id;
    this.checked = checked;
  }

  changeChecked() {
    this.checked = !this.checked;
  }
}

class App {
  #colorTheme;
  #tasks = [];
  #draggableElementOrder = null;
  #draggableElementHeight = 0;

  constructor() {
    const darkThemeElement = document.createElement('link');
    darkThemeElement.rel = 'stylesheet';
    darkThemeElement.href = './dark-theme.css';
    darkThemeElement.media = '(prefers-color-scheme: dark)';
    docStyles.after(darkThemeElement);

    this._getColorTheme();
    this._getTasks();

    themeToggle.addEventListener('click', this._changeColorTheme.bind(this));
    formElement.addEventListener('submit', this._newTask.bind(this));
    taskListElement.addEventListener('change', this._checkTask.bind(this));
    taskListElement.addEventListener('click', this._deleteTask.bind(this));
    taskFooterElement.addEventListener(
      'click',
      this._deleteCompleted.bind(this)
    );
    taskFilterElement.addEventListener('change', this._filterTasks.bind(this));
  }

  _getColorTheme() {
    const data = localStorage.getItem('color-theme');
    this.#colorTheme = data || 'auto';
    this._applyColorTheme();
  }

  _setСolorTheme() {
    localStorage.setItem('color-theme', this.#colorTheme);
  }

  _applyColorTheme() {
    const darkThemeMediaMap = {
      auto: '(prefers-color-scheme: dark)',
      light: 'not all',
      dark: 'all',
    };
    const darkThemeStyles = document.head.querySelector(
      'link[rel=stylesheet][href$="dark-theme.css"]'
    );
    darkThemeStyles.media = darkThemeMediaMap[this.#colorTheme];
  }

  _changeColorTheme() {
    let newTheme;
    if (this.#colorTheme === 'auto') {
      newTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'light'
        : 'dark';
    } else {
      newTheme = this.#colorTheme === 'dark' ? 'light' : 'dark';
    }
    this.#colorTheme = newTheme;
    this._setСolorTheme();
    this._applyColorTheme();
  }

  _getTasks() {
    let data = JSON.parse(localStorage.getItem('tasks'));
    if (!data) data = TEST_DATA;
    data.forEach((item, index) => {
      const task = new Task(item.content, item.id, item.checked);
      this.#tasks.push(task);
      this._renderTask(task, index);
    });
    this._setTasks();
    this._toggleFilter();
    this._renderActiveAmount();
  }

  _setTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.#tasks));
  }

  _renderTask(task, order) {
    const li = document.createElement('li');
    li.classList.add('tasks__item');
    li.draggable = true;
    li.dataset.order = order;
    li.innerHTML = `
      <input class="tasks__input" type="checkbox" name="task-item" id="${
        task.id
      }" ${task.checked ? 'checked' : ''}>
      <label class="tasks__text" for="${task.id}" tabindex="0">${
      task.content
    }</label>
      <button class="tasks__delete" type="button">
        <span class="visually-hidden">Delete task</span>
      </button>
    `;

    taskListElement.prepend(li);

    li.addEventListener('dragstart', this._handleDragStart.bind(this));
    li.addEventListener('dragend', this._handleDragEnd.bind(this));
    li.addEventListener('dragover', this._handleDragOver.bind(this));
    li.addEventListener('dragleave', this._handleDragLeave.bind(this));
    li.addEventListener('drop', this._handleDragDrop.bind(this));
  }

  _toggleFilter() {
    if (this.#tasks.length === 0) {
      taskFooterElement.classList.add('tasks__footer--hidden');
      taskFilterElement.classList.add('filter--hidden');
      taskInstructionElement.classList.add('task__instruction--hidden');
    } else {
      taskFooterElement.classList.remove('tasks__footer--hidden');
      taskFilterElement.classList.remove('filter--hidden');
      taskInstructionElement.classList.remove('task__instruction--hidden');
    }
  }

  _renderActiveAmount() {
    let activeTasks = 0;
    this.#tasks.forEach(task => !task.checked && activeTasks++);
    taskAmountElement.textContent = `${activeTasks} items left`;
  }

  _filterTasks(evt) {
    const filterType = evt.target.closest('.filter__radio').value;
    if (!filterType) return;

    const taskElements = document.querySelectorAll('.tasks__item');
    taskElements.forEach(elem => elem.remove());

    switch (filterType) {
      case 'active': {
        this.#tasks
          .filter(task => !task.checked)
          .forEach((task, index) => this._renderTask(task, index));
        break;
      }
      case 'completed': {
        this.#tasks
          .filter(task => task.checked)
          .forEach((task, index) => this._renderTask(task, index));
        break;
      }
      default: {
        this.#tasks.forEach((task, index) => this._renderTask(task, index));
      }
    }
  }

  _newTask(evt) {
    evt.preventDefault();
    const content = inputElement.value;
    if (!content) return;
    inputElement.value = '';
    const task = new Task(content);
    this.#tasks.push(task);
    this._renderTask(task, this.#tasks.length - 1);
    this._setTasks();
    this._toggleFilter();
    this._renderActiveAmount();
  }

  _checkTask(evt) {
    const input = evt.target.closest('.tasks__input');
    if (!input) return;
    const task = this.#tasks.find(task => task.id == input.id);
    task.changeChecked();
    this._setTasks();
    this._renderActiveAmount();
  }

  _deleteTask(evt) {
    const button = evt.target.closest('.tasks__delete');
    if (!button) return;

    const currentID = button.previousElementSibling.getAttribute('for');
    this.#tasks = this.#tasks.filter(task => task.id !== currentID);
    this._setTasks();

    button.parentElement.remove();
    this._toggleFilter();
  }

  _deleteCompleted(evt) {
    const button = evt.target.closest('.tasks__clear');
    if (!button) return;

    this.#tasks.forEach(task => {
      if (task.checked) {
        document.getElementById(`${task.id}`).parentNode.remove();
      }
    });

    this.#tasks = this.#tasks.filter(task => !task.checked);
    this._toggleFilter();
    this._setTasks();
  }

  _handleDragStart(evt) {
    this.#draggableElementOrder = evt.target.dataset.order;
    this.#draggableElementHeight = evt.target.offsetHeight;
    taskListElement.style.height = taskListElement.offsetHeight + 'px';
    setTimeout(() => {
      evt.target.style.display = 'none';
    }, 0);
    taskListElement.style.height =
      taskListElement.offsetHeight - this.#draggableElementHeight + 'px';
  }

  _handleDragEnd(evt) {
    evt.target.style.display = 'flex';
    taskListElement.style.height =
      taskListElement.offsetHeight + this.#draggableElementHeight + 'px';
  }

  _handleDragOver(evt) {
    evt.preventDefault();
    if (evt.target.parentElement.classList.contains('tasks__item'))
      evt.target.parentElement.classList.add('tasks__item--dragged-over');
    if (evt.target.classList.contains('tasks__item'))
      evt.target.classList.add('tasks__item--dragged-over');
  }

  _handleDragLeave(evt) {
    if (evt.target.parentElement.classList.contains('tasks__item'))
      evt.target.parentElement.classList.remove('tasks__item--dragged-over');
    if (evt.target.classList.contains('tasks__item'))
      evt.target.classList.remove('tasks__item--dragged-over');
  }

  _handleDragDrop(evt) {
    this._handleDragLeave(evt);
    if (evt.target.parentElement.classList.contains('tasks__item')) {
      const target = evt.target.parentElement.dataset.order;
      this._changeTasksOrder(target);
    }
  }

  _changeTasksOrder(target) {
    const current = this.#draggableElementOrder;
    const currentTask = this.#tasks[current];

    this.#tasks.splice(current, 1);
    this.#tasks.splice(target, 0, currentTask);

    taskListElement.innerHTML = '';
    this.#tasks.forEach((task, index) => this._renderTask(task, index));
    this._setTasks();
  }
}

const app = new App();
