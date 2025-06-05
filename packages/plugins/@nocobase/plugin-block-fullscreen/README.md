# NocoBase 全屏区块插件

这个插件为 NocoBase 提供了全屏容器功能，允许用户将任何区块（如表格、iframe等）放入全屏容器中进行全屏显示。

## 🏗️ 架构设计

插件采用了职责分离的设计模式，将全屏逻辑和UI逻辑完全分离：

### 📁 文件结构

```
src/client/
├── FullscreenManager.ts       # 全屏核心逻辑管理器
├── FullscreenBlock.tsx        # React组件 - 处理UI交互
├── FullscreenBlockProvider.tsx # 提供者组件
├── schemaSettings.ts         # Schema配置
└── index.ts                  # 导出入口
```

### 🔧 核心组件

#### FullscreenManager（全屏管理器）
- **职责**: 处理DOM元素的全屏显示核心逻辑
- **功能**:
  - 保存和恢复元素状态
  - 应用和移除全屏样式
  - 管理动态样式注入
  - 处理兄弟元素的隐藏/显示

**主要方法**:
```typescript
// 切换全屏状态
toggleFullscreen(element: HTMLElement, isFullscreen: boolean, fullscreenStyle?: string): void

// 检查元素是否全屏
isElementFullscreen(element: HTMLElement): boolean

// 强制退出全屏
exitFullscreen(element: HTMLElement): void

// 清理所有状态
cleanup(): void
```

#### FullscreenBlock（React组件）
- **职责**: 处理插件相关的UI逻辑和用户交互
- **功能**:
  - React组件状态管理
  - 渲染UI界面和交互元素
  - 调用全屏管理器执行全屏逻辑
  - 处理组件生命周期事件

## 🚀 使用方法

### 基本使用

```typescript
import { fullscreenManager } from '@nocobase/plugin-block-fullscreen/client';

// 使元素进入全屏
const element = document.getElementById('my-element');
fullscreenManager.toggleFullscreen(element, true);

// 退出全屏
fullscreenManager.toggleFullscreen(element, false);

// 检查状态
const isFullscreen = fullscreenManager.isElementFullscreen(element);
```

### 自定义样式

```typescript
// 带自定义样式的全屏
const customStyle = `
  \${blockId} .my-content {
    padding: 20px;
    background: #f0f0f0;
  }
`;

fullscreenManager.toggleFullscreen(element, true, customStyle);
```

### React组件中使用

```tsx
import { FullscreenBlock } from '@nocobase/plugin-block-fullscreen/client';

function MyComponent() {
  return (
    <FullscreenBlock>
      {/* 你的内容 */}
      <div>可以全屏显示的内容</div>
    </FullscreenBlock>
  );
}
```

## 🎯 设计优势

### 1. 职责分离
- **UI层**: `FullscreenBlock` 只处理React相关逻辑
- **业务层**: `FullscreenManager` 专注于全屏核心逻辑

### 2. 可维护性
- 全屏逻辑独立，易于测试和修改
- 清晰的接口设计，降低耦合度

### 3. 可扩展性
- `FullscreenManager` 可以被其他组件复用
- 支持自定义样式注入
- 支持多实例管理

### 4. 安全性
- 自动状态管理，防止内存泄漏
- 组件卸载时自动清理
- 错误处理和异常恢复

## 🔄 生命周期管理

```typescript
// 组件卸载时自动清理
useEffect(() => {
  return () => {
    if (rootElementRef.current) {
      fullscreenManager.exitFullscreen(rootElementRef.current);
    }
  };
}, []);
```

## 🆔 ID生成策略

使用 `nanoid` 生成唯一ID，相比 `Date.now()` 有以下优势：
- 更好的唯一性保证
- 更短的ID长度
- URL安全字符集
- 更好的随机性

```typescript
// 生成格式: fullscreen-block-container-{nanoid}
const blockId = `fullscreen-block-container-${nanoid()}`;
```

## 📝 注意事项

1. **内存管理**: 组件会自动在卸载时清理全屏状态
2. **状态同步**: UI状态和全屏管理器状态保持同步
3. **兼容性**: 支持现代浏览器的全屏API
4. **性能优化**: 使用单例模式，避免重复实例化

## 🧪 测试建议

```typescript
// 测试全屏功能
describe('FullscreenManager', () => {
  test('should toggle fullscreen correctly', () => {
    const element = document.createElement('div');
    element.id = 'test-element';
    
    fullscreenManager.toggleFullscreen(element, true);
    expect(fullscreenManager.isElementFullscreen(element)).toBe(true);
    
    fullscreenManager.toggleFullscreen(element, false);
    expect(fullscreenManager.isElementFullscreen(element)).toBe(false);
  });
});
```

这个架构确保了代码的可维护性、可扩展性和健壮性，同时保持了良好的用户体验。