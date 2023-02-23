'use strict';

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
  }

  _checkTask(evt) {
    const input = evt.target.closest('.tasks__input');
    if (!input) return;

    const task = this.#tasks.find(task => task.id === input.id);
    task.checked = !task.checked;
    this._setTasks();
  }

  _deleteTask(evt) {
    const button = evt.target.closest('.tasks__delete');
    if (!button) return;

    const currentID = button.previousElementSibling.getAttribute('for');
    this.#tasks = this.#tasks.filter(task => task.id !== currentID);
    this._setTasks();

    button.parentElement.remove();
  }

  _setTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.#tasks));
  }

  _getTasks() {
    const data = JSON.parse(localStorage.getItem('tasks'));
    if (!data) return;
    this.#tasks = data;
    this.#tasks.forEach(task => this._renderTask(task));
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
