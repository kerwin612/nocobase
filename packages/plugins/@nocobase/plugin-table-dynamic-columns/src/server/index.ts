/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';

const fetchDataFromLocalSQL = async (ctx, next, sql) => {
  if (!sql) {
    ctx.throw(400, 'sql is required');
  }

  /**
   * // 使用 Sequelize 查询
   * // Sequelize group/aggregate
   * const repo = ctx.db.getRepository(tableId);
   * const rows = await repo.model.findAll({
   *   attributes: [
   *     fieldId, [ctx.db.sequelize.fn('COUNT', ctx.db.sequelize.col(fieldId)), 'count']
   *   ],
   *   group: [fieldId]
   * });
   * // 获取结果
   * const field = row[0][fieldId];
   * const count = row[0].count;
   */

  // 使用原生 SQL 查询
  const rows = await ctx.db.sequelize.query(sql, {
    type: ctx.db.sequelize.QueryTypes.SELECT,
  });
  ctx.body = { data: rows };

  await next();
};

const fetchDataFromRemoteAPI = async (ctx, next, data) => {
  // TODO: 从远程API获取数据
  ctx.throw(400, 'api方式暂未实现');
};

const fetchData = async (ctx, next) => {
  if (!ctx || !ctx.action || !ctx.action.params) {
    ctx.throw(400, 'params is required');
  }
  console.log('params:', ctx.action.params);
  const { data } = ctx.action.params;
  if (!data) {
    ctx.throw(400, 'data is required');
  }
  if (data.type === 'sql') {
    await fetchDataFromLocalSQL(ctx, next, data.data);
  } else if (data.type === 'api') {
    await fetchDataFromRemoteAPI(ctx, next, data.data);
  } else {
    ctx.throw(400, 'type must be sql or api');
  }
};

export class TableDynamicColumnsPlugin extends Plugin {
  async load() {
    this.app.resourceManager.registerActionHandlers({
      'collections:table_dynamic_columns-fetch_header': async (ctx, next) => {
        await fetchData(ctx, next);
      },
      'collections:table_dynamic_columns-fetch_rows': async (ctx, next) => {
        await fetchData(ctx, next);
      },
    });
  }
}

export default TableDynamicColumnsPlugin;
