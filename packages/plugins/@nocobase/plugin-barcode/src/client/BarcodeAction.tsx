/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import {
  Action,
  ActionInitializerItem,
  RemoveButton,
  SchemaSettings,
  useDesignable,
  useSchemaToolbar,
} from '@nocobase/client';
import { Typography } from 'antd';
import React, { FC } from 'react';
import { SchemaSettingsCustomBarcode } from './BarcodeSettings';
import { CODE_TYPES } from './constants';
import { BarcodeActionProps, useBarcodeAction } from './hooks/useBarcodeAction';

/**
 * Schema settings configuration for barcode actions
 */
export const barcodeActionSettings = new SchemaSettings({
  name: 'actionSettings:barcode',
  items: [
    {
      name: 'customBarcode',
      Component: SchemaSettingsCustomBarcode,
    },
    {
      name: 'remove',
      sort: 100,
      Component: RemoveButton as any,
      useComponentProps() {
        const { removeButtonProps } = useSchemaToolbar();
        return removeButtonProps;
      },
    },
  ],
});

/**
 * Component to render a barcode action in the UI
 */
export const BarcodeActionComponent: FC<BarcodeActionProps> = (props) => {
  const component = useBarcodeAction(props);
  const { designable } = useDesignable?.() || {};

  if (designable) {
    // In designer mode, use standard Actions while retaining the editing capability
    return <Action.Link {...props} type={'link'} title={component}></Action.Link>;
  } else {
    // In non-designer mode, use typography link for better display
    return <Typography.Link>{component}</Typography.Link>;
  }
};

/**
 * Initializer for barcode actions in schema configuration
 */
export const BarcodeActionInitializer: FC<any> = (props) => {
  // Default schema configuration for barcode actions
  const schema = {
    type: 'void',
    'x-action': 'barcode',
    'x-toolbar': 'ActionSchemaToolbar',
    'x-settings': 'actionSettings:barcode',
    'x-component': 'BarcodeActionComponent',
    'x-component-props': {
      enableBarcode: true,
      codeConfig: {
        displayMode: 'modal',
        codeSize: 'small',
        codeType: CODE_TYPES.QRCODE,
      },
    },
  };

  return <ActionInitializerItem {...props} schema={schema} />;
};
