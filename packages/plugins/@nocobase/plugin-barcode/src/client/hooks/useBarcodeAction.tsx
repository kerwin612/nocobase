/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { useTranslation } from 'react-i18next';
import { BarcodeConfig, useBarcodeDisplay } from './useBarcodeDisplay';
import { NAMESPACE } from '../constants';
import { useCollectionRecord } from '@nocobase/client';
import React from 'react';

/**
 * Props for the BarcodeAction components
 */
export interface BarcodeActionProps {
  codeConfig?: BarcodeConfig;
  component?: any;
  value?: any;
}

/**
 * Hook to handle barcode action functionality
 */
export const useBarcodeAction = (props: BarcodeActionProps) => {
  const { t } = useTranslation(NAMESPACE);
  const record = useCollectionRecord();
  const { component = <span>{t('Action Name')}</span>, codeConfig = {}, value } = props;

  // Use the shared hook for barcode display
  const { handleButtonClick, renderBarcodeDisplay } = useBarcodeDisplay({
    objectValue: record?.data,
    fieldValue: value,
    codeConfig,
  });

  // Button element to be rendered
  const buttonElement = <span onClick={handleButtonClick}>{component}</span>;

  // Use the shared rendering function
  return renderBarcodeDisplay(buttonElement);
};
