/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/client';
import React from 'react';
import { SchemaSettingsCustomBarcode, SchemaSettingsEnableBarcode } from './BarcodeSettings';
import { BarcodeButton } from './BarcodeButton';
import { BarcodeComponent } from './BarcodeComponent';
import { BarcodeActionComponent, BarcodeActionInitializer, barcodeActionSettings } from './BarcodeAction';
import { NAMESPACE } from './constants';
import { BarcodeWrapperComponent } from './BarcodeWrapperComponent';

/**
 * NocoBase client plugin for barcode functionality
 *
 * Registers components and settings for displaying/configuring barcodes and QR codes
 */
class PluginBarcodeClient extends Plugin {
  /**
   * Load plugin components and settings
   */
  async load() {
    // Register components in the application scope
    this.app.addScopes({
      BarcodeButton: <BarcodeButton />,
    });

    // Register custom components for use in schemas
    this.app.addComponents({
      BarcodeComponent,
      BarcodeWrapperComponent,
      BarcodeActionComponent,
      BarcodeActionInitializer,
    });

    // Helper function to add barcode settings to different schema settings types
    const addBarcodeSettings = (settings) => {
      settings?.add('enableBarcode', { Component: SchemaSettingsEnableBarcode });
      settings?.add('customBarcode', { Component: SchemaSettingsCustomBarcode });
    };

    // Add barcode action to table operations
    this.schemaInitializerManager.get('table:configureItemActions')?.add('barcode', {
      type: 'item',
      title: `{{t("Display barcode button", { ns: "${NAMESPACE}" })}}`,
      name: 'barcode',
      Component: 'BarcodeActionInitializer',
    });

    // Register barcode action settings
    this.schemaSettingsManager.add(barcodeActionSettings);

    // Add barcode settings to table columns
    addBarcodeSettings(this.schemaSettingsManager.get('fieldSettings:TableColumn'));

    // Add barcode settings to form items
    addBarcodeSettings(this.schemaSettingsManager.get('fieldSettings:FormItem'));
  }
}

export default PluginBarcodeClient;
