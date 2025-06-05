/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { RecursionField, observer, useField, useFieldSchema } from '@formily/react';
import { ISchema } from '@formily/json-schema';
import React, { useRef, useState, useEffect, useMemo, CSSProperties } from 'react';
import { useDesignable } from '@nocobase/client';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { nanoid } from 'nanoid';
import { fullscreenManager } from './FullscreenManager';

// Type definitions for better type safety
interface FullscreenBlockProps {
  children?: React.ReactNode;
}

interface ButtonConfig {
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'custom';
  customAnchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  customX?: number;
  customY?: number;
  opacity: number;
  backgroundColor: string;
  iconColor: string;
  borderRadius: number;
}

interface FullscreenBlockSchema extends ISchema {
  'x-component-props'?: {
    custom?: {
      fullscreenStyle?: string;
      buttonConfig?: ButtonConfig;
    };
  };
}

// Extract inline styles as constants for better performance
const CONTAINER_BASE_STYLE: CSSProperties = {
  width: '100%',
  display: 'flex',
  position: 'relative',
  transition: 'all 0.2s',
};

const DESIGN_MODE_STYLE: CSSProperties = {
  background: 'rgba(0, 153, 255, 0.06)',
  border: '2px dashed #0099ff',
  padding: '16px 8px 8px 8px',
  marginBottom: '8px',
};

const HINT_TEXT_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  background: '#e6f7ff',
  color: '#096dd9',
  fontWeight: 500,
  fontSize: 13,
  padding: '4px 12px',
  borderBottom: '1px solid #91d5ff',
  zIndex: 2,
};

const BUTTON_BASE_STYLE: CSSProperties = {
  position: 'absolute',
  zIndex: 3,
  transition: 'opacity 0.3s',
};

// Helper function to generate button position styles
const getButtonPositionStyle = (config?: ButtonConfig): CSSProperties => {
  const defaultConfig: ButtonConfig = {
    position: 'top-right',
    customAnchor: 'top-right',
    customX: 8,
    customY: 8,
    opacity: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    iconColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
  };

  const finalConfig = { ...defaultConfig, ...config };

  const baseStyle: CSSProperties = {
    opacity: finalConfig.opacity / 100,
    background: finalConfig.backgroundColor,
    color: finalConfig.iconColor,
    borderRadius: `${finalConfig.borderRadius}%`,
  };

  switch (finalConfig.position) {
    case 'top-left':
      return { ...baseStyle, top: '8px', left: '8px' };
    case 'bottom-right':
      return { ...baseStyle, bottom: '8px', right: '8px' };
    case 'bottom-left':
      return { ...baseStyle, bottom: '8px', left: '8px' };
    case 'custom': {
      const anchor = finalConfig.customAnchor || 'top-right';
      const x = finalConfig.customX || 8;
      const y = finalConfig.customY || 8;

      switch (anchor) {
        case 'top-left':
          return { ...baseStyle, top: `${y}px`, left: `${x}px` };
        case 'top-right':
          return { ...baseStyle, top: `${y}px`, right: `${x}px` };
        case 'bottom-left':
          return { ...baseStyle, bottom: `${y}px`, left: `${x}px` };
        case 'bottom-right':
          return { ...baseStyle, bottom: `${y}px`, right: `${x}px` };
        default:
          return { ...baseStyle, top: `${y}px`, right: `${x}px` };
      }
    }
    case 'top-right':
    default:
      return { ...baseStyle, top: '8px', right: '8px' };
  }
};

/**
 * FullscreenBlock Component - Handles plugin-related UI logic and user interactions
 *
 * Responsibilities:
 * - Handle React component state management
 * - Render UI interface and interactive elements
 * - Call fullscreen manager to execute fullscreen logic
 * - Handle component lifecycle events
 */
export const FullscreenBlock: React.FC<FullscreenBlockProps> = observer(() => {
  const field = useField();
  const schema = useFieldSchema() as FullscreenBlockSchema;
  const { designable } = useDesignable();
  const rootElementRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Memoize container style to avoid recreation on every render
  const containerStyle = useMemo(
    (): CSSProperties => ({
      ...CONTAINER_BASE_STYLE,
      ...(designable ? DESIGN_MODE_STYLE : {}),
    }),
    [designable],
  );

  // Memoize content style
  const contentStyle = useMemo(
    (): CSSProperties => ({
      marginTop: designable ? 32 : 0,
      flex: 1,
    }),
    [designable],
  );

  // Get button configuration from schema
  const buttonConfig = schema?.['x-component-props']?.custom?.buttonConfig;

  // Memoize button style
  const buttonStyle = useMemo(
    (): CSSProperties => ({
      ...BUTTON_BASE_STYLE,
      ...getButtonPositionStyle(buttonConfig),
    }),
    [buttonConfig],
  );

  // Clean up fullscreen state when component unmounts
  useEffect(() => {
    return () => {
      if (rootElementRef.current) {
        fullscreenManager.exitFullscreen(rootElementRef.current);
      }
    };
  }, []);

  /**
   * Handle fullscreen toggle event
   */
  const handleFullscreenToggle = () => {
    if (!rootElementRef.current) {
      return;
    }

    // Ensure element has unique ID
    if (!rootElementRef.current.id) {
      rootElementRef.current.id = `fullscreen-block-container-${nanoid()}`;
    }

    // Get custom fullscreen style with proper type checking
    const customStyleConfig = schema?.['x-component-props']?.custom;
    const customStyle =
      customStyleConfig &&
      typeof customStyleConfig === 'object' &&
      'fullscreenStyle' in customStyleConfig &&
      typeof customStyleConfig.fullscreenStyle === 'string'
        ? customStyleConfig.fullscreenStyle
        : '';

    // Call fullscreen manager to execute toggle
    const newFullscreenState = !isFullscreen;
    fullscreenManager.toggleFullscreen(rootElementRef.current, newFullscreenState, customStyle);

    // Update local state
    setIsFullscreen(newFullscreenState);
  };

  const handleButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const defaultOpacity = buttonConfig?.opacity || 60;
    e.currentTarget.style.opacity = (defaultOpacity / 100).toString();
  };

  return (
    <div ref={rootElementRef} style={containerStyle}>
      {/* Design mode hint */}
      {designable && (
        <div style={HINT_TEXT_STYLE}>
          You can add any blocks (such as tables, iframes, etc.) into this Fullscreen container. When the Fullscreen
          feature is enabled, all content in this container will be displayed in Fullscreen mode.
        </div>
      )}

      {/* Fullscreen toggle button */}
      <Button
        type="text"
        icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        onClick={handleFullscreenToggle}
        style={buttonStyle}
        onMouseEnter={handleButtonMouseEnter}
        onMouseLeave={handleButtonMouseLeave}
      />

      {/* Content area */}
      <div style={contentStyle}>
        <RecursionField basePath={field.address} schema={schema} onlyRenderProperties />
      </div>
    </div>
  );
});
