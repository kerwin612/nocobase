/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import {
  InitializerWithSwitch,
  RemoveButton,
  SchemaSettings,
  useAllDataBlocks,
  useBlockContext,
  useDesignable,
  useRequest,
  useSchemaInitializerItem,
  useSchemaToolbar,
} from '@nocobase/client';
import React, { useEffect, useRef, useState } from 'react';
import { DynamicColumnsSchemaSettings } from './DynamicColumnsSchemaSettings';
import { message, Popover } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { PopoverForm } from './components/PopoverForm';
import { useFieldSchema } from '@formily/react';
import {
  findChildrenElementWithClass,
  monitorContainerMutationsAndInvokeWhenFound,
  monitorTableBodyMutationsAndInvokeWhenFound,
} from './utils/dom';
import { NAMESPACE } from './constants';
import { addDynamicColumnHeaders, removeDynamicColumns, updateDynamicColumnRows } from './utils/helper';
import { useFilterForm } from './hooks/useFilterForm';

type BlockType = 'table' | 'filter-form' | 'unknown';

interface BlockTypeConfig {
  getTargetDataBlockUids: (fieldSchema: any) => string[];
}

const blockTypeConfigs: Record<BlockType, BlockTypeConfig> = {
  table: {
    getTargetDataBlockUids: (fieldSchema) => [fieldSchema?.parent?.parent?.['x-uid']],
  },
  'filter-form': {
    getTargetDataBlockUids: (fieldSchema) =>
      (fieldSchema?.parent?.parent?.parent?.['x-filter-targets'] ?? []).map((item: any) => item.uid),
  },
  unknown: {
    getTargetDataBlockUids: () => [],
  },
};

export const dynamicColumnsActionSettings = new SchemaSettings({
  name: 'actionSettings:dynamicColumns',
  items: [
    {
      name: 'dynamicColumnsConfig',
      Component: DynamicColumnsSchemaSettings,
    },
    {
      name: 'delete',
      sort: 100,
      Component: RemoveButton as any,
      useComponentProps() {
        const { removeButtonProps } = useSchemaToolbar();
        return removeButtonProps;
      },
    },
  ],
});

export const useDynamicColumnsActionProps = () => {
  const domRef = useRef<HTMLElement>(null);
  const fieldSchema = useFieldSchema();
  const blockContext = useBlockContext();
  const { designable } = useDesignable();
  const { getAllDataBlocks } = useAllDataBlocks();

  // 获取关联的过滤表单
  const filterForm = useFilterForm();

  // 所有数据区块
  const [allDataBlocks, setAllDataBlocks] = useState<any[]>([]);

  // 目标table
  const [targetTable, setTargetTable] = useState<HTMLTableElement | null>(null);

  // 目标table的当前页的行ID列表
  const [tableRowIds, setTableRowIds] = useState<string[]>([]);

  // 获取动态列配置
  const initialValues = fieldSchema?.['x-component-props']?.dynamicColumnsConfig;
  const defaultShowDynamicColumns = initialValues?.defaultShowDynamicColumns ?? true;
  const customFormSchema = initialValues?.formSchema ?? '';
  const headerFunctionTemplate = initialValues?.headerFunctionTemplate ?? '';
  const rowFunctionTemplate = initialValues?.rowFunctionTemplate ?? '';
  const rowIdColumnIndex = initialValues?.rowIdColumnIndex;
  const insertAfterColumnIndex = initialValues?.insertAfterColumnIndex ?? -1;
  const hasCustomForm = initialValues?.hasCustomForm ?? false;
  const showActionButton = initialValues?.showActionButton ?? false;

  // 动态列状态
  const [showDynamicColumns, setShowDynamicColumns] = useState(defaultShowDynamicColumns);
  const [customFormMetaData, setCustomFormMetaData] = useState<any[]>([]);
  const [customFormValues, setCustomFormValues] = useState<any>({});

  // 动态列头
  const [dynamicColumnsHeader, setDynamicColumnsHeader] = useState<any[]>([]);
  // 动态列行数据
  const [dynamicColumnsRowData, setDynamicColumnsRowData] = useState<any>({});

  // 是否展开浮窗
  const [popoverOpen, setPopoverOpen] = useState(false);

  // 用于获取动态列头
  const {
    loading: headerLoading,
    data: headerData,
    run: fetchHeader,
  } = useRequest<any>(
    {
      url: `collections:table_dynamic_columns-fetch_header`,
      skipAuth: true,
    },
    { manual: true },
  );

  // 用于获取动态列行数据
  const {
    loading: rowLoading,
    data: rowData,
    run: fetchRow,
  } = useRequest<any>(
    {
      url: `collections:table_dynamic_columns-fetch_rows`,
      skipAuth: true,
    },
    { manual: true },
  );

  /**
   * 初始化时，获取不到数据区块，所以需要定时获取
   */
  const initialInterval = setInterval(() => {
    const allDataBlocks = getAllDataBlocks?.();
    if (allDataBlocks?.length > 0) {
      setAllDataBlocks(allDataBlocks);
    }
    clearInterval(initialInterval);
  }, 100);

  /**
   * 获取目标数据区块的table
   * @param container
   * @returns
   */
  const findTargetTable = (container: HTMLElement): HTMLTableElement | null => {
    return findChildrenElementWithClass({
      container: container,
      excludeClass: ['skeleton-table'],
      nodeType: 'table',
    }) as HTMLTableElement | null;
  };

  /**
   * 添加table的增删tr监听
   * @param table 目标table
   * @param isInit 是否是初始化
   */
  const addTableObserver = (table: HTMLTableElement, isInit: boolean) => {
    const observer = monitorTableBodyMutationsAndInvokeWhenFound(
      table,
      (table) => {
        const tbody = table.querySelector('tbody');
        if (!tbody) {
          console.log(`[${NAMESPACE}] - tbody not found`);
          return;
        }
        const rows = Array.from(tbody.rows);
        const newRowIds = [];
        rows.forEach((row) => {
          const rowId = row.cells?.[rowIdColumnIndex]?.textContent?.trim() ?? '';
          if (rowId !== '') {
            newRowIds.push(rowId);
          }
        });
        setTableRowIds(newRowIds);
        observer?.disconnect();
      },
      isInit,
    );
  };

  /**
   * 关闭浮窗
   */
  const handleClose = () => {
    setPopoverOpen(false);
    setShowDynamicColumns(false);
  };

  /**
   * 应用自定义表单值
   * @param values 自定义表单值
   */
  const handleApply = async (values) => {
    console.log(`[${NAMESPACE}] - apply customFormValues:`, values);
    try {
      setPopoverOpen(false);
      setCustomFormValues(values);
      setShowDynamicColumns(true);
    } catch (e) {
      message.error(e.message);
    }
  };

  // 初始化时，获取目标数据区块
  useEffect(() => {
    if (!designable && !showActionButton && domRef.current) {
      // field.setDisplay('hidden'); // 这个setDisplay会导致action内的逻辑都不会执行
      const parent = domRef.current?.parentElement?.parentElement?.parentElement;
      if (parent) {
        parent.style.display = 'none';
      }
      console.log(`[${NAMESPACE}] - not designable and not showActionButton, so hide action button.`);
    }
    // 获取所在区块类型
    let blockType: BlockType = 'unknown';
    if (blockContext?.name === 'table') {
      blockType = 'table';
    } else if (blockContext?.name === 'filter-form') {
      blockType = 'filter-form';
    } else {
      const parentInitializer = fieldSchema?.parent?.['x-initializer'];
      if (parentInitializer === 'filterForm:configureActions') {
        blockType = 'filter-form';
      } else if (parentInitializer === 'table:configureActions') {
        blockType = 'table';
      }
    }
    console.log(`[${NAMESPACE}] - blockType:`, blockType);
    console.log(`[${NAMESPACE}] - allDataBlocks:`, allDataBlocks);

    // 获取目标数据区块
    const targetDataBlockUids = blockTypeConfigs[blockType].getTargetDataBlockUids(fieldSchema);
    const targetDataBlocks = allDataBlocks?.filter((block) => targetDataBlockUids.includes(block.uid)) ?? [];
    console.log(`[${NAMESPACE}] - targetDataBlocks:`, targetDataBlocks);

    // 获取目标数据区块的dom
    const targetBlockDom = targetDataBlocks?.[0]?.dom;
    console.log(`[${NAMESPACE}] - targetBlockDom:`, targetBlockDom);

    // 监听目标数据区块的dom变化，当table出现时，开始主流程
    const observer = monitorContainerMutationsAndInvokeWhenFound(
      targetBlockDom,
      findTargetTable,
      (table: HTMLTableElement) => {
        console.log(`[${NAMESPACE}] - table found:`, table);
        setTargetTable(table);
        addTableObserver(table, true);
      },
    );
    if (observer) {
      console.log(`[${NAMESPACE}] - init observer:`, observer);
    }

    return () => {
      if (initialInterval) {
        clearInterval(initialInterval);
      }
      observer?.disconnect();
    };
  }, [fieldSchema, blockContext, allDataBlocks]);

  // 解析自定义表单结构
  useEffect(() => {
    if (hasCustomForm) {
      try {
        const formMetaData = customFormSchema ? JSON.parse(customFormSchema) : [];
        setCustomFormMetaData(formMetaData);
        setCustomFormValues(
          formMetaData.reduce(
            (acc, item) => ({
              ...acc,
              [item.name]: item.defaultValue,
            }),
            {},
          ),
        );
      } catch (e) {
        console.error(`[${NAMESPACE}] - parse customFormSchema error:`, e);
      }
    }
  }, [hasCustomForm, customFormSchema]);

  // 获取动态列头
  useEffect(() => {
    if (!headerFunctionTemplate) {
      console.log(`[${NAMESPACE}] - headerFunctionTemplate is empty`);
      return;
    }
    if (!showDynamicColumns) {
      console.log(`[${NAMESPACE}] - showDynamicColumns is false`);
      return;
    }
    let data = null;
    try {
      data = eval(headerFunctionTemplate)(customFormValues, filterForm.values);
    } catch (e) {
      // 初始化时，两个form的值都是空，所以不显示错误
      if (Object.keys(customFormValues).length > 0 || Object.keys(filterForm.values).length > 0) {
        message.error(e.message);
      }
      console.error(`[${NAMESPACE}] - eval headerFunctionTemplate error:`, e);
    }
    if (data) {
      console.log(`[${NAMESPACE}] - fetchHeader data:`, data);
      fetchHeader({ data });
    }
  }, [customFormValues, fetchHeader, headerFunctionTemplate, showDynamicColumns]);

  // 处理动态列头数据
  useEffect(() => {
    if (!headerLoading && headerData?.data?.data && showDynamicColumns) {
      // 统一处理ID的类型为字符串，避免出现数字类型导致对象属性名不一致
      // 将key转换为字符串，因为key可能是数字
      const dynamicColumnsHeader = headerData.data.data.map((item) => ({
        id: String(item.key),
        title: `${item.value}`,
      }));
      console.log(`[${NAMESPACE}] - dynamicColumnsHeader:`, dynamicColumnsHeader);
      setDynamicColumnsHeader(dynamicColumnsHeader);
    }
  }, [headerLoading, headerData, showDynamicColumns]);

  // 获取动态列行数据
  useEffect(() => {
    if (!rowFunctionTemplate) {
      console.log(`[${NAMESPACE}] - rowFunctionTemplate is empty`);
      return;
    }
    if (!showDynamicColumns) {
      console.log(`[${NAMESPACE}] - showDynamicColumns is false`);
      return;
    }
    if (tableRowIds.length > 0) {
      let data = null;
      try {
        data = eval(rowFunctionTemplate)(customFormValues, filterForm.values, tableRowIds);
      } catch (e) {
        // 初始化时，两个form的值都是空，所以不显示错误
        if (Object.keys(customFormValues).length > 0 || Object.keys(filterForm.values).length > 0) {
          message.error(e.message);
        }
        console.error(`[${NAMESPACE}] - eval rowFunctionTemplate error:`, e);
      }
      if (data) {
        console.log(`[${NAMESPACE}] - fetchRow data:`, data);
        fetchRow({ data });
      }
    }
  }, [tableRowIds, fetchRow, customFormValues, rowFunctionTemplate, showDynamicColumns]);

  // 处理动态列行数据
  useEffect(() => {
    if (!rowLoading && rowData?.data?.data && showDynamicColumns) {
      const dynamicColumnsRowData = rowData.data.data.reduce((acc, item) => {
        const { rowKey, colKey, value } = item;
        // 统一处理ID的类型为字符串，避免出现数字类型导致对象属性名不一致
        // 将rowKey和colKey转换为字符串，因为rowKey和colKey可能是数字
        const strRowKey = String(rowKey);
        const strColKey = String(colKey);
        if (!acc[strRowKey]) {
          acc[strRowKey] = {};
        }
        acc[strRowKey][strColKey] = value;
        return acc;
      }, {});
      console.log(`[${NAMESPACE}] - dynamicColumnsRowData:`, dynamicColumnsRowData);
      setDynamicColumnsRowData(dynamicColumnsRowData);
    }
  }, [rowLoading, rowData, showDynamicColumns]);

  // 监听targetTable的变化，当targetTable变化时，更新动态列头
  useEffect(() => {
    if (targetTable && showDynamicColumns) {
      console.log(`[${NAMESPACE}] - targetTable changed`);
      addDynamicColumnHeaders(targetTable, insertAfterColumnIndex, dynamicColumnsHeader);
      console.log(`[${NAMESPACE}] - addDynamicColumnHeaders`);
    }
    if (!showDynamicColumns) {
      removeDynamicColumns(targetTable);
    }
  }, [targetTable, showDynamicColumns, dynamicColumnsHeader]);

  // 监听targetTable的变化，当targetTable变化时，更新动态列行数据
  useEffect(() => {
    if (targetTable && tableRowIds.length > 0 && showDynamicColumns) {
      console.log(
        `[${NAMESPACE}] - targetTable changed, tableRowIds: ${tableRowIds}, dynamicColumnsHeader: ${JSON.stringify(
          dynamicColumnsHeader,
        )}, dynamicColumnsRowData: ${JSON.stringify(dynamicColumnsRowData)}`,
      );
      updateDynamicColumnRows(
        targetTable,
        insertAfterColumnIndex,
        dynamicColumnsHeader,
        (row: HTMLTableRowElement) => {
          // ID有值，则生成动态列数据，否则不生成
          const rowId = row.cells[rowIdColumnIndex]?.textContent?.trim() ?? '';
          return rowId !== '' ? dynamicColumnsRowData?.[rowId] ?? {} : null;
        },
        (rowData: any, columnId: string) => {
          return rowData?.[columnId] ?? '';
        },
      );
      console.log(`[${NAMESPACE}] - updateDynamicColumnRows`);
    }
    if (!showDynamicColumns) {
      removeDynamicColumns(targetTable);
    } else {
      // 行数据更新完成后再次监听表格
      addTableObserver(targetTable, false);
    }
  }, [targetTable, tableRowIds, showDynamicColumns, dynamicColumnsHeader, dynamicColumnsRowData]);

  return {
    icon: showDynamicColumns ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    title: popoverOpen ? (
      <Popover
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
        destroyTooltipOnHide
        content={
          <PopoverForm
            formMetaData={customFormMetaData}
            values={customFormValues}
            onApply={handleApply}
            onClose={handleClose}
          />
        }
        trigger="click"
        placement="bottomLeft"
      >
        <span ref={domRef}>{'动态列'}</span>
      </Popover>
    ) : (
      <span ref={domRef}>{'动态列'}</span>
    ),
    onClick: () => {
      if (hasCustomForm) {
        if (!customFormMetaData || customFormMetaData.length < 1) {
          message.error('请先配置动态列');
          return;
        } else {
          setPopoverOpen(true);
        }
      } else {
        // 如果没有配置自定义表单，则按钮逻辑改为：toggle逻辑
        setShowDynamicColumns(!showDynamicColumns);
      }
    },
  };
};

export const DynamicColumnsActionInitializer = (props) => {
  const schema = {
    'x-component': 'Action',
    'x-use-component-props': 'useDynamicColumnsActionProps',
    'x-settings': 'actionSettings:dynamicColumns',
    'x-toolbar': 'ActionSchemaToolbar',
  };
  const itemConfig = useSchemaInitializerItem();
  return <InitializerWithSwitch {...itemConfig} {...props} schema={schema} item={itemConfig} type={'x-action'} />;
};
