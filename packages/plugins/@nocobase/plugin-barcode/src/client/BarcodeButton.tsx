/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { QrcodeOutlined, BarcodeOutlined } from '@ant-design/icons';
import { observer, useField, useFieldSchema } from '@formily/react';
import { useCollectionRecord, useToken } from '@nocobase/client';
import { Field } from '@nocobase/database';
import { Button } from 'antd';
import React, { FC, useRef, useState, useEffect } from 'react';
import { CODE_TYPES } from './constants';
import { useBarcodeDisplay, BarcodeConfig } from './hooks/useBarcodeDisplay';

/**
 * Props for the BarcodeButton component
 */
interface BarcodeButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A button component that displays barcode or QR code on click/hover
 *
 * This component is used in fields to render a button next to the field value
 * that can show barcode or QR code in a modal or popover
 */
export const BarcodeButton: FC<BarcodeButtonProps> = observer(
  ({ className, style }) => {
    // Get field information
    const field = useField<Field>();
    const record = useCollectionRecord();
    const fieldSchema = useFieldSchema();
    const { token } = useToken();

    // References and state
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [show, setShow] = useState(false);

    // Get barcode configuration from field schema
    const componentProps = fieldSchema?.['x-component-props'] || {};
    const codeConfig: BarcodeConfig = componentProps?.codeConfig || {};
    const codeType = codeConfig.codeType || CODE_TYPES.QRCODE;

    // Use the shared hook for barcode display
    const { handleButtonClick, renderBarcodeDisplay } = useBarcodeDisplay({
      objectValue: record?.data,
      fieldValue: field?.['value'],
      codeConfig,
    });

    // Select appropriate icon based on code type
    const BarcodeIcon = codeType === CODE_TYPES.QRCODE ? QrcodeOutlined : BarcodeOutlined;

    // Show/hide button on mouse over/out for readPretty mode
    useEffect(() => {
      if (field.value && field.readPretty && buttonRef.current) {
        const currentRef = buttonRef.current;
        const handleMouseOver = () => setShow(true);
        const handleMouseOut = () => setShow(false);

        currentRef?.parentElement?.addEventListener('mouseover', handleMouseOver);
        currentRef?.parentElement?.addEventListener('mouseout', handleMouseOut);

        return () => {
          currentRef?.parentElement?.removeEventListener('mouseover', handleMouseOver);
          currentRef?.parentElement?.removeEventListener('mouseout', handleMouseOut);
        };
      }
    }, [field.readPretty, field?.['value']]);

    // Determine if button should be hidden
    const hidden = field.readPretty && (!field?.['value'] || !show);

    // Create button element with appropriate event handlers
    const buttonElement = (
      <Button
        ref={buttonRef}
        type="link"
        onClick={handleButtonClick}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        icon={<BarcodeIcon />}
        style={{
          marginLeft: field.readPretty ? token.marginXXS : 0,
          opacity: hidden ? 0 : 1,
          ...style,
        }}
        className={className}
      />
    );

    // Use the shared rendering function
    return renderBarcodeDisplay(buttonElement);
  },
  {
    displayName: 'BarcodeButton',
  },
);
