/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { NAMESPACE } from '../constants';
import { BARCODE_FORMAT_INFO, processContent, validateBarcodeContent } from '../utils/barcodeUtils';

/**
 * Props for BarcodeRenderer component
 */
export interface BarcodeRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  text?: string;
  fontOptions?: string;
  font?: string;
  textAlign?: string;
  textPosition?: string;
  textMargin?: number;
  fontSize?: number;
  background?: string;
  lineColor?: string;
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  preventClickBubble?: boolean;
}

/**
 * Barcode renderer component
 *
 * Renders a barcode using the JsBarcode library
 */
export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  content,
  className,
  style,
  format = 'CODE128',
  size = 1, // size multiplier
  width,
  height = 80,
  displayValue,
  text,
  fontOptions,
  font,
  textAlign,
  textPosition,
  textMargin,
  fontSize,
  background,
  lineColor,
  margin,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  preventClickBubble = true,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation(NAMESPACE);

  useEffect(() => {
    if (!svgRef.current || !content) {
      setError(t('No content provided'));
      return;
    }

    // Clear previous error
    setError(null);

    try {
      // Process content according to format requirements
      const processedContent = processContent(content, format);

      // Validate content for the selected format
      const validation = validateBarcodeContent(processedContent, format);

      if (!validation.valid) {
        setError(`${t('Cannot generate barcode')}: ${t(validation.message)}`);
        return;
      }

      // Create options object based on format settings
      const formatInfo = BARCODE_FORMAT_INFO[format];

      // Create options object
      const options: any = {
        format: formatInfo?.format || 'CODE128',
        width: width || Math.max(1, Math.round(1 * size)),
        height: height,
        displayValue: displayValue !== undefined ? displayValue : formatInfo?.displayValue,
      };

      // Add optional parameters if defined
      if (text !== undefined) options.text = text;
      if (fontOptions !== undefined) options.fontOptions = fontOptions;
      if (font !== undefined) options.font = font;
      if (textAlign !== undefined) options.textAlign = textAlign;
      if (textPosition !== undefined) options.textPosition = textPosition;
      if (textMargin !== undefined) options.textMargin = textMargin;
      if (fontSize !== undefined) options.fontSize = fontSize;
      if (background !== undefined) options.background = background;
      if (lineColor !== undefined) options.lineColor = lineColor;
      if (margin !== undefined) options.margin = margin;
      if (marginTop !== undefined) options.marginTop = marginTop;
      if (marginBottom !== undefined) options.marginBottom = marginBottom;
      if (marginLeft !== undefined) options.marginLeft = marginLeft;
      if (marginRight !== undefined) options.marginRight = marginRight;

      // Generate the barcode
      JsBarcode(svgRef.current, processedContent, options);
    } catch (error) {
      console.error(t('Failed to generate barcode:'), error);
      setError(`${t('Failed to generate barcode')}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [
    content,
    format,
    size,
    width,
    height,
    displayValue,
    text,
    fontOptions,
    font,
    textAlign,
    textPosition,
    textMargin,
    fontSize,
    background,
    lineColor,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    t,
  ]);

  // If there's an error, show a fallback with error message
  if (error) {
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
        onClick={preventClickBubble ? (e) => e.stopPropagation() : undefined}
      >
        <Typography.Text type="danger" style={{ fontSize: '12px', marginBottom: '4px' }}>
          {error}
        </Typography.Text>
        <Typography.Text style={{ fontSize: '12px', wordBreak: 'break-all', textAlign: 'center' }}>
          {content}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: '10px', marginTop: '4px' }}>
          {t('Try using QR Code instead for this content')}
        </Typography.Text>
      </div>
    );
  }

  // Render the barcode
  return (
    <div
      className={className}
      style={{
        maxWidth: '100%',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}
      onClick={preventClickBubble ? (e) => e.stopPropagation() : undefined}
    >
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BarcodeRenderer;
