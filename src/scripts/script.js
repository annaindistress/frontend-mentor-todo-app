'use strict';

const themeToggle = document.querySelector('.header__theme-toggle');
const darkThemeStyles = document.head.querySelector(
  'link[rel=stylesheet][media*=prefers-color-scheme][media*=dark]'
);

class App {
  #colorTheme;

  constructor() {
    this._getCurrentTheme();
    this._applyTheme();

    themeToggle.addEventListener('click', this._changeTheme.bind(this));
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
