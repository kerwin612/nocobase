/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Modal, Popover, Typography } from 'antd';
import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import BarcodeRenderer from './CodeRendererForBar';
import QRRenderer from './CodeRendererForQR';
import { CODE_TYPES, CodeSize, NAMESPACE, QR_SIZE_MULTIPLIERS } from '../constants';

export interface BarcodeDisplayProps {
  content: string;
  size?: CodeSize;
  codeType?: string;
  barcodeFormat?: string;
}

/**
 * Modal component for displaying barcodes/QR codes
 */
export const BarcodeModal: FC<
  BarcodeDisplayProps & {
    open: boolean;
    onCancel: (e?: any) => void;
  }
> = ({ open, onCancel, content, size = 'small', codeType = CODE_TYPES.QRCODE, barcodeFormat = 'CODE128' }) => {
  const { t } = useTranslation(NAMESPACE);

  // Handle modal mask click with stopPropagation
  const handleMaskClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel();
  };

  // Calculate size multiplier
  const sizeMultiplier = QR_SIZE_MULTIPLIERS[size] || QR_SIZE_MULTIPLIERS.small;

  return (
    <Modal
      open={open}
      onCancel={handleMaskClick}
      styles={{
        mask: {
          background: 'rgba(0, 0, 0, 0.45)',
        },
        body: {
          maxWidth: '80vw',
          maxHeight: '80vh',
        },
      }}
      modalRender={(node) => <div onClick={(e) => e.stopPropagation()}>{node}</div>}
      footer={null}
      centered
      title={<Typography.Text strong>{codeType === CODE_TYPES.QRCODE ? t('QR Code') : t('Barcode')}</Typography.Text>}
    >
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        {codeType === CODE_TYPES.QRCODE ? (
          <QRRenderer content={content} size={sizeMultiplier} />
        ) : (
          <BarcodeRenderer content={content} format={barcodeFormat} size={sizeMultiplier} />
        )}
      </div>
    </Modal>
  );
};

/**
 * Popover component for displaying barcodes/QR codes
 */
export const BarcodePopover: FC<
  BarcodeDisplayProps & {
    children?: ReactNode;
  }
> = ({ children, content, size = 'small', codeType = CODE_TYPES.QRCODE, barcodeFormat = 'CODE128' }) => {
  // Calculate size multiplier
  const sizeMultiplier = QR_SIZE_MULTIPLIERS[size] || QR_SIZE_MULTIPLIERS.small;

  return (
    <Popover
      content={
        codeType === CODE_TYPES.QRCODE ? (
          <QRRenderer content={content} size={sizeMultiplier} />
        ) : (
          <BarcodeRenderer content={content} format={barcodeFormat} size={sizeMultiplier} />
        )
      }
      trigger="hover"
      placement="top"
      styles={{
        body: {
          padding: '12px',
        },
      }}
    >
      {children}
    </Popover>
  );
};
