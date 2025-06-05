/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { useField, useFieldSchema } from '@formily/react';
import { SchemaSettingsItem, useDesignable } from '@nocobase/client';
import React, { useEffect, useState, CSSProperties } from 'react';
import { NAMESPACE } from './constants';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Button, message, Select, Slider, Row, Col, ColorPicker } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { Model } from '@nocobase/database';

const { TextArea } = Input;
const { Option } = Select;

// Type definitions for better type safety
interface FullscreenStyleConfigModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: FormValues) => void;
  initialStyle?: string;
  t: (key: string) => string;
}

interface ButtonConfigModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: ButtonConfigValues) => void;
  initialConfig?: ButtonConfigValues;
  t: (key: string) => string;
}

interface FormValues {
  fullscreenStyle: string;
}

interface ButtonConfigValues {
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'custom';
  customAnchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  customX?: number;
  customY?: number;
  opacity: number;
  backgroundColor: string;
  iconColor: string;
  borderRadius: number;
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
};

const FORM_STYLE: CSSProperties = {
  flex: 1,
};

const TEXTAREA_STYLE: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '12px',
  minHeight: '300px',
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

const INFO_TITLE_GUIDE_STYLE: CSSProperties = {
  ...INFO_TITLE_STYLE,
  color: '#1890ff',
};

const INFO_TITLE_WARNING_STYLE: CSSProperties = {
  ...INFO_TITLE_STYLE,
  color: '#fa8c16',
};

const INFO_CONTENT_STYLE: CSSProperties = {
  color: '#666',
  lineHeight: '1.6',
  fontSize: '13px',
};

const CODE_STYLE: CSSProperties = {
  backgroundColor: '#f0f0f0',
  padding: '2px 4px',
  borderRadius: '3px',
};

const PRE_STYLE: CSSProperties = {
  backgroundColor: '#f0f0f0',
  padding: '8px',
  borderRadius: '4px',
  fontSize: '12px',
  margin: '0',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

const LIST_STYLE: CSSProperties = {
  margin: '0',
  paddingLeft: '20px',
};

// Button configuration modal component
const ButtonConfigModal: React.FC<ButtonConfigModalProps> = ({ visible, onCancel, onOk, initialConfig, t }) => {
  const [form] = Form.useForm<ButtonConfigValues>();
  const [position, setPosition] = useState<string>('top-right');
  const [previewConfig, setPreviewConfig] = useState<ButtonConfigValues>();
  const [previewHovered, setPreviewHovered] = useState(false);

  useEffect(() => {
    if (visible) {
      const defaultConfig = {
        position: 'top-right' as const,
        customAnchor: 'top-right' as const,
        customX: 8,
        customY: 8,
        opacity: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        iconColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 15,
        ...initialConfig,
      };
      form.setFieldsValue(defaultConfig);
      setPosition(defaultConfig.position);
      setPreviewConfig(defaultConfig);

      // If opening with custom position, ensure the form state is immediately synchronized
      if (defaultConfig.position === 'custom') {
        // Small delay to ensure form is fully initialized
        setTimeout(() => {
          const currentValues = form.getFieldsValue();
          setPreviewConfig(currentValues);
        }, 0);
      }
    }
  }, [visible, initialConfig, form]);

  // Handle form value changes for real-time preview
  const handleFormChange = (changedValues: any, allValues: ButtonConfigValues) => {
    // Ensure custom position values are properly set when position changes
    if (changedValues.position === 'custom') {
      if (!allValues.customAnchor) allValues.customAnchor = 'top-right';
      if (!allValues.customX) allValues.customX = 8;
      if (!allValues.customY) allValues.customY = 8;
    }

    // Update position state if it changed
    if (changedValues.position) {
      setPosition(changedValues.position);
    }

    // ColorPicker now directly provides string values
    setPreviewConfig(allValues);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // ColorPicker now directly provides string values, no conversion needed
      onOk(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Helper function to generate preview button styles
  const getPreviewButtonStyle = (): CSSProperties => {
    if (!previewConfig) return {};

    const baseStyle: CSSProperties = {
      opacity: previewHovered ? 1 : previewConfig.opacity / 100,
      background: previewConfig.backgroundColor,
      color: previewConfig.iconColor,
      borderRadius: `${previewConfig.borderRadius}%`,
      position: 'absolute',
      zIndex: 1,
      transition: 'opacity 0.3s ease',
      cursor: 'pointer',
    };

    switch (previewConfig.position) {
      case 'top-left':
        return { ...baseStyle, top: '8px', left: '8px' };
      case 'bottom-right':
        return { ...baseStyle, bottom: '8px', right: '8px' };
      case 'bottom-left':
        return { ...baseStyle, bottom: '8px', left: '8px' };
      case 'custom': {
        const anchor = previewConfig.customAnchor || 'top-right';
        const x = previewConfig.customX || 8;
        const y = previewConfig.customY || 8;

        switch (anchor) {
          case 'top-left':
            return { ...baseStyle, top: `${y}px`, left: `${x}px` };
          case 'top-right':
            return { ...baseStyle, top: `${y}px`, right: `${x}px` };
          case 'bottom-left':
            return { ...baseStyle, bottom: `${y}px`, left: `${x}px` };
          case 'bottom-right':
            return { ...baseStyle, bottom: `${y}px`, right: `${x}px` };
          default:
            return { ...baseStyle, top: `${y}px`, right: `${x}px` };
        }
      }
      case 'top-right':
      default:
        return { ...baseStyle, top: '8px', right: '8px' };
    }
  };

  return (
    <Modal
      title={t('Button Configuration')}
      open={visible}
      onCancel={onCancel}
      width={MODAL_CONFIG.width}
      maskClosable={false}
      keyboard={false}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t('Cancel')}
        </Button>,
        <Button key="ok" type="primary" onClick={handleOk}>
          {t('Save')}
        </Button>,
      ]}
    >
      <Row gutter={24}>
        {/* Configuration Form */}
        <Col span={16}>
          <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
            <Form.Item
              name="position"
              label={t('Button Position')}
              rules={[{ required: true, message: t('Please select button position') }]}
            >
              <Select
                onChange={(value) => {
                  setPosition(value);
                  // When switching to custom position, ensure form has proper default values
                  if (value === 'custom') {
                    const currentValues = form.getFieldsValue();
                    const updatedValues = {
                      ...currentValues,
                      position: value,
                      // Set default custom position if not already set
                      customAnchor: currentValues.customAnchor ?? 'top-right',
                      customX: currentValues.customX ?? 8,
                      customY: currentValues.customY ?? 8,
                    };
                    form.setFieldsValue(updatedValues);
                    setPreviewConfig(updatedValues);
                  } else {
                    // For predefined positions, update preview immediately
                    const currentValues = form.getFieldsValue();
                    const updatedValues = { ...currentValues, position: value };
                    setPreviewConfig(updatedValues);
                  }
                }}
              >
                <Option value="top-right">{t('Top Right')}</Option>
                <Option value="top-left">{t('Top Left')}</Option>
                <Option value="bottom-right">{t('Bottom Right')}</Option>
                <Option value="bottom-left">{t('Bottom Left')}</Option>
                <Option value="custom">{t('Custom Position')}</Option>
              </Select>
            </Form.Item>

            {position === 'custom' && (
              <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
                <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 500, color: '#666' }}>
                  {t('Custom Position Settings')}
                  {previewConfig && (
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#999' }}>
                      ({t('Current')}:{' '}
                      {t(
                        (previewConfig.customAnchor || 'top-right')
                          .replace('-', ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase()),
                      )}{' '}
                      + X: {previewConfig.customX}px, Y: {previewConfig.customY}px)
                    </span>
                  )}
                </div>

                <Form.Item
                  name="customAnchor"
                  label={t('Anchor Point')}
                  rules={[{ required: true, message: t('Please select anchor point') }]}
                  tooltip={t('Choose which corner to position relative to')}
                >
                  <Select
                    onChange={(value) => {
                      const currentValues = form.getFieldsValue();
                      const updatedValues = { ...currentValues, customAnchor: value };
                      setPreviewConfig(updatedValues);
                    }}
                  >
                    <Option value="top-left">{t('Top Left')}</Option>
                    <Option value="top-right">{t('Top Right')}</Option>
                    <Option value="bottom-left">{t('Bottom Left')}</Option>
                    <Option value="bottom-right">{t('Bottom Right')}</Option>
                  </Select>
                </Form.Item>

                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="customX"
                      label={t('X Distance (px)')}
                      rules={[{ required: true, message: t('Please enter X distance') }]}
                      tooltip={t('Horizontal distance from anchor point')}
                    >
                      <Slider
                        min={0}
                        max={150}
                        step={1}
                        marks={{
                          0: '0px',
                          40: '40px',
                          80: '80px',
                          120: '120px',
                          150: '150px',
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="customY"
                      label={t('Y Distance (px)')}
                      rules={[{ required: true, message: t('Please enter Y distance') }]}
                      tooltip={t('Vertical distance from anchor point')}
                    >
                      <Slider
                        min={0}
                        max={150}
                        step={1}
                        marks={{
                          0: '0px',
                          40: '40px',
                          80: '80px',
                          120: '120px',
                          150: '150px',
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            )}

            <Form.Item name="opacity" label={t('Button Opacity (%)')}>
              <Slider
                min={10}
                max={100}
                marks={{
                  10: '10%',
                  30: '30%',
                  60: '60%',
                  100: '100%',
                }}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="backgroundColor" label={t('Background Color')}>
                  <ColorPicker
                    showText
                    format="rgb"
                    onChange={(color, css) => {
                      // Prevent modal from closing and handle color change properly
                      const colorString = css || color?.toRgbString?.() || 'rgba(255, 255, 255, 0.8)';
                      form.setFieldValue('backgroundColor', colorString);

                      // Update preview config immediately
                      const currentValues = form.getFieldsValue();
                      setPreviewConfig({ ...currentValues, backgroundColor: colorString });
                    }}
                    presets={[
                      {
                        label: t('Recommended'),
                        colors: [
                          'rgba(255, 255, 255, 0.8)',
                          'rgba(0, 0, 0, 0.6)',
                          'rgba(24, 144, 255, 0.8)',
                          'rgba(82, 196, 26, 0.8)',
                          'rgba(245, 34, 45, 0.8)',
                        ],
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="iconColor" label={t('Icon Color')}>
                  <ColorPicker
                    showText
                    format="rgb"
                    onChange={(color, css) => {
                      // Prevent modal from closing and handle color change properly
                      const colorString = css || color?.toRgbString?.() || 'rgba(0, 0, 0, 0.8)';
                      form.setFieldValue('iconColor', colorString);

                      // Update preview config immediately
                      const currentValues = form.getFieldsValue();
                      setPreviewConfig({ ...currentValues, iconColor: colorString });
                    }}
                    presets={[
                      {
                        label: t('Recommended'),
                        colors: [
                          'rgba(0, 0, 0, 0.8)',
                          'rgba(255, 255, 255, 0.9)',
                          'rgba(24, 144, 255, 1)',
                          'rgba(82, 196, 26, 1)',
                          'rgba(245, 34, 45, 1)',
                        ],
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="borderRadius" label={t('Border Radius (%)')} tooltip={t('Percentage of button size')}>
              <Slider
                min={0}
                max={50}
                step={5}
                marks={{
                  0: '0%',
                  10: '10%',
                  25: '25%',
                  50: '50%',
                }}
              />
            </Form.Item>
          </Form>
        </Col>

        {/* Preview Area */}
        <Col span={8}>
          <div style={{ marginBottom: '16px' }}>
            <strong>{t('Real-time Preview')}</strong>
          </div>
          <div
            style={{
              width: '100%',
              height: '280px',
              border: '2px dashed #d9d9d9',
              borderRadius: '6px',
              position: 'relative',
              background:
                'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
          >
            <Button
              type="text"
              icon={<FullscreenOutlined />}
              style={getPreviewButtonStyle()}
              onMouseEnter={() => setPreviewHovered(true)}
              onMouseLeave={() => setPreviewHovered(false)}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                fontSize: '12px',
                color: '#999',
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {t('Preview')}
            </div>
          </div>

          {/* Configuration Summary */}
          {previewConfig && (
            <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
              <div>
                <strong>{t('Position')}:</strong>{' '}
                {t(
                  previewConfig.position === 'top-right'
                    ? 'Top Right'
                    : previewConfig.position === 'top-left'
                      ? 'Top Left'
                      : previewConfig.position === 'bottom-right'
                        ? 'Bottom Right'
                        : previewConfig.position === 'bottom-left'
                          ? 'Bottom Left'
                          : 'Custom Position',
                )}
              </div>
              {previewConfig.position === 'custom' && (
                <div>
                  <strong>{t('Custom Position')}:</strong> X: {previewConfig.customX}%, Y: {previewConfig.customY}%
                </div>
              )}
              <div>
                <strong>{t('Button Opacity (%)')}:</strong> {previewConfig.opacity}%
              </div>
              <div>
                <strong>{t('Background Color')}:</strong> {previewConfig.backgroundColor}
              </div>
              <div>
                <strong>{t('Icon Color')}:</strong> {previewConfig.iconColor}
              </div>
              <div>
                <strong>{t('Border Radius (%)')}:</strong> {previewConfig.borderRadius}%
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Modal>
  );
};

// Style configuration modal component
const FullscreenStyleConfigModal: React.FC<FullscreenStyleConfigModalProps> = ({
  visible,
  onCancel,
  onOk,
  initialStyle,
  t,
}) => {
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        fullscreenStyle: initialStyle ?? '',
      });
    }
  }, [visible, initialStyle, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  return (
    <Modal
      title={t('Custom Fullscreen Style')}
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
          <Form.Item
            name="fullscreenStyle"
            label={t('Custom CSS')}
            style={{ marginBottom: '16px' }}
            tooltip={t('You can use ${blockId} to reference the current block ID')}
          >
            <TextArea rows={12} style={TEXTAREA_STYLE} placeholder={t('Enter your custom CSS here...')} />
          </Form.Item>

          <div style={INFO_BOX_GUIDE_STYLE}>
            <div style={INFO_TITLE_GUIDE_STYLE}>💡 {t('Style Configuration Guide')}</div>
            <div style={INFO_CONTENT_STYLE}>
              <div style={{ marginBottom: '8px' }}>
                <strong>{t('Available Variables')}:</strong>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <code style={CODE_STYLE}>{'${blockId}'}</code>
                {' : '}
                {t('The ID of the current block')}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>{t('Example')}:</strong>
              </div>
              <pre style={PRE_STYLE}>
                {`\${blockId} {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

\${blockId} .title {
  font-size: 18px;
  color: #333;
  font-weight: bold;
}

\${blockId} .content {
  margin-top: 10px;
  line-height: 1.6;
}`}
              </pre>
            </div>
          </div>

          <div style={INFO_BOX_WARNING_STYLE}>
            <div style={INFO_TITLE_WARNING_STYLE}>⚠️ {t('Important Notes')}</div>
            <div style={INFO_CONTENT_STYLE}>
              <ul style={LIST_STYLE}>
                <li>{t('The ${blockId} variable will be automatically replaced with the actual block ID')}</li>
                <li>{t('Make sure your CSS syntax is correct to avoid display issues')}</li>
                <li>{t('The styles will only apply when the block is in fullscreen mode')}</li>
                <li>{t('You can use any valid CSS properties and selectors')}</li>
              </ul>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export function FullscreenBlockSchemaSettings() {
  const { dn } = useDesignable();
  const { t } = useTranslation(NAMESPACE);
  const fieldSchema = useFieldSchema();
  const field = useField();
  const [styleModalVisible, setStyleModalVisible] = useState(false);
  const [buttonModalVisible, setButtonModalVisible] = useState(false);

  const initialStyle = fieldSchema?.['x-component-props']?.custom?.fullscreenStyle;
  const initialButtonConfig = fieldSchema?.['x-component-props']?.custom?.buttonConfig;

  const handleStyleModalOk = (values: FormValues) => {
    const { fullscreenStyle } = values;

    // Update field configuration
    fieldSchema['x-component-props'] = fieldSchema['x-component-props'] || {};
    fieldSchema['x-component-props'].custom = fieldSchema['x-component-props'].custom || {};
    fieldSchema['x-component-props'].custom.fullscreenStyle = fullscreenStyle;

    // Update field instance
    field.componentProps = field.componentProps || {};
    field.componentProps.custom = field.componentProps.custom || {};
    field.componentProps.custom.fullscreenStyle = fullscreenStyle;

    // Send update event
    dn.emit('patch', {
      schema: {
        ['x-uid']: fieldSchema['x-uid'],
        'x-component-props': {
          ...fieldSchema['x-component-props'],
        },
      },
    });

    message.success(t('Style configuration saved successfully'));
    setStyleModalVisible(false);
  };

  const handleButtonModalOk = (values: ButtonConfigValues) => {
    // Update field configuration
    fieldSchema['x-component-props'] = fieldSchema['x-component-props'] || {};
    fieldSchema['x-component-props'].custom = fieldSchema['x-component-props'].custom || {};
    fieldSchema['x-component-props'].custom.buttonConfig = values;

    // Update field instance
    field.componentProps = field.componentProps || {};
    field.componentProps.custom = field.componentProps.custom || {};
    field.componentProps.custom.buttonConfig = values;

    // Send update event
    dn.emit('patch', {
      schema: {
        ['x-uid']: fieldSchema['x-uid'],
        'x-component-props': {
          ...fieldSchema['x-component-props'],
        },
      },
    });

    message.success(t('Button configuration saved successfully'));
    setButtonModalVisible(false);
  };

  return (
    <>
      <SchemaSettingsItem title={t('Button Configuration')} onClick={() => setButtonModalVisible(true)} />
      <SchemaSettingsItem title={t('Custom Fullscreen Style')} onClick={() => setStyleModalVisible(true)} />
      <FullscreenStyleConfigModal
        visible={styleModalVisible}
        onCancel={() => setStyleModalVisible(false)}
        onOk={handleStyleModalOk}
        initialStyle={initialStyle}
        t={t}
      />
      <ButtonConfigModal
        visible={buttonModalVisible}
        onCancel={() => setButtonModalVisible(false)}
        onOk={handleButtonModalOk}
        initialConfig={initialButtonConfig}
        t={t}
      />
    </>
  );
}
