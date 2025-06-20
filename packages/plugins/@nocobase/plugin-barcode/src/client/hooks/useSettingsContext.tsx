/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { useField, useFieldSchema } from '@formily/react';
import { useCollectionField } from '@nocobase/client';

const fieldIsInputField = (field: any): boolean => {
  return field?.['x-component'] === 'Input' || field?.uiSchema?.['x-component'] === 'Input';
};

/**
 * Custom hook to handle barcode settings context
 */
export const useSettingsContext = (): any => {
  const field = useField();
  const fieldSchema = useFieldSchema();
  const collectionField = useCollectionField();
  let resultSchema = null;
  let enableBarcode = false;
  let isFieldReadPretty = true;
  let isInputField = false;
  let isActionField = false;

  if (field.componentType === 'TableV2.Column') {
    // column field
    resultSchema = Object.values(fieldSchema.properties)[0];
    isFieldReadPretty = resultSchema['x-read-pretty'] ?? false;
    enableBarcode = resultSchema['x-component-props']?.enableBarcode ?? false;
    isInputField = fieldIsInputField(collectionField);
  } else if (field.componentType === 'BarcodeActionComponent') {
    // action field
    resultSchema = fieldSchema;
    enableBarcode = true;
    isActionField = true;
  } else if (field.componentType === 'CollectionField') {
    resultSchema = fieldSchema;
    isFieldReadPretty = field?.readPretty ?? false;
    enableBarcode = resultSchema['x-component-props']?.enableBarcode ?? false;
    isInputField = fieldIsInputField(collectionField);
  } else {
    console.error('BarcodeSettingsCustomBarcode: unknown component', field.componentType);
    return {};
  }

  return {
    field,
    fieldSchema: resultSchema,
    isInputField,
    isActionField,
    enableBarcode,
    collectionField,
    isFieldReadPretty,
  };
};
