/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import BarcodeRenderer from './CodeRendererForBar';
import QRRenderer from './CodeRendererForQR';
import { CODE_TYPES, CodeSize, NAMESPACE, QR_SIZE_MULTIPLIERS } from '../constants';
import { executeValueGetter } from '../utils/barcodeUtils';

/**
 * Props for BarcodeViewer component
 */
export interface BarcodeViewerProps {
  objectValue?: any;
  fieldValue?: any;
  valueGetter?: string;
  size?: CodeSize;
  codeType?: string;
  barcodeFormat?: string;
  backupComponent?: FC<any>;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Component to display a barcode or QR code based on field values
 */
export const BarcodeViewer: FC<BarcodeViewerProps> = ({
  objectValue,
  fieldValue,
  valueGetter,
  size = 'small',
  codeType = CODE_TYPES.QRCODE,
  barcodeFormat = 'CODE128',
  backupComponent: BackupComponent,
  style,
  className,
}) => {
  const { t } = useTranslation(NAMESPACE);

  try {
    // Extract content using value getter if provided
    const codeContent = executeValueGetter(valueGetter, objectValue, fieldValue);

    // Calculate size multiplier
    const sizeMultiplier = QR_SIZE_MULTIPLIERS[size] || QR_SIZE_MULTIPLIERS.small;

    // Render appropriate code type component
    return codeType === CODE_TYPES.QRCODE ? (
      <QRRenderer content={codeContent} size={sizeMultiplier} style={style} className={className} />
    ) : (
      <BarcodeRenderer
        content={codeContent}
        format={barcodeFormat}
        size={sizeMultiplier}
        style={style}
        className={className}
      />
    );
  } catch (error) {
    console.error(t('code error:'), error);
    // Display backup component on error
    return BackupComponent ? (
      <BackupComponent _error={error.toString()} style={style} className={className} />
    ) : (
      <div style={{ color: 'red', ...style }} className={className}>
        {error.toString()}
      </div>
    );
  }
};
