/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { SchemaSettings, SchemaSettingsRemove } from '@nocobase/client';
import { FullscreenBlockSchemaSettings } from './FullscreenBlockSchemaSettings';

export const fullscreenBlockSchemaSettings = new SchemaSettings({
  name: 'blockSettings:fullscreen',
  items: [
    {
      name: 'custom',
      Component: FullscreenBlockSchemaSettings,
    },
    {
      name: 'divider',
      type: 'divider',
    },
    {
      name: 'remove',
      Component: SchemaSettingsRemove,
      componentProps: {
        removeParentsIfNoChildren: true,
        breakRemoveOn: {
          'x-component': 'Grid',
        },
      },
    },
  ],
});
