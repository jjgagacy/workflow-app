(function () {
  'use strict';

  // 配置
  const CONFIG = {
    hoverDelay: 200,    // 悬停延迟显示
    leaveDelay: 150,    // 离开延迟隐藏
    touchDelay: 300,    // 触摸设备延迟
    adjustPosition: true // 是否调整位置
  };

  class NavigationDropdown {
    constructor() {
      this.triggers = [];
      this.timeouts = new Map();
      this.isTouchDevice = 'ontouchstart' in window;
      this.init();
    }

    init() {
      // 查找所有下拉菜单触发器
      this.triggers = Array.from(document.querySelectorAll('[data-dropdown-trigger]'));

      if (this.triggers.length === 0) return;

      // 为每个触发器设置事件
      this.triggers.forEach(trigger => {
        this.setupTrigger(trigger);
      });

      // 点击页面其他地方关闭所有下拉菜单
      document.addEventListener('click', (e) => {
        if (!e.target.closest('[data-dropdown-trigger]')) {
          this.closeAllDropdowns();
        }
      });

      // ESC键关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeAllDropdowns();
        }
      });

      // 窗口调整时重新计算位置
      if (CONFIG.adjustPosition) {
        window.addEventListener('resize', () => {
          this.adjustAllDropdowns();
        });
      }
    }

    setupTrigger(trigger) {
      const button = trigger.querySelector('button[aria-controls]');
      const dropdownId = button?.getAttribute('aria-controls');
      const dropdown = dropdownId ? document.getElementById(dropdownId) : null;

      if (!button || !dropdown) return;

      // 从data属性获取延迟配置
      const hoverDelay = parseInt(trigger.dataset.hoverDelay) || CONFIG.hoverDelay;
      const leaveDelay = parseInt(trigger.dataset.leaveDelay) || CONFIG.leaveDelay;

      // 鼠标事件（桌面设备）
      if (!this.isTouchDevice) {
        trigger.addEventListener('mouseenter', () => this.showDropdown(trigger, dropdown, button, hoverDelay));
        trigger.addEventListener('mouseleave', () => this.hideDropdown(trigger, dropdown, button, leaveDelay));

        dropdown.addEventListener('mouseenter', () => this.cancelHide(trigger));
        dropdown.addEventListener('mouseleave', () => this.hideDropdown(trigger, dropdown, button, leaveDelay));
      }

      // 触摸设备事件
      if (this.isTouchDevice) {
        let touchStartTime;

        trigger.addEventListener('touchstart', (e) => {
          touchStartTime = Date.now();
          e.preventDefault();
        });

        trigger.addEventListener('touchend', (e) => {
          const touchDuration = Date.now() - touchStartTime;

          if (touchDuration < CONFIG.touchDelay) {
            // 短按：切换显示/隐藏
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
              this.hideDropdown(trigger, dropdown, button, 0);
            } else {
              this.showDropdown(trigger, dropdown, button, 0);
            }
          }
          e.preventDefault();
        });

        // 点击外部关闭
        document.addEventListener('touchstart', (e) => {
          if (!trigger.contains(e.target)) {
            this.hideDropdown(trigger, dropdown, button, 0);
          }
        });
      }

      // 键盘导航支持
      button.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault();
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
              this.hideDropdown(trigger, dropdown, button, 0);
            } else {
              this.showDropdown(trigger, dropdown, button, 0);
            }
            break;
          case 'ArrowDown':
            e.preventDefault();
            this.showDropdown(trigger, dropdown, button, 0);
            this.focusFirstMenuItem(dropdown);
            break;
        }
      });

      // 下拉菜单内的键盘导航
      dropdown.addEventListener('keydown', (e) => {
        const menuItems = Array.from(dropdown.querySelectorAll('a[role="menuitem"], button[role="menuitem"]'));
        const currentIndex = menuItems.indexOf(document.activeElement);

        switch (e.key) {
          case 'Escape':
            e.preventDefault();
            this.hideDropdown(trigger, dropdown, button, 0);
            button.focus();
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (currentIndex < menuItems.length - 1) {
              menuItems[currentIndex + 1].focus();
            }
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (currentIndex > 0) {
              menuItems[currentIndex - 1].focus();
            } else {
              button.focus();
              this.hideDropdown(trigger, dropdown, button, 0);
            }
            break;
          case 'Tab':
            if (!e.shiftKey && currentIndex === menuItems.length - 1) {
              e.preventDefault();
              this.hideDropdown(trigger, dropdown, button, 0);
            }
            break;
        }
      });
    }

    showDropdown(trigger, dropdown, button, delay = 0) {
      this.cancelHide(trigger);

      const timeoutId = setTimeout(() => {
        // 先关闭其他打开的下拉菜单
        this.closeAllDropdowns(trigger);

        // 显示当前下拉菜单
        dropdown.classList.remove('hidden');
        dropdown.classList.add('flex');
        button.setAttribute('aria-expanded', 'true');
        dropdown.setAttribute('aria-hidden', 'false');

        // 调整位置
        if (CONFIG.adjustPosition) {
          this.adjustDropdownPosition(dropdown);
        }

        // 添加动画类
        dropdown.classList.add('animate-fadeIn');
      }, delay);

      this.timeouts.set(trigger, { show: timeoutId });
    }

    hideDropdown(trigger, dropdown, button, delay = 0) {
      this.cancelShow(trigger);

      const timeoutId = setTimeout(() => {
        dropdown.classList.remove('flex', 'animate-fadeIn');
        dropdown.classList.add('hidden');
        button.setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('aria-hidden', 'true');
      }, delay);

      this.timeouts.set(trigger, { ...this.timeouts.get(trigger), hide: timeoutId });
    }

    cancelShow(trigger) {
      const timeouts = this.timeouts.get(trigger);
      if (timeouts?.show) {
        clearTimeout(timeouts.show);
        this.timeouts.delete(trigger);
      }
    }

    cancelHide(trigger) {
      const timeouts = this.timeouts.get(trigger);
      if (timeouts?.hide) {
        clearTimeout(timeouts.hide);
        this.timeouts.delete(trigger);
      }
    }

    closeAllDropdowns(excludeTrigger = null) {
      this.triggers.forEach(trigger => {
        if (trigger === excludeTrigger) return;

        const button = trigger.querySelector('button[aria-controls]');
        const dropdownId = button?.getAttribute('aria-controls');
        const dropdown = dropdownId ? document.getElementById(dropdownId) : null;

        if (dropdown && !dropdown.classList.contains('hidden')) {
          this.hideDropdown(trigger, dropdown, button, 0);
        }
      });
    }

    adjustDropdownPosition(dropdown) {
      const rect = dropdown.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const margin = 16;

      let translateX = -50; // 默认居中

      // 检查左侧溢出
      if (rect.left < margin) {
        const overflow = margin - rect.left;
        translateX += (overflow / rect.width) * 100;
      }

      // 检查右侧溢出
      if (rect.right > viewportWidth - margin) {
        const overflow = rect.right - (viewportWidth - margin);
        translateX -= (overflow / rect.width) * 100;
      }

      // 应用调整
      dropdown.style.transform = `translateX(${translateX}%) translateY(0)`;
    }

    adjustAllDropdowns() {
      this.triggers.forEach(trigger => {
        const button = trigger.querySelector('button[aria-controls]');
        const dropdownId = button?.getAttribute('aria-controls');
        const dropdown = dropdownId ? document.getElementById(dropdownId) : null;

        if (dropdown && !dropdown.classList.contains('hidden')) {
          this.adjustDropdownPosition(dropdown);
        }
      });
    }

    focusFirstMenuItem(dropdown) {
      const firstMenuItem = dropdown.querySelector('a[role="menuitem"], button[role="menuitem"]');
      if (firstMenuItem) {
        firstMenuItem.focus();
      }
    }
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new NavigationDropdown();
    });
  } else {
    new NavigationDropdown();
  }
})();