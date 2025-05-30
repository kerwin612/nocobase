# CustomSelector 使用指南

## 快速开始

### 1. 安装插件

在 NocoBase 管理界面中：
1. 进入 **插件管理**
2. 找到 **Custom Selector** 插件
3. 点击 **启用**

### 2. 配置关联字段

#### 步骤一：创建数据表
假设我们有两个数据表：
- `users` (用户表)
- `departments` (部门表)

#### 步骤二：添加关联字段
在用户表中添加一个关联字段：
1. 进入用户表的字段配置
2. 添加新字段，类型选择 **关联字段**
3. 配置关联目标为 `departments` 表
4. 设置关联类型（如：多对一）

#### 步骤三：启用自定义选择器
1. 在表单设计器中选择关联字段
2. 在字段设置中找到 **Custom Selector** 开关
3. 开启该功能

## 功能演示

### 基本选择功能
```typescript
// 字段配置示例
{
  "type": "string",
  "x-component": "AssociationField",
  "x-component-props": {
    "mode": "CustomSelector",
    "enableCustomSelector": true
  },
  "x-collection-field": "department"
}
```

### 搜索功能
- 在弹出的选择器中输入关键词
- 系统会自动在后端进行模糊搜索
- 支持实时搜索，300ms 防抖

### 分页功能
- 默认每页显示 10 条记录
- 支持页码跳转
- 显示总数统计

### 丰富的列表项显示
插件支持智能识别和显示多种信息：

#### 头像显示
- 自动识别标准头像字段：`avatar`、`photo`、`image`、`picture`
- 支持自定义字段（如：`f_wh29qtsrvv1`）
- 如果没有头像，显示姓名首字母

#### 主要信息显示
优先级顺序：
1. `targetKey` 字段（关联字段配置的显示字段）
2. `name` 字段
3. `title` 字段
4. `label` 字段
5. `nickname` 字段（昵称）
6. `username` 字段（用户名）
7. `displayName` 字段
8. `id` 字段

#### 次要信息显示
自动组合以下信息（用 " - " 分隔）：
- **组织信息**: `department`、`organization`、`company`
- **职位信息**: `position`、`role`、`title`
- **联系信息**: `email`、`phone`
- **编号信息**: `code`、`number`

#### 数据结构示例
```json
{
  "id": 4,
  "nickname": "董涛",
  "username": "111",
  "email": "111@nocobase.com",
  "phone": "19916710075",
  "f_wh29qtsrvv1": "https://avatars.githubusercontent.com/u/3371163?v=4",
  "department": "手机部-智能制造部-软件工程部-工业平台组",
  "position": "高级工程师"
}
```

上述数据会显示为：
- **头像**: 来自 `f_wh29qtsrvv1` 字段的图片
- **主要信息**: "董涛" (来自 `nickname` 字段)
- **次要信息**: "手机部-智能制造部-软件工程部-工业平台组 - 高级工程师 - 111@nocobase.com - 19916710075"

## 高级配置

### 自定义显示字段
插件会自动识别目标表的主要显示字段：
1. 优先使用 `targetKey` 字段
2. 其次尝试 `name` 字段
3. 再次尝试 `title` 字段
4. 最后使用 `label` 字段
5. 如果都没有，则显示 `id`

### 关联类型支持
- **一对一 (OneToOne)**: 选择单个记录
- **多对一 (ManyToOne)**: 从多个选项中选择一个
- **一对多 (OneToMany)**: 支持选择多个记录
- **多对多 (ManyToMany)**: 支持选择多个记录

### 过滤条件
对于一对一和一对多关联，插件会自动添加过滤条件：
```sql
WHERE foreign_key IS NULL OR foreign_key = current_record_id
```

### 样式自定义
列表项采用卡片式布局：
- 头像尺寸：40px
- 主要文本：14px，粗体，深色
- 次要文本：12px，常规，灰色
- 支持文本溢出省略
- 鼠标悬停高亮效果

## 故障排除

### 常见问题

#### 1. 选择器无法打开
**原因**: 关联字段配置不正确
**解决**: 检查字段的 `x-collection-field` 配置

#### 2. 搜索无结果
**原因**: 目标表缺少可搜索字段
**解决**: 确保目标表包含 `name`、`title` 或 `label` 字段

#### 3. 数据不显示
**原因**: 权限不足或目标表为空
**解决**: 检查用户权限和目标表数据

#### 4. 头像不显示
**原因**: 头像字段配置问题
**解决**: 
- 检查头像字段是否包含有效的URL
- 确认字段名是否符合识别规则
- 验证图片URL是否可访问

#### 5. 次要信息不完整
**原因**: 数据字段缺失
**解决**: 
- 检查目标表是否包含相关字段
- 确认字段数据是否完整
- 验证字段命名是否符合规范

### 调试信息
插件会在浏览器控制台输出调试信息：
```javascript
console.warn('CustomSelector: 未找到关联字段配置或目标表', {
  fieldSchema: fieldSchema?.name,
  collectionField
});
```

## API 参考

### CustomSelector 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `value` | `any` | - | 当前选中的值 |
| `onChange` | `(value: any) => void` | - | 值变化回调 |
| `placeholder` | `string` | 自动翻译 | 输入框占位符 |

### 查询参数结构
```typescript
interface QueryParams {
  page: number;           // 当前页码
  pageSize: number;       // 每页大小
  filter?: {              // 过滤条件
    [field: string]: {
      $includes: string;  // 模糊搜索
    };
  };
}
```

### 响应数据结构
```typescript
interface ResponseData {
  data: Array<any>;       // 数据列表
  meta: {
    count: number;        // 总数
    page: number;         // 当前页
    pageSize: number;     // 每页大小
  };
}
```

### 字段识别函数

#### 头像字段识别
```typescript
const getAvatarField = (item: any) => {
  // 查找标准头像字段
  const avatarFields = ['avatar', 'photo', 'image', 'picture'];
  for (const field of avatarFields) {
    if (item[field]) return item[field];
  }
  
  // 查找自定义字段（如 f_wh29qtsrvv1）
  for (const key in item) {
    if (key.startsWith('f_') && typeof item[key] === 'string' && 
        (item[key].includes('http') || item[key].includes('avatar') || item[key].includes('image'))) {
      return item[key];
    }
  }
  return null;
};
```

#### 主要文本识别
```typescript
const getPrimaryText = (item: any) => {
  const labelField = collectionField?.targetKey || 'name' || 'title' || 'label';
  return item[labelField] || item.nickname || item.username || item.displayName || item.id;
};
```

#### 次要文本组合
```typescript
const getSecondaryText = (item: any) => {
  const parts = [];
  
  // 组织信息
  if (item.department) parts.push(item.department);
  if (item.organization) parts.push(item.organization);
  if (item.company) parts.push(item.company);
  
  // 职位信息
  if (item.position) parts.push(item.position);
  if (item.role) parts.push(item.role);
  
  // 联系信息
  if (item.email) parts.push(item.email);
  if (item.phone) parts.push(item.phone);
  
  return parts.join(' - ');
};
```

## 最佳实践

### 1. 性能优化
- 为目标表的搜索字段添加数据库索引
- 合理设置每页显示数量
- 使用适当的过滤条件减少数据量
- 优化头像图片大小和格式

### 2. 用户体验
- 为关联字段设置有意义的标题
- 确保目标表有清晰的显示字段
- 提供适当的占位符文本
- 使用高质量的头像图片

### 3. 数据设计
- 关联表应该有明确的主键
- 显示字段应该包含有意义的信息
- 考虑添加描述字段提供更多信息
- 规范化字段命名（如使用 `department`、`position` 等标准字段名）

### 4. 字段配置建议
- **头像字段**: 使用标准命名或 `f_` 前缀的自定义字段
- **主要显示字段**: 优先使用 `name`、`title`、`nickname` 等有意义的字段
- **次要信息字段**: 包含 `department`、`position`、`email`、`phone` 等补充信息

## 更新日志

### v1.0.0 (当前版本)
- ✅ 基础关联数据查询
- ✅ 实时搜索功能
- ✅ 分页展示
- ✅ 多语言支持
- ✅ 防抖优化
- ✅ 错误处理
- ✅ 智能头像和信息显示
- ✅ 丰富的列表项布局

### 计划功能
- 🔄 多选模式支持
- 🔄 自定义搜索字段
- 🔄 高级过滤选项
- 🔄 虚拟滚动优化
- 🔄 自定义列表项模板 