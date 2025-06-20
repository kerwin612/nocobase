/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { ISchema } from '@formily/react';
import { useDesignable, SchemaSettingsSwitchItem, SchemaSettingsModalItem } from '@nocobase/client';
import { Switch, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarcodeButton } from './BarcodeButton';
import { CODE_TYPES, NAMESPACE } from './constants';
import { BarcodeViewer } from './components/CodeViewer';
import { getBarcodeFormatOptions } from './utils/barcodeUtils';
import { useSettingsContext } from './hooks/useSettingsContext';

/**
 * Props for BarcodePreview component
 */
interface BarcodePreviewProps {
  valueGetter?: string;
  testValue?: string;
  codeSize?: 'small' | 'medium' | 'large';
  codeType?: string;
  barcodeFormat?: string;
}

const BarcodePreview: React.FC<BarcodePreviewProps> = ({
  valueGetter,
  testValue,
  codeSize = 'small',
  codeType = CODE_TYPES.QRCODE,
  barcodeFormat = 'CODE128',
}) => {
  const { t } = useTranslation(NAMESPACE);
  const [recommendedFormat, setRecommendedFormat] = useState(barcodeFormat);
  const [isFormatValid, setIsFormatValid] = useState(true);

  // Detect content and recommend barcode type
  useEffect(() => {
    // Parse test value
    try {
      if (!testValue) return;
      const jsonValue = JSON.parse(testValue);
      if (!jsonValue || !jsonValue.objectValue || !jsonValue.fieldValue) return;

      const { fieldValue } = jsonValue;
      let contentStr = String(fieldValue || '');

      // If there's a valueGetter, try to execute it
      if (valueGetter) {
        try {
          if (typeof valueGetter === 'string' && (valueGetter.includes('=>') || valueGetter.startsWith('function'))) {
            const fn = new Function('objectValue', 'fieldValue', `return (${valueGetter})(objectValue, fieldValue)`);
            contentStr = fn(jsonValue.objectValue, fieldValue);
          }
        } catch (e) {
          console.error('Error evaluating valueGetter:', e);
        }
      }

      // Auto-detect and recommend barcode format
      if (codeType === CODE_TYPES.BARCODE) {
        // Validate if current format is suitable for content
        let isValid = true;

        // Check requirements for specific formats
        if (barcodeFormat === 'EAN13' && (!/^\d+$/.test(contentStr) || contentStr.length !== 12)) {
          isValid = false;
          setRecommendedFormat('CODE128');
        } else if (barcodeFormat === 'EAN8' && (!/^\d+$/.test(contentStr) || contentStr.length !== 7)) {
          isValid = false;
          setRecommendedFormat('CODE128');
        } else if (barcodeFormat === 'EAN5' && (!/^\d+$/.test(contentStr) || contentStr.length !== 5)) {
          isValid = false;
          setRecommendedFormat('CODE128');
        } else if (barcodeFormat === 'EAN2' && (!/^\d+$/.test(contentStr) || contentStr.length > 2)) {
          // For EAN2, allow 1 or 2 digits
          if (!/^\d+$/.test(contentStr)) {
            isValid = false;
            setRecommendedFormat('CODE128');
          } else if (contentStr.length > 2) {
            isValid = false;
            setRecommendedFormat('CODE128');
          } else {
            isValid = true;
          }
        } else if (barcodeFormat === 'UPC' && (!/^\d+$/.test(contentStr) || contentStr.length !== 11)) {
          isValid = false;
          setRecommendedFormat('CODE128');
        } else if (barcodeFormat === 'ITF14' && (!/^\d+$/.test(contentStr) || contentStr.length !== 13)) {
          isValid = false;
          setRecommendedFormat('CODE128');
        } else if (barcodeFormat === 'MSI' && !/^\d+$/.test(contentStr)) {
          isValid = false;
          setRecommendedFormat('CODE128');
        } else if (barcodeFormat === 'PHARMACODE') {
          const num = parseInt(contentStr, 10);
          if (isNaN(num) || num < 3 || num > 131070) {
            isValid = false;
            setRecommendedFormat('CODE128');
          }
        } else if (barcodeFormat === 'CODABAR' && !/^[0-9+-/:.]+$/.test(contentStr)) {
          isValid = false;
          setRecommendedFormat('CODE128');
        } else if (barcodeFormat === 'CODE93' && /[^A-Za-z0-9\-. $/+%]+/.test(contentStr)) {
          isValid = false;
          setRecommendedFormat('CODE128');
        }

        // URL content recommends using CODE128
        if (/^https?:\/\//i.test(contentStr) && barcodeFormat !== 'CODE128') {
          isValid = false;
          setRecommendedFormat('CODE128');
        }

        setIsFormatValid(isValid);
      } else {
        // QR codes are always valid
        setIsFormatValid(true);
      }
    } catch (e) {
      // Parse error, keep current format
    }
  }, [testValue, valueGetter, codeType, barcodeFormat]);

  if (!testValue) {
    return (
      <div style={{ color: '#faad14', textAlign: 'center', padding: '20px 0' }}>
        {t('Test value is required for preview')}
      </div>
    );
  }

  let jsonValue = null;
  try {
    jsonValue = JSON.parse(testValue);
  } catch (e) {
    return (
      <div style={{ color: '#ff4d4f', textAlign: 'center', padding: '20px 0' }}>
        <Typography.Text type="danger" strong>
          {t('Invalid JSON string')}
        </Typography.Text>
        <div style={{ fontSize: '12px', marginTop: '8px' }}>{e.message}</div>
      </div>
    );
  }

  if (!jsonValue || !jsonValue.objectValue || !jsonValue.fieldValue) {
    return (
      <div style={{ color: '#ff4d4f', textAlign: 'center', padding: '20px 0' }}>
        {t('JSON must include objectValue and fieldValue properties')}
      </div>
    );
  }

  const { objectValue, fieldValue } = jsonValue;

  // If recommended format differs from selected format, show tip
  const showFormatTip = codeType === CODE_TYPES.BARCODE && !isFormatValid;

  return (
    <div
      style={{
        maxWidth: '80%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 0',
      }}
    >
      {showFormatTip && (
        <Typography.Text type="warning" style={{ marginBottom: 8, textAlign: 'center' }}>
          {t('Recommended format')}: {recommendedFormat} {t('for this content')}
          <br />
          <span style={{ fontSize: '12px', color: '#ff4d4f' }}>
            {t('Current format is not compatible with this content')}
          </span>
        </Typography.Text>
      )}
      {/* Only display barcode when format is valid */}
      {isFormatValid ? (
        <BarcodeViewer
          objectValue={objectValue}
          fieldValue={fieldValue}
          valueGetter={valueGetter}
          size={codeSize as 'small' | 'medium' | 'large'}
          codeType={codeType}
          barcodeFormat={barcodeFormat}
          backupComponent={({ _error }) => (
            <div style={{ color: '#ff4d4f', textAlign: 'center', padding: '20px 0' }}>
              <Typography.Text type="danger" strong>
                {t('Error generating code')}
              </Typography.Text>
              <div style={{ fontSize: '12px', marginTop: '8px', wordBreak: 'break-word' }}>{_error}</div>
            </div>
          )}
        />
      ) : (
        <div
          style={{
            padding: '20px',
            border: '1px dashed #d9d9d9',
            borderRadius: '4px',
            textAlign: 'center',
            width: '80%',
          }}
        >
          <Typography.Text type="secondary">
            {t('Please select the recommended format to generate barcode')}
          </Typography.Text>
        </div>
      )}
    </div>
  );
};

export const SchemaSettingsEnableBarcode = () => {
  const { t } = useTranslation(NAMESPACE);
  const { collectionField, field, fieldSchema, isActionField, isFieldReadPretty, isInputField } = useSettingsContext();
  const componentProps = fieldSchema?.['x-component-props'] ?? {};
  const { dn } = useDesignable();
  return (
    <SchemaSettingsSwitchItem
      title={t('Display barcode button')}
      checked={componentProps.enableBarcode}
      hidden={!field || !collectionField || !isFieldReadPretty} // table operation column can't enable barcode
      onChange={(v) => {
        if (!v) {
          delete field.componentProps.addonAfter;
          delete field.componentProps.addonBefore;
          delete componentProps.codeConfig;
          delete componentProps.addonAfter;
          delete componentProps.addonBefore;
          delete componentProps.component;
        } else {
          if (isInputField) {
            field.componentProps.addonAfter = <BarcodeButton />;
            componentProps.addonAfter = '{{BarcodeButton}}';
          }
          if (!isInputField && !isActionField) {
            componentProps.component = 'BarcodeWrapperComponent';
          }
        }
        field.componentProps.enableBarcode = v;
        componentProps.enableBarcode = v;
        dn.emit('patch', {
          schema: {
            ['x-uid']: fieldSchema['x-uid'],
            'x-component-props': componentProps,
          },
        });
        dn.refresh();
      }}
    />
  );
};

export const SchemaSettingsCustomBarcode = () => {
  const { t } = useTranslation(NAMESPACE);
  const { enableBarcode, field, fieldSchema, isActionField, isFieldReadPretty, isInputField } = useSettingsContext();
  const componentProps = fieldSchema?.['x-component-props'] ?? {};
  const { dn } = useDesignable();
  const { codeConfig = {} } = componentProps;

  // default test value and value getter
  const defaultTestValue = `{
    "objectValue": {"id": 123, "name": "John Doe"},
    "fieldValue": "https://example.com/user/123"
  }`;
  const defaultValueGetter = `(objectValue, fieldValue) => {
    return fieldValue;
  }`;

  return (
    <SchemaSettingsModalItem
      title={t('Barcode config')}
      width={'60vw'}
      components={{ Switch }}
      hidden={!(enableBarcode && isFieldReadPretty && field)}
      schema={
        {
          type: 'object',
          properties: {
            isReplaceRenderer: {
              type: 'boolean',
              title: t('Replace original component'),
              'x-hidden': isActionField, // action field can't replace original component
              'x-component': 'Switch',
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                tooltip: t('Replace the original component with barcode'),
              },
              default: !!componentProps.component && componentProps.component === 'BarcodeComponent',
            },
            codeType: {
              type: 'string',
              title: t('Code type'),
              enum: [
                { label: t('QR Code'), value: CODE_TYPES.QRCODE },
                { label: t('Barcode'), value: CODE_TYPES.BARCODE },
              ],
              'x-component': 'Radio.Group',
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                tooltip: t('Choose between QR code or barcode'),
              },
              default: codeConfig.codeType || CODE_TYPES.QRCODE,
            },
            barcodeFormat: {
              type: 'string',
              title: t('Barcode format'),
              enum: getBarcodeFormatOptions(),
              'x-component': 'Select',
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                tooltip: t('Barcode format type'),
              },
              default: codeConfig.barcodeFormat || 'CODE128',
              'x-reactions': {
                dependencies: ['codeType'],
                fulfill: {
                  state: {
                    visible: '{{$deps[0] === "barcode"}}',
                  },
                },
              },
            },
            addonPosition: {
              type: 'string',
              title: t('Addon position'),
              enum: [
                { label: t('After'), value: 'addonAfter' },
                { label: t('Before'), value: 'addonBefore' },
              ],
              'x-hidden': !isInputField, // only input field can have addon
              'x-component': 'Radio.Group',
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                tooltip: t('Where to display the barcode button'),
              },
              default: codeConfig.addonPosition || 'addonAfter',
              'x-reactions': [
                {
                  dependencies: ['isReplaceRenderer'],
                  fulfill: {
                    state: {
                      disabled: '{{$deps[0]}}',
                    },
                  },
                },
              ],
            },
            displayMode: {
              type: 'string',
              title: t('Display mode'),
              enum: [
                { label: t('Modal'), value: 'modal' },
                { label: t('Popover'), value: 'popover' },
              ],
              'x-component': 'Radio.Group',
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                tooltip: t('How to display barcode when button is clicked or hovered'),
              },
              default: codeConfig.displayMode || 'modal',
              'x-reactions': [
                {
                  dependencies: ['isReplaceRenderer'],
                  fulfill: {
                    state: {
                      disabled: '{{$deps[0]}}',
                    },
                  },
                },
              ],
            },
            codeSize: {
              type: 'string',
              title: t('Code size'),
              enum: [
                { label: t('Small'), value: 'small' },
                { label: t('Medium'), value: 'medium' },
                { label: t('Large'), value: 'large' },
              ],
              'x-component': 'Radio.Group',
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                tooltip: t('Size of the code'),
              },
              default: codeConfig.codeSize || 'small',
              'x-reactions': [
                {
                  dependencies: ['isReplaceRenderer'],
                  fulfill: {
                    state: {
                      disabled: '{{$deps[0]}}',
                    },
                  },
                },
              ],
            },
            valueGetter: {
              type: 'string',
              title: t('Value getter'),
              'x-component': 'Input.TextArea',
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                tooltip: t('Value Getter Description'),
              },
              'x-component-props': {
                rows: 3,
                placeholder: defaultValueGetter,
              },
              default: codeConfig.valueGetter || defaultValueGetter,
              description: t('Value Getter Description'),
            },
            testValue: {
              type: 'string',
              title: t('Test Value'),
              'x-component': 'Input.TextArea',
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                tooltip: t('Enter test data to preview the code'),
              },
              'x-component-props': {
                rows: 3,
                placeholder: defaultTestValue,
              },
              default: defaultTestValue,
            },
            preview: {
              type: 'void',
              title: t('Preview'),
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                layout: 'vertical',
                style: {
                  marginTop: '20px',
                  background: '#f5f5f5',
                  padding: '16px',
                  borderRadius: '4px',
                },
              },
              'x-component': BarcodePreview,
              'x-component-props': {
                valueGetter: codeConfig.valueGetter || defaultValueGetter,
                testValue: defaultTestValue,
                codeSize: codeConfig.codeSize || 'small',
                codeType: codeConfig.codeType || CODE_TYPES.QRCODE,
                barcodeFormat: codeConfig.barcodeFormat || 'CODE128',
              },
              'x-reactions': {
                dependencies: ['valueGetter', 'testValue', 'codeSize', 'codeType', 'barcodeFormat'],
                fulfill: {
                  schema: {
                    'x-component-props': '{{ $form.values }}',
                  },
                },
              },
            },
          },
        } as ISchema
      }
      onSubmit={(data) => {
        // 保存配置
        const newConfig = {
          addonPosition: data.addonPosition || 'addonAfter',
          displayMode: data.isReplaceRenderer ? 'modal' : data.displayMode,
          valueGetter: data.valueGetter,
          codeSize: data.codeSize || 'small',
          codeType: data.codeType || CODE_TYPES.QRCODE,
          barcodeFormat: data.barcodeFormat || 'CODE128',
        };

        // 更新组件属性
        delete componentProps.addonBefore;
        delete componentProps.addonAfter;
        delete field.componentProps.addonBefore;
        delete field.componentProps.addonAfter;
        if (data.isReplaceRenderer) {
          componentProps.component = 'BarcodeComponent';
        } else {
          delete componentProps.component;
          componentProps[data.addonPosition] = '{{BarcodeButton}}';
          field.componentProps[data.addonPosition] = <BarcodeButton />;
          if (!isInputField && !isActionField) {
            componentProps.component = 'BarcodeWrapperComponent';
          }
        }

        // 保存配置
        componentProps.codeConfig = newConfig;
        field.componentProps = { ...componentProps };

        // 更新schema
        dn.emit('patch', {
          schema: {
            ['x-uid']: fieldSchema['x-uid'],
            'x-component-props': componentProps,
          },
        });
        dn.refresh();
      }}
    />
  );
};
