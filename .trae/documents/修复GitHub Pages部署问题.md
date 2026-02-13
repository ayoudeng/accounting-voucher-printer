## 问题分析

经过检查App.vue文件，发现以下问题：

1. **纸张方向设置缺失**：

   * PrintSettings接口中缺少paperOrientation属性

   * 模板中缺少纸张方向设置的UI元素

   * exportToPDF函数硬编码了orientation: 'portrait'

2. **布局问题**：

   * 代码中使用了flex布局实现左右两列，但实际显示为上下布局

   * 可能是因为flex布局没有设置flex-wrap: nowrap

3. **字体大小设置**：

   * 代码中存在字体大小设置的UI元素，但可能没有正确显示

## 修复计划

1. **修复PrintSettings接口**：

   * 添加paperOrientation属性到PrintSettings接口

2. **添加纸张方向设置UI**：

   * 在模板中添加纸张方向选择下拉框

3. **更新exportToPDF函数**：

   * 使用printSettings中的paperOrientation值，而不是硬编码

4. **修复flex布局**：

   * 添加flex-wrap: nowrap到flex容器，强制不换行

5. **确保字体大小设置显示**：

   * 检查字体大小设置的代码，确保没有语法错误

## 预期结果

修复后，应用应该：

* 显示左右两列布局

* 显示字体大小设置

* 显示纸张方向设置

* 导出PDF时使用选择的纸张方向

## 实现步骤

1. 修改PrintSettings接口，添加paperOrientation属性
2. 在模板中添加纸张方向设置的UI元素
3. 更新exportToPDF函数，使用printSettings中的paperOrientation值
4. 修改flex布局，添加flex-wrap: nowrap
5. 测试修复效果

