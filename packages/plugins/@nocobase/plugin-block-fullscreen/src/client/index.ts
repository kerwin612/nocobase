/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/client';
import { FullscreenBlockProvider } from './FullscreenBlockProvider';
import { fullscreenBlockSchemaSettings } from './schemaSettings';
import { NAMESPACE } from './constants';

export * from './FullscreenBlock';
export * from './FullscreenManager';

// Configuration for block initializers to avoid repetition
const INITIALIZER_CONFIGS = [
  {
    key: 'page:addBlock',
    itemPath: 'otherBlocks.fullscreen',
  },
  {
    key: 'popup:addNew:addBlock',
    itemPath: 'otherBlocks.fullscreen',
  },
  {
    key: 'popup:common:addBlock',
    itemPath: 'otherBlocks.fullscreen',
  },
  {
    key: 'RecordFormBlockInitializers',
    itemPath: 'otherBlocks.fullscreen',
  },
  {
    key: 'mobilePage:addBlock',
    itemPath: 'otherBlocks.fullscreen',
  },
  {
    key: 'mobile:addBlock',
    itemPath: 'otherBlocks.fullscreen',
  },
] as const;

const FULLSCREEN_INITIALIZER_CONFIG = {
  title: `{{t("Fullscreen Container", { ns: "${NAMESPACE}" })}}`,
  Component: 'FullscreenBlockInitializer',
} as const;

export class PluginBlockFullscreenClient extends Plugin {
  async load() {
    this.app.use(FullscreenBlockProvider);
    this.app.schemaSettingsManager.add(fullscreenBlockSchemaSettings);

    // Register block initializer in all common entry points using configuration
    INITIALIZER_CONFIGS.forEach(({ key, itemPath }) => {
      const initializer = this.app.schemaInitializerManager.get(key);
      if (initializer) {
        initializer.add(itemPath, FULLSCREEN_INITIALIZER_CONFIG);
      } else {
        // For initializers that don't exist yet, add them directly
        this.app.schemaInitializerManager.addItem(key, itemPath, FULLSCREEN_INITIALIZER_CONFIG);
      }
    });
  }
}

export default PluginBlockFullscreenClient;
