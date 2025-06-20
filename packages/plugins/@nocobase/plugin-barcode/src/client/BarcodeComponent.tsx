/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { observer, useFieldSchema, useField } from '@formily/react';
import { useCollectionRecord } from '@nocobase/client';
import React, { FC } from 'react';
import { BarcodeViewer } from './components/CodeViewer';
import { CODE_TYPES, CodeSize } from './constants';

/**
 * BarcodeComponent
 *
 * A component that renders barcodes/QR codes in NocoBase forms or views
 * Uses field schema to extract configuration and displays the appropriate code
 */
export const BarcodeComponent: FC = observer(
  () => {
    const record = useCollectionRecord();
    const fieldSchema = useFieldSchema();
    const field = useField();
    const componentProps = fieldSchema['x-component-props'] || {};
    const codeConfig = componentProps?.codeConfig || {};
    const size = (codeConfig.codeSize || 'small') as CodeSize;
    const codeType = codeConfig.codeType || CODE_TYPES.QRCODE;
    const barcodeFormat = codeConfig.barcodeFormat || 'CODE128';
    const valueGetter = codeConfig.valueGetter;

    return (
      <BarcodeViewer
        objectValue={record?.data}
        fieldValue={field?.['value']}
        valueGetter={valueGetter}
        size={size}
        codeType={codeType}
        barcodeFormat={barcodeFormat}
        backupComponent={({ _error }) => <div style={{ color: 'red' }}>{_error}</div>}
      />
    );
  },
  {
    displayName: 'BarcodeComponent',
  },
);
