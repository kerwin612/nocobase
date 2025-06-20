/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { NAMESPACE } from '../constants';

// Default QR code size in pixels
const DEFAULT_QR_SIZE = 128;

/**
 * Props for QRRenderer component
 */
export interface QRRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  bgColor?: string;
  fgColor?: string;
  includeMargin?: boolean;
  preventClickBubble?: boolean;
}

/**
 * QR Code renderer component
 *
 * Renders a QR code using the qrcode.react library
 */
export const QRRenderer: React.FC<QRRendererProps> = ({
  content,
  className,
  style,
  size = 1, // Default multiplier is 1
  level = 'M',
  bgColor = '#ffffff',
  fgColor = '#000000',
  includeMargin = true,
  preventClickBubble = true,
}) => {
  const { t } = useTranslation(NAMESPACE);

  const [showContent, setShowContent] = useState(false);

  // Calculate actual size based on multiplier
  const actualSize = useMemo(() => {
    // If size is already a large number, assume it's a pixel value (backward compatibility)
    if (size > 10) return size;

    // Otherwise, treat as multiplier
    return Math.round(DEFAULT_QR_SIZE * size);
  }, [size]);

  // Generate QR code component or error fallback
  const qrCode = useMemo(() => {
    if (!content) {
      console.error(t('No content provided'));
      return null;
    }

    try {
      return (
        <QRCodeSVG
          value={content}
          size={actualSize}
          level={level}
          bgColor={bgColor}
          fgColor={fgColor}
          includeMargin={includeMargin}
        />
      );
    } catch (error) {
      console.error(t('Failed to generate QR code:'), error);
      return null;
    }
  }, [content, actualSize, level, bgColor, fgColor, includeMargin, t]);

  // If there's an error, show a fallback with error message
  if (!qrCode) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px',
          minHeight: '50px',
          ...style,
        }}
      >
        <div style={{ fontSize: '12px', wordBreak: 'break-all', textAlign: 'center' }}>
          {content || t('No content provided')}
        </div>
      </div>
    );
  }

  // Render QR code with container
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        className={className}
        style={{
          maxWidth: '100%',
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          ...style,
        }}
        onClick={(e) => {
          setShowContent(!showContent);
          if (preventClickBubble) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        {qrCode}
      </div>
      {showContent && <div style={{ fontSize: '12px', wordBreak: 'break-all', textAlign: 'center' }}>{content}</div>}
    </div>
  );
};

export default QRRenderer;
