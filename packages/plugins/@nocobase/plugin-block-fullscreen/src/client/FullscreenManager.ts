/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

// Types - Using proper CSS property types instead of optional strings
interface StyleProperties {
  position?: CSSStyleDeclaration['position'];
  top?: CSSStyleDeclaration['top'];
  left?: CSSStyleDeclaration['left'];
  width?: CSSStyleDeclaration['width'];
  height?: CSSStyleDeclaration['height'];
  zIndex?: CSSStyleDeclaration['zIndex'];
  background?: CSSStyleDeclaration['background'];
  overflow?: CSSStyleDeclaration['overflow'];
  margin?: CSSStyleDeclaration['margin'];
  padding?: CSSStyleDeclaration['padding'];
  marginBottom?: CSSStyleDeclaration['marginBottom'];
  boxSizing?: CSSStyleDeclaration['boxSizing'];
  maxHeight?: CSSStyleDeclaration['maxHeight'];
  display?: CSSStyleDeclaration['display'];
}

interface ElementState {
  originalStyles: StyleProperties;
  hiddenElements: Array<{
    element: HTMLElement;
    originalDisplay: string;
  }>;
}

type StyleElement = HTMLStyleElement;

// Constants
const FULLSCREEN_STYLES: Required<StyleProperties> = {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100vw',
  height: '100vh',
  zIndex: '9999',
  background: '#fff',
  overflow: 'auto',
  margin: '0',
  padding: '0',
  marginBottom: '0',
  boxSizing: 'border-box',
  maxHeight: '100vh',
  display: 'block',
};

// Use Object.keys(FULLSCREEN_STYLES) instead of separate STYLES_TO_SAVE array
const STYLES_TO_SAVE = Object.keys(FULLSCREEN_STYLES) as Array<keyof StyleProperties>;

/**
 * FullscreenManager - Handles fullscreen display logic for DOM elements
 *
 * Features:
 * - Save and restore element states
 * - Apply and remove fullscreen styles
 * - Manage dynamic style injection
 * - Handle hiding/showing sibling elements
 */
export class FullscreenManager {
  private elementStates = new Map<string, ElementState>();
  private fullscreenStyleElement: StyleElement | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;

  /**
   * Process fullscreen style string and replace placeholders
   * Using regex for better browser compatibility instead of replaceAll
   * @param style - CSS style string
   * @param blockId - Element ID
   * @returns Processed style string
   */
  private processFullscreenStyle(style: string, blockId: string): string {
    // Use regex instead of replaceAll for better browser compatibility
    return style.replace(/\$\{blockId\}/g, `#${blockId} `);
  }

  /**
   * Add scoped style to document head
   * @param cssString - CSS string
   * @returns Created style element
   */
  private addScopedStyle(cssString: string): StyleElement {
    const styleElement = document.createElement('style');
    styleElement.textContent = cssString;
    document.head.appendChild(styleElement);
    return styleElement;
  }

  /**
   * Remove added style element
   * @param styleElementToRemove - Style element to remove
   */
  private removeAddedStyle(styleElementToRemove: StyleElement | null): void {
    if (styleElementToRemove?.parentNode) {
      styleElementToRemove.parentNode.removeChild(styleElementToRemove);
    }
  }

  /**
   * Save element's current state (styles and sibling element states)
   * @param element - Target element
   * @returns Saved state object
   */
  private saveElementState(element: HTMLElement): ElementState {
    const state: ElementState = {
      originalStyles: {},
      hiddenElements: [],
    };

    // Save original styles
    STYLES_TO_SAVE.forEach((prop) => {
      state.originalStyles[prop] = element.style[prop as any] || '';
    });

    // Hide sibling elements and save their states
    let current: HTMLElement | null = element;
    while (current && current !== document.body) {
      if (current.parentElement) {
        Array.from(current.parentElement.children).forEach((sibling) => {
          if (sibling !== current && !current!.contains(sibling) && !sibling.contains(current!)) {
            const siblingElement = sibling as HTMLElement;
            const originalDisplay = window.getComputedStyle(siblingElement).display;
            state.hiddenElements.push({
              element: siblingElement,
              originalDisplay,
            });
            siblingElement.style.display = 'none';
          }
        });
      }
      current = current.parentElement;
    }

    return state;
  }

  /**
   * Restore element's state (styles and sibling element states)
   * @param element - Target element
   * @param state - State to restore
   */
  private restoreElementState(element: HTMLElement, state: ElementState): void {
    // Clear fullscreen styles
    STYLES_TO_SAVE.forEach((prop) => {
      element.style[prop as any] = '';
    });

    // Restore original styles
    Object.entries(state.originalStyles).forEach(([prop, value]) => {
      if (value !== undefined && value !== null) {
        element.style[prop as any] = value;
      }
    });

    // Restore hidden elements
    state.hiddenElements.forEach(({ element: hiddenElement, originalDisplay }) => {
      try {
        if (hiddenElement?.nodeType === Node.ELEMENT_NODE) {
          hiddenElement.style.display = originalDisplay;
        }
      } catch (e) {
        console.warn('Failed to restore element display:', e);
      }
    });
  }

  /**
   * Toggle element's fullscreen state
   * @param element - Element to toggle
   * @param isFullscreen - Whether to enter fullscreen
   * @param fullscreenStyle - Custom fullscreen style
   */
  public toggleFullscreen(element: HTMLElement, isFullscreen: boolean, fullscreenStyle = ''): void {
    try {
      if (isFullscreen) {
        // Enter fullscreen: save state and apply fullscreen styles
        const state = this.saveElementState(element);
        this.elementStates.set(element.id, state);

        // Apply fullscreen styles
        Object.entries(FULLSCREEN_STYLES).forEach(([prop, value]) => {
          element.style[prop as any] = value;
        });

        // Add custom styles
        if (fullscreenStyle) {
          const processedStyle = this.processFullscreenStyle(fullscreenStyle, element.id);
          this.fullscreenStyleElement = this.addScopedStyle(processedStyle);
        }
      } else {
        // Exit fullscreen: restore state
        const state = this.elementStates.get(element.id);
        if (!state) {
          console.warn('No saved state found for element', element.id);
          return;
        }

        this.restoreElementState(element, state);
        this.elementStates.delete(element.id);

        // Remove custom styles
        if (this.fullscreenStyleElement) {
          this.removeAddedStyle(this.fullscreenStyleElement);
          this.fullscreenStyleElement = null;
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  }

  /**
   * Check if element is in fullscreen state
   * @param element - Element to check
   * @returns Whether element is in fullscreen state
   */
  public isElementFullscreen(element: HTMLElement): boolean {
    return this.elementStates.has(element.id);
  }

  /**
   * Force exit fullscreen state for specified element
   * @param element - Element to exit fullscreen
   */
  public exitFullscreen(element: HTMLElement): void {
    if (this.isElementFullscreen(element)) {
      this.toggleFullscreen(element, false);
    }
  }

  /**
   * Clean up all fullscreen states (for component unmounting)
   * Added better error handling for invalid element IDs
   */
  public cleanup(): void {
    // Clear any pending cleanup timer
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    // Restore all fullscreen elements
    this.elementStates.forEach((_, elementId) => {
      try {
        const element = document.getElementById(elementId);
        if (element && element.nodeType === Node.ELEMENT_NODE) {
          this.exitFullscreen(element);
        } else {
          // Remove invalid element ID from states
          this.elementStates.delete(elementId);
        }
      } catch (error) {
        console.warn(`Failed to cleanup element with ID: ${elementId}`, error);
        // Remove problematic element from states
        this.elementStates.delete(elementId);
      }
    });

    // Clear states
    this.elementStates.clear();

    // Remove style elements
    if (this.fullscreenStyleElement) {
      this.removeAddedStyle(this.fullscreenStyleElement);
      this.fullscreenStyleElement = null;
    }
  }

  /**
   * Schedule periodic cleanup to prevent memory leaks
   * @param intervalMs - Cleanup interval in milliseconds (default: 5 minutes)
   */
  public schedulePeriodicCleanup(intervalMs = 300000): void {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
    }

    this.cleanupTimer = setTimeout(() => {
      // Clean up invalid element references
      const invalidIds: string[] = [];
      this.elementStates.forEach((_, elementId) => {
        const element = document.getElementById(elementId);
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
          invalidIds.push(elementId);
        }
      });

      invalidIds.forEach((id) => this.elementStates.delete(id));

      // Schedule next cleanup
      this.schedulePeriodicCleanup(intervalMs);
    }, intervalMs);
  }
}

// Export singleton instance
export const fullscreenManager = new FullscreenManager();
