/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Namespace for i18n translations
 */
export const NAMESPACE = 'barcode';

/**
 * Code type constants for QR codes and barcodes
 * Using simple string literals to avoid TypeScript comparison issues
 */
export const CODE_TYPES = {
  QRCODE: 'qrcode',
  BARCODE: 'barcode',
};

/**
 * Type definition for code types
 */
export type CodeType = (typeof CODE_TYPES)[keyof typeof CODE_TYPES];

/**
 * QR code size multipliers based on selected size option
 */
export const QR_SIZE_MULTIPLIERS: Record<string, number> = {
  small: 1, // Default size
  medium: 2, // 100% larger
  large: 4, // 300% larger (3x default size)
};

/**
 * Size options for barcodes and QR codes
 */
export type CodeSize = 'small' | 'medium' | 'large';
