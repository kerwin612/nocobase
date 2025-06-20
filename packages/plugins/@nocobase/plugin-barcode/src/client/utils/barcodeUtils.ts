/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * Barcode format information and constraints
 */
export const BARCODE_FORMAT_INFO = {
  CODE128: { format: 'CODE128', displayValue: true, contentType: 'any' },
  EAN13: { format: 'EAN13', displayValue: true, contentType: 'numeric', length: 12 },
  EAN8: { format: 'EAN8', displayValue: true, contentType: 'numeric', length: 7 },
  EAN5: { format: 'EAN5', displayValue: true, contentType: 'numeric', length: 5 },
  EAN2: { format: 'EAN2', displayValue: true, contentType: 'numeric', length: 2, allowLeadingZeros: true },
  UPC: { format: 'UPC', displayValue: true, contentType: 'numeric', length: 11 },
  CODE39: { format: 'CODE39', displayValue: true, contentType: 'alphanumeric', specialChars: '-.$/+% ' },
  ITF14: { format: 'ITF14', displayValue: true, contentType: 'numeric', length: 13 },
  MSI: { format: 'MSI', displayValue: true, contentType: 'numeric' },
  PHARMACODE: { format: 'pharmacode', displayValue: false, contentType: 'numeric', min: 3, max: 131070 },
  CODABAR: { format: 'codabar', displayValue: true, contentType: 'numeric', specialChars: '+-/:.' },
  CODE93: { format: 'CODE93', displayValue: true, contentType: 'alphanumeric' },
};

/**
 * Get all supported barcode format entries for UI display
 * This keeps formats definition centralized in one place
 */
export function getBarcodeFormatOptions() {
  return Object.keys(BARCODE_FORMAT_INFO).map((key) => ({
    value: key,
    label: key,
  }));
}

/**
 * Default test value for barcode preview
 */
export const DEFAULT_TEST_VALUE = `{
  "objectValue": {"id": 123, "name": "John Doe"},
  "fieldValue": "https://example.com/user/123"
}`;

/**
 * Default value getter function
 */
export const DEFAULT_VALUE_GETTER = `(objectValue, fieldValue) => {
  return fieldValue;
}`;

/**
 * Validates if content is valid for the given barcode format
 *
 * @param content - The content to be encoded in the barcode
 * @param format - The barcode format
 * @returns Validation result with validity flag and optional error message
 */
export const validateBarcodeContent = (content: string, format: string): { valid: boolean; message?: string } => {
  const formatInfo = BARCODE_FORMAT_INFO[format];
  if (!formatInfo) {
    return { valid: false, message: `Unknown barcode format: ${format}` };
  }

  // CODE128 can handle any input
  if (format === 'CODE128') {
    return { valid: true };
  }

  // Check for numeric content
  if (formatInfo.contentType === 'numeric' && !/^\d+$/.test(content)) {
    return { valid: false, message: `This format requires numeric input only` };
  }

  // Check for fixed length
  if (formatInfo.length) {
    const paddedContent = formatInfo.allowLeadingZeros ? content.padStart(formatInfo.length, '0') : content;

    if (paddedContent.length !== formatInfo.length) {
      return { valid: false, message: `This format requires exactly ${formatInfo.length} digits` };
    }
  }

  // Check min/max constraints
  if (formatInfo.min !== undefined || formatInfo.max !== undefined) {
    const numValue = parseInt(content, 10);
    if (isNaN(numValue)) {
      return { valid: false, message: `This format requires a valid number` };
    }
    if (formatInfo.min !== undefined && numValue < formatInfo.min) {
      return { valid: false, message: `This format requires a number ≥ ${formatInfo.min}` };
    }
    if (formatInfo.max !== undefined && numValue > formatInfo.max) {
      return { valid: false, message: `This format requires a number ≤ ${formatInfo.max}` };
    }
  }

  // Special characters validation
  if (formatInfo.contentType === 'alphanumeric' && formatInfo.specialChars) {
    const allowedChars = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789${formatInfo.specialChars}`;
    for (let i = 0; i < content.length; i++) {
      if (!allowedChars.includes(content[i])) {
        return {
          valid: false,
          message: `This format only allows alphanumeric characters and ${formatInfo.specialChars.split('').join(' ')}`,
        };
      }
    }
  }

  return { valid: true };
};

/**
 * Process barcode content according to format requirements
 *
 * @param content - Original content
 * @param format - Barcode format
 * @returns Processed content
 */
export const processContent = (content: string, format: string): string => {
  // For EAN2 format, pad with leading zeros if needed
  if (format === 'EAN2' && /^\d+$/.test(content) && content.length <= 2) {
    return content.padStart(2, '0');
  }
  return content;
};

const valueToString = (value: any) => {
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
};

/**
 * Executes a value getter function to extract barcode content
 *
 * @param valueGetter - Function string to evaluate
 * @param objectValue - Object containing data values
 * @param fieldValue - Field value
 * @returns Extracted content string
 * @throws Error if valueGetter evaluation fails
 */
export const executeValueGetter = (valueGetter: string | undefined, objectValue: any, fieldValue: any): string => {
  if (!valueGetter) {
    return valueToString(fieldValue || '');
  }

  try {
    if (typeof valueGetter === 'string' && (valueGetter.includes('=>') || valueGetter.startsWith('function'))) {
      // Execute the function
      const fn = new Function('objectValue', 'fieldValue', `return (${valueGetter})(objectValue, fieldValue)`);
      return valueToString(fn(objectValue, fieldValue) || '');
    }
  } catch (e) {
    console.error('Failed to evaluate code valueGetter:', e);
    throw new Error(`Code valueGetter error: ${e.message}`);
  }

  return valueToString(fieldValue || '');
};

/**
 * Validates and recommends appropriate barcode format for content
 *
 * @param content - Content string
 * @param currentFormat - Current barcode format
 * @returns Object with isFormatValid flag and recommended format
 */
export const recommendFormat = (
  content: string,
  currentFormat: string,
): {
  isFormatValid: boolean;
  recommendedFormat: string;
} => {
  // For QR code, always valid
  if (!content) {
    return { isFormatValid: false, recommendedFormat: 'CODE128' };
  }

  const validation = validateBarcodeContent(content, currentFormat);

  // If current format is valid, keep it
  if (validation.valid) {
    return { isFormatValid: true, recommendedFormat: currentFormat };
  }

  // Default fallback to CODE128
  return { isFormatValid: false, recommendedFormat: 'CODE128' };
};
