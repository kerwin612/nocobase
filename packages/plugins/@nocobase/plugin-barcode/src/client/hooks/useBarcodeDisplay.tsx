/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useCallback, ReactNode, useEffect } from 'react';
import { CODE_TYPES, CodeSize } from '../constants';
import { executeValueGetter } from '../utils/barcodeUtils';
import { BarcodeModal, BarcodePopover } from '../components/BarcodeDisplayComponents';

/**
 * Configuration options for barcode display
 */
export interface BarcodeConfig {
  displayMode?: 'modal' | 'popover';
  codeSize?: CodeSize;
  codeType?: string;
  barcodeFormat?: string;
  valueGetter?: string;
}

/**
 * Parameters for the useBarcodeDisplay hook
 */
export interface UseBarcodeDisplayParams {
  objectValue?: any;
  fieldValue?: any;
  codeConfig?: BarcodeConfig;
}

/**
 * Result from the useBarcodeDisplay hook
 */
export interface UseBarcodeDisplayResult {
  modalVisible: boolean;
  showModal: () => void;
  hideModal: (e?: any) => void;
  handleButtonClick: (e: React.MouseEvent<HTMLElement>) => void;
  renderBarcodeDisplay: (children: ReactNode) => JSX.Element;
  codeContent: string;
}

/**
 * Custom hook to handle barcode display logic
 *
 * Manages modal visibility, event handling, and rendering of barcode display components
 */
export const useBarcodeDisplay = ({
  objectValue,
  fieldValue,
  codeConfig = {},
}: UseBarcodeDisplayParams): UseBarcodeDisplayResult => {
  const [modalVisible, setModalVisible] = useState(false);

  // Extract configuration options with defaults
  const displayMode = codeConfig.displayMode || 'modal';
  const size = codeConfig.codeSize || 'small';
  const codeType = codeConfig.codeType || CODE_TYPES.QRCODE;
  const barcodeFormat = codeConfig.barcodeFormat || 'CODE128';

  // Generate barcode content using valueGetter if provided
  const codeContent = executeValueGetter(codeConfig.valueGetter, objectValue, fieldValue);

  // Handle modal close with event isolation
  const hideModal = useCallback((e?: any) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    // Use timeout to ensure event finishes propagating before state change
    setTimeout(() => {
      setModalVisible(false);
    }, 0);
  }, []);

  // Show modal
  const showModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  // Manage body scrolling when modal is open/closed
  useEffect(() => {
    if (modalVisible && displayMode === 'modal') {
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';

      // Cleanup function to restore original overflow on unmount or modal close
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [modalVisible, displayMode]);

  // Button click handler with full event isolation
  const handleButtonClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      e.preventDefault();
      e.nativeEvent.stopImmediatePropagation();
      if (displayMode === 'modal') {
        showModal();
      }
    },
    [displayMode, showModal],
  );

  // Render the appropriate barcode display component
  const renderBarcodeDisplay = useCallback(
    (children: ReactNode): JSX.Element => {
      if (displayMode === 'popover') {
        return (
          <BarcodePopover
            content={codeContent}
            size={size as CodeSize}
            codeType={codeType}
            barcodeFormat={barcodeFormat}
          >
            {children}
          </BarcodePopover>
        );
      }

      // Default to modal mode
      return (
        <>
          {children}
          <BarcodeModal
            open={modalVisible}
            onCancel={hideModal}
            content={codeContent}
            size={size as CodeSize}
            codeType={codeType}
            barcodeFormat={barcodeFormat}
          />
        </>
      );
    },
    [codeContent, displayMode, modalVisible, hideModal, size, codeType, barcodeFormat],
  );

  return {
    modalVisible,
    showModal,
    hideModal,
    handleButtonClick,
    renderBarcodeDisplay,
    codeContent,
  };
};
