'use strict';

const TEST_DATA = [
  {
    checked: false,
    id: 1,
    content: 'Complete Todo App on Frontend Mentor',
  },
  {
    checked: false,
    id: 2,
    content: 'Pick up groceries',
  },
  {
    checked: false,
    id: 3,
    content: 'Read for 1 hour',
  },
  {
    checked: false,
    id: 4,
    content: '10 minutes meditation',
  },
  {
    checked: false,
    id: 5,
    content: 'Jog around the park 3x',
  },
  {
    checked: true,
    id: 6,
    content: 'Complete online JavaScript course',
  },
];

class Task {
  checked = false;
  id = (Date.now() + '').slice(-10);

  constructor(content) {
    this.content = content;
  }
}

const themeToggle = document.querySelector('.header__theme-toggle');
const darkThemeStyles = document.head.querySelector(
  'link[rel=stylesheet][media*=prefers-color-scheme][media*=dark]'
);
const formElement = document.querySelector('.header__form');
const inputElement = document.querySelector('.header__input');
const taskListElement = document.querySelector('.tasks__list');
const taskFooterElement = document.querySelector('.tasks__footer');
const taskFilterElement = document.querySelector('.tasks__filter');
const taskAmountElement = document.querySelector('.tasks__amount');

class App {
  #colorTheme;
  #tasks = [];

  constructor() {
    this._getTasks();
    this._getCurrentTheme();
    this._applyTheme();

    formElement.addEventListener('submit', this._newTask.bind(this));
    taskListElement.addEventListener('click', this._deleteTask.bind(this));
    taskListElement.addEventListener('change', this._checkTask.bind(this));
    taskFooterElement.addEventListener(
      'click',
      this._deleteCompleted.bind(this)
    );
    taskFilterElement.addEventListener('change', this._filterTasks.bind(this));
    themeToggle.addEventListener('click', this._changeTheme.bind(this));
  }

  _newTask(evt) {
    evt.preventDefault();
    const content = inputElement.value;
    if (!content) return;
    inputElement.value = '';
    const task = new Task(content);
    this.#tasks.push(task);
    this._renderTask(task);
    this._setTasks();
    this._toggleFilter();
  }

  _renderTask(task) {
    let html = `
      <li class="tasks__item">
        <input class="tasks__input" type="checkbox" name="task-item" id="${
          task.id
        }" ${task.checked && 'checked'}>
        <label class="tasks__text" for="${task.id}" tabindex="0">${
      task.content
    }</label>
        <button class="tasks__delete" type="button">
          <span class="visually-hidden">Delete task</span>
        </button>
      </li>
    `;

    taskListElement.insertAdjacentHTML('afterbegin', html);
    this._renderActiveAmount();
  }

  _checkTask(evt) {
    const input = evt.target.closest('.tasks__input');
    if (!input) return;

    const task = this.#tasks.find(task => task.id === input.id);
    task.checked = !task.checked;
    this._renderActiveAmount();
    this._setTasks();
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
    this._setTasks();
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
          .forEach(task => this._renderTask(task));
        break;
      }
      case 'completed': {
        this.#tasks
          .filter(task => task.checked)
          .forEach(task => this._renderTask(task));
        break;
      }
      default: {
        this.#tasks.forEach(task => this._renderTask(task));
      }
    }
  }

  _setTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.#tasks));
  }

  _getTasks() {
    const data = JSON.parse(localStorage.getItem('tasks'));
    if (!data) {
      this.#tasks = TEST_DATA;
    } else {
      this.#tasks = data;
    }
    this.#tasks.forEach(task => this._renderTask(task));
    this._toggleFilter();
  }

  _renderActiveAmount() {
    let activeTasks = 0;
    this.#tasks.forEach(task => !task.checked && activeTasks++);
    taskAmountElement.textContent = `${activeTasks} items left`;
  }

  _toggleFilter() {
    if (this.#tasks.length === 0) {
      taskFooterElement.classList.add('tasks__footer--hidden');
      taskFilterElement.classList.add('filter--hidden');
    } else {
      taskFooterElement.classList.remove('tasks__footer--hidden');
      taskFilterElement.classList.remove('filter--hidden');
    }
  }

  _applyTheme() {
    const darkThemeMediaMap = {
      auto: '(prefers-color-scheme: dark)',
      light: 'not all',
      dark: 'all',
    };
    darkThemeStyles.media = darkThemeMediaMap[this.#colorTheme];
  }

  _changeTheme() {
    let newTheme;
    if (this.#colorTheme === 'auto') {
      newTheme = window.matchMedia('(prefers-color-scheme: dark)')
        ? 'light'
        : 'dark';
    } else {
      newTheme = this.#colorTheme === 'dark' ? 'light' : 'dark';
    }
    this.#colorTheme = newTheme;
    this._setCurrentTheme();
    this._applyTheme();
  }

  _setCurrentTheme() {
    localStorage.setItem('color-theme', this.#colorTheme);
  }

  _getCurrentTheme() {
    const data = localStorage.getItem('color-theme');
    this.#colorTheme = data || 'auto';
  }
}

const app = new App();
