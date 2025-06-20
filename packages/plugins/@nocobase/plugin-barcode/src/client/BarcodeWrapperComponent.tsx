/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { observer, useField, useFieldSchema } from '@formily/react';
import { Typography } from 'antd';
import React, { FC } from 'react';
import { BarcodeActionProps, useBarcodeAction } from './hooks/useBarcodeAction';
import { executeValueGetter } from './utils/barcodeUtils';
import { useCollectionRecord } from '@nocobase/client';

/**
 * BarcodeWrapperComponent
 *
 * A component that renders barcodes/QR codes in NocoBase forms or views
 * Uses field schema to extract configuration and displays the appropriate code
 */
export const BarcodeWrapperComponent: FC = observer(
  () => {
    const record = useCollectionRecord();
    const field = useField();
    const fieldSchema = useFieldSchema();
    const componentProps = fieldSchema['x-component-props'] || {};
    const codeConfig = componentProps?.codeConfig || {};

    const codeContent = executeValueGetter(codeConfig.valueGetter, record?.data, field?.['value']);

    const component = useBarcodeAction({
      component: <span>{codeContent}</span>,
      codeConfig,
      value: field?.['value'],
    } as BarcodeActionProps);

    return codeContent ? <Typography.Link>{component}</Typography.Link> : null;
  },
  {
    displayName: 'BarcodeWrapperComponent',
  },
);
