/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, CSSProperties, useState } from 'react';
import { Modal, Form, Input, Button, Switch, Typography, InputNumber } from 'antd';
import { NAMESPACE } from '../../constants';

const { TextArea } = Input;

interface DynamicColumnsConfigModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: FormValues) => void;
  initialValues?: FormValues;
  t: (key: string) => string;
  filterForm: any;
}

interface FormValues {
  defaultShowDynamicColumns: boolean;
  rowIdColumnIndex: number;
  insertAfterColumnIndex: number;
  hasCustomForm: boolean;
  formSchema: string;
  headerFunctionTemplate: string;
  rowFunctionTemplate: string;
}
// Modal configuration constants
const MODAL_CONFIG = {
  width: '80vw',
  style: {
    height: '80vh',
    top: '10vh',
  },
  bodyStyle: {
    height: 'calc(80vh - 110px)', // Subtract header and footer height
    overflow: 'auto',
  } as CSSProperties,
};

// Style constants for better performance
const MODAL_CONTAINER_STYLE: CSSProperties = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  margin: '0 4px',
};

const FORM_STYLE: CSSProperties = {
  flex: 1,
};

const TEXTAREA_STYLE: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '12px',
  minHeight: '100px',
  resize: 'vertical',
};

const INFO_BOX_BASE_STYLE: CSSProperties = {
  padding: '16px',
  border: '1px solid #e1e4e8',
  borderRadius: '6px',
  marginTop: '16px',
};

const INFO_BOX_GUIDE_STYLE: CSSProperties = {
  ...INFO_BOX_BASE_STYLE,
  backgroundColor: '#f6f8fa',
  borderLeft: '4px solid #1890ff',
};

const INFO_BOX_WARNING_STYLE: CSSProperties = {
  ...INFO_BOX_BASE_STYLE,
  backgroundColor: '#fff7e6',
  border: '1px solid #ffd591',
  borderLeft: '4px solid #fa8c16',
};

const INFO_TITLE_STYLE: CSSProperties = {
  fontWeight: 'bold',
  marginBottom: '8px',
  fontSize: '14px',
};

// 统一主色、警告色、灰色、背景、圆角、间距
const MAIN_COLOR = '#3056a0';
const SUB_COLOR = '#666';
const BG_COLOR = '#f6f8fa';
const CODE_BG = '#f0f0f0';
const RADIUS = 5;
const BLOCK_MARGIN = '16px';

const INFO_TITLE_GUIDE_STYLE: CSSProperties = {
  ...INFO_TITLE_STYLE,
  color: MAIN_COLOR,
};
const INFO_TITLE_L1_STYLE: CSSProperties = {
  fontWeight: 600,
  fontSize: '15px',
  color: MAIN_COLOR,
  margin: `${BLOCK_MARGIN} 0 8px 0`,
  borderLeft: `3px solid ${MAIN_COLOR}`,
  background: BG_COLOR,
  borderRadius: RADIUS,
  paddingLeft: 9,
  lineHeight: '2',
  display: 'block',
};
const INFO_TITLE_L2_STYLE: CSSProperties = {
  fontWeight: 500,
  fontSize: '13.5px',
  color: SUB_COLOR,
  margin: '10px 0 4px 16px',
  display: 'block',
};
const INFO_CONTENT_STYLE: CSSProperties = {
  color: SUB_COLOR,
  lineHeight: '1.7',
  fontSize: '13px',
  margin: '0 0 0 18px',
  marginBottom: BLOCK_MARGIN,
};
const CODE_STYLE: CSSProperties = {
  backgroundColor: CODE_BG,
  padding: '2px 6px',
  borderRadius: RADIUS,
  fontSize: '12px',
  fontFamily: 'monospace',
  marginRight: 4,
};
const PRE_STYLE: CSSProperties = {
  backgroundColor: CODE_BG,
  padding: '10px',
  borderRadius: RADIUS,
  fontSize: '12px',
  margin: '0 0 16px 0',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontFamily: 'monospace',
};
const LIST_STYLE: CSSProperties = {
  marginLeft: '-18px',
};
const FIELD_BLOCK_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: BLOCK_MARGIN,
};

const INFO_TITLE_WARNING_STYLE: CSSProperties = {
  ...INFO_TITLE_STYLE,
  color: '#fa8c16',
};

// 新增：自定义 TextArea 组件，支持自动高度切换
const AutoResizeTextArea: React.FC<React.ComponentProps<typeof TextArea>> = (props) => {
  const [height, setHeight] = useState(100);
  return (
    <TextArea
      {...props}
      style={{ ...props.style, height }}
      onFocus={(e) => {
        setHeight(500);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setHeight(100);
        props.onBlur?.(e);
      }}
    />
  );
};

export const DynamicColumnsConfigModal: React.FC<DynamicColumnsConfigModalProps> = ({
  visible,
  onCancel,
  onOk,
  initialValues,
  t,
  filterForm,
}) => {
  const [form] = Form.useForm<FormValues>();

  // 转换 filterForm 数据结构
  const filterFields = filterForm?.fields
    ? Object.entries(filterForm.fields).map(([key, value]) => ({
        key,
        label: value?.['label'],
      }))
    : [];

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        defaultShowDynamicColumns: initialValues?.defaultShowDynamicColumns ?? true,
        rowIdColumnIndex: initialValues?.rowIdColumnIndex,
        insertAfterColumnIndex: initialValues?.insertAfterColumnIndex ?? -1,
        hasCustomForm: Boolean(initialValues?.formSchema),
        formSchema: initialValues?.formSchema ?? '',
        headerFunctionTemplate: initialValues?.headerFunctionTemplate ?? '',
        rowFunctionTemplate: initialValues?.rowFunctionTemplate ?? '',
      });
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log(`[${NAMESPACE}] - config values:`, values);
      onOk(values);
    } catch (error) {
      console.error(`[${NAMESPACE}] - config form validation failed:`, error);
    }
  };

  return (
    <Modal
      title={t('Dynamic Columns Configuration')}
      open={visible}
      onCancel={onCancel}
      width={MODAL_CONFIG.width}
      style={MODAL_CONFIG.style}
      styles={{
        body: MODAL_CONFIG.bodyStyle,
      }}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t('Cancel')}
        </Button>,
        <Button key="ok" type="primary" onClick={handleOk}>
          {t('Save')}
        </Button>,
      ]}
    >
      <div style={MODAL_CONTAINER_STYLE}>
        <Form form={form} layout="vertical" style={FORM_STYLE}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
            <Form.Item
              name="defaultShowDynamicColumns"
              label={t('Default Show Dynamic Columns')}
              valuePropName="checked"
              style={{ marginBottom: 0, minWidth: 220, flex: 'none' }}
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="rowIdColumnIndex"
              label={t('Row ID Column Index')}
              rules={[
                { required: true, message: t('Please enter the column index for row ID') },
                { type: 'number', min: 0, message: t('Minimum value is 0') },
              ]}
              style={{ marginBottom: 0, minWidth: 180, flex: 'none' }}
              extra={t('Required. The column index to get row ID, minimum 0.')}
            >
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>

            <Form.Item
              name="insertAfterColumnIndex"
              label={t('Insert Dynamic Columns After Column Index')}
              tooltip={t('-1 means after the last column')}
              rules={[{ type: 'number', min: -1, message: t('Minimum value is -1') }]}
              initialValue={-1}
              style={{ marginBottom: 0, minWidth: 220, flex: 'none' }}
              extra={t('Optional. -1 means after the last column, minimum -1.')}
            >
              <InputNumber min={-1} style={{ width: 120 }} />
            </Form.Item>
          </div>

          <Form.Item
            name="hasCustomForm"
            label={t('Use Custom Form')}
            valuePropName="checked"
            tooltip={t(
              '如果启用自定义表单，则用户点击动态列按钮时，会弹出表单供用户输入，否则用户点击动态列按钮时，会直接显示/关闭动态列',
            )}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.hasCustomForm !== currentValues.hasCustomForm}
          >
            {({ getFieldValue }) => {
              const hasCustomForm = getFieldValue('hasCustomForm');
              return hasCustomForm ? (
                <Form.Item
                  name="formSchema"
                  label={t('Form Schema')}
                  tooltip={t('用于生成表单供用户操作，表单的值会被传递至下方sql模板')}
                >
                  <AutoResizeTextArea
                    rows={12}
                    style={TEXTAREA_STYLE}
                    placeholder={t('Enter your form schema here...')}
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          <Form.Item
            name="headerFunctionTemplate"
            label={t('SQL Template for Column Headers')}
            tooltip={t('动态列的列头将依据该sql模板返回的数据结构，sql模板中可以使用上方的表单值')}
          >
            <AutoResizeTextArea
              rows={2}
              style={TEXTAREA_STYLE}
              placeholder={t('Enter your SQL template for column headers...')}
            />
          </Form.Item>

          <Form.Item
            name="rowFunctionTemplate"
            label={t('SQL Template for Row Data')}
            tooltip={t('动态列的数据行将依据该sql模板返回的数据结构，sql模板中可以使用上方的表单值')}
          >
            <AutoResizeTextArea
              rows={2}
              style={TEXTAREA_STYLE}
              placeholder={t('Enter your SQL template for row data...')}
            />
          </Form.Item>

          <div style={INFO_BOX_GUIDE_STYLE}>
            <div style={INFO_TITLE_GUIDE_STYLE}>💡 {t('Configuration Guide')}</div>
            <div style={INFO_CONTENT_STYLE}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.hasCustomForm !== currentValues.hasCustomForm}
              >
                {({ getFieldValue }) => {
                  const hasCustomForm = getFieldValue('hasCustomForm');
                  return hasCustomForm ? (
                    <>
                      <span style={INFO_TITLE_L1_STYLE}>{t('Form Schema Configuration')}</span>
                      <span style={INFO_TITLE_L2_STYLE}>{t('Supported Field Types')}</span>
                      <ul style={LIST_STYLE}>
                        <li>
                          <code style={CODE_STYLE}>string</code> - 文本输入框（默认类型）
                        </li>
                        <li>
                          <code style={CODE_STYLE}>number</code> - 数字输入框
                        </li>
                        <li>
                          <code style={CODE_STYLE}>boolean</code> - 开关
                        </li>
                        <li>
                          <code style={CODE_STYLE}>select</code> - 下拉选择框（需要提供options）
                        </li>
                        <li>
                          <code style={CODE_STYLE}>date</code> - 日期选择器
                        </li>
                        <li>
                          <code style={CODE_STYLE}>datetime</code> - 日期时间选择器
                        </li>
                      </ul>
                      <span style={INFO_TITLE_L2_STYLE}>{t('Example')}</span>
                      <pre style={PRE_STYLE}>
                        {`// 表单配置示例
[
  {
    "name": "tableId",
    "label": "表ID",
    "required": true,
    "type": "string",
    "placeholder": "请输入表ID"
  },
  {
    "name": "status",
    "label": "状态",
    "type": "select",
    "options": [
      { "label": "启用", "value": "1" },
      { "label": "禁用", "value": "0" }
    ]
  }
]
`}
                      </pre>
                    </>
                  ) : null;
                }}
              </Form.Item>

              {filterFields.length > 0 && (
                <>
                  <span style={INFO_TITLE_L1_STYLE}>{t('关联筛选表单可选字段')}</span>
                  <div style={FIELD_BLOCK_STYLE}>
                    {filterFields.map((field, index) => (
                      <CopyableCode key={field.key} code={field.key} label={field.label} />
                    ))}
                  </div>
                </>
              )}
              <span style={INFO_TITLE_L1_STYLE}>{t('SQL Template Variables')}</span>
              <div style={FIELD_BLOCK_STYLE}>
                <code style={CODE_STYLE}>{'{{formValue}}'}</code>
                {' : '}
                {t('Form field value from the form schema')}
              </div>
              <div style={FIELD_BLOCK_STYLE}>
                <code style={CODE_STYLE}>{'{{ids}}'}</code>
                {' : '}
                {t('The ids of the current page data (only available in the row data sql template)')}
              </div>
              <span style={INFO_TITLE_L2_STYLE}>{t('Example')}</span>
              <pre style={PRE_STYLE}>
                {`// SQL模板示例
SELECT * FROM table WHERE id = {{formValue.tableId}} AND status = {{formValue.status}}`}
              </pre>
            </div>
          </div>

          <div style={INFO_BOX_WARNING_STYLE}>
            <div style={INFO_TITLE_WARNING_STYLE}>⚠️ {t('Important Notes')}</div>
            <div style={INFO_CONTENT_STYLE}>
              <ul style={LIST_STYLE}>
                <li>{t('Form schema must be a valid JSON array')}</li>
                <li>{t('Each form field must have a unique name')}</li>
                <li>{t('For select type fields, options array is required')}</li>
                <li>{t('SQL templates should use {{formValue.fieldName}} syntax to access form values')}</li>
                <li>{t('Make sure your SQL queries are safe and optimized')}</li>
              </ul>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

const CopyableCode: React.FC<{ code: string; label: string }> = ({ code, label }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 12 }}>
    <Typography.Text code copyable={{ text: code }}>
      {code}
    </Typography.Text>
    <span style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>({label})</span>
  </span>
);
