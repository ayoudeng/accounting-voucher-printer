<template>
  <div class="app-container">
    <h1 class="main-title">会计凭证打印</h1>

    <div class="instructions-card">
      <h3 class="card-title instructions-title"><span class="highlight-dot">●</span> 使用说明：</h3>
      <ol class="instructions-list">
        <li>先用事务代码ZFI001执行，选择打印文件下载路径（由于C盘权限问题，建议存放到D盘）；</li>
        <li>再使用该打印功能，选择第1步下载的文件进行打印。</li>
      </ol>
    </div>

    <div class="settings-container">
      <div class="settings-card">
        <h2 class="card-title section-title">文件上传和设置</h2>
        
        <div class="form-group">
          <label class="form-label required">必选：</label>
          <input type="file" id="txtFile" @change="handleFileUpload" accept=".txt" class="file-input" />
        </div>

        <div class="form-group">
          <label class="form-label">默认文件路径：</label>
          <input type="text" v-model="fileSettings.defaultPath" class="form-input" placeholder="输入默认文件路径" />
        </div>

        <div class="form-group">
          <label class="form-label">默认文件名：</label>
          <input type="text" v-model="fileSettings.defaultName" class="form-input" placeholder="输入默认文件名" />
        </div>

        <div class="form-group">
          <label class="form-label">编码选择：</label>
          <select v-model="fileSettings.defaultEncoding" class="form-select">
            <option value="gbk">ANSI/GBK (推荐)</option>
            <option value="utf-8">UTF-8</option>
            <option value="gb2312">GB2312</option>
          </select>
        </div>

        <div class="form-group">
          <button @click="saveFileSettings" class="btn btn-success">保存文件设置</button>
        </div>
      </div>

      <div class="settings-card">
        <h2 class="card-title section-title">纸张设置</h2>
        
        <div class="form-group">
          <label class="form-label">纸张大小：</label>
          <select v-model="printSettings.paperRule" class="form-select">
            <option value="A4">A4 (210mm × 297mm)</option>
            <option value="A5">A5 (148mm × 210mm)</option>
            <option value="custom">自定义</option>
          </select>
        </div>

        <div v-if="printSettings.paperRule === 'custom'" class="form-group">
          <label class="form-label">自定义尺寸 (mm)</label>
          <div class="size-inputs">
            <div class="input-group">
              <label for="customWidth">宽度</label>
              <input type="number" id="customWidth" v-model.number="printSettings.customWidth" min="1" max="1000" class="form-input" />
            </div>
            <div class="input-group">
              <label for="customHeight">高度</label>
              <input type="number" id="customHeight" v-model.number="printSettings.customHeight" min="1" max="1000" class="form-input" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">纸张方向：</label>
          <select v-model="printSettings.paperOrientation" class="form-select">
            <option value="portrait">纵向</option>
            <option value="landscape">横向</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">字体大小：</label>
          <div class="font-size-input">
            <input type="number" v-model.number="printSettings.fontSize" min="8" max="24" class="form-input" />
            <span class="input-unit">px</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">页边距(mm)：</label>
          <div class="margin-inputs">
            <div class="input-group">
              <label for="marginTop">上边距</label>
              <input type="number" id="marginTop" v-model.number="printSettings.marginTop" min="0" max="50" class="form-input" />
            </div>
            <div class="input-group">
              <label for="marginBottom">下边距</label>
              <input type="number" id="marginBottom" v-model.number="printSettings.marginBottom" min="0" max="50" class="form-input" />
            </div>
            <div class="input-group">
              <label for="marginLeft">左边距</label>
              <input type="number" id="marginLeft" v-model.number="printSettings.marginLeft" min="0" max="50" class="form-input" />
            </div>
            <div class="input-group">
              <label for="marginRight">右边距</label>
              <input type="number" id="marginRight" v-model.number="printSettings.marginRight" min="0" max="50" class="form-input" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <button @click="savePrintSettings" class="btn btn-success">保存纸张设置</button>
        </div>
      </div>
    </div>

    <div class="preview-section">
      <h2 class="card-title">凭证预览</h2>
      <div class="preview-action">
        <button @click="clearFileContent" class="btn btn-danger btn-large">清空文件内容</button>
        <button @click="exportToPDF" class="btn btn-primary btn-large">导出PDF文档</button>
      </div>
      <div ref="previewContainer" class="preview-container">
        <div v-for="(page, index) in pages" :key="index" class="preview-page" :style="getPageStyle()">
          <div class="page-content">{{ page }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import html2pdf from 'html2pdf.js'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
// @ts-ignore
import * as GBK from 'gbk.js'

interface PrintSettings {
  paperRule: string
  paperOrientation: string
  customWidth: number
  customHeight: number
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  fontSize: number
}

interface FileSettings {
  defaultPath: string
  defaultName: string
  defaultEncoding: string
  recentFiles: Array<{
    name: string
    path: string
    lastUsed: string
  }>
}

const fileContent = ref('')
const fileName = ref('')
const previewContainer = ref<HTMLElement | null>(null)
const linesPerPage = 33

// 计算分页内容
const pages = computed(() => {
  if (!fileContent.value) return []
  const normalizedContent = fileContent.value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalizedContent.split('\n')
  const result: string[] = []
  
  for (let i = 0; i < lines.length; i += linesPerPage) {
    const pageLines = lines.slice(i, i + linesPerPage)
    result.push(pageLines.join('\n'))
  }
  
  return result
})

// 获取页面样式
const getPageStyle = () => {
  let width = '210mm'
  let height = '297mm'
  
  if (printSettings.value.paperRule === 'A5') {
    width = '148mm'
    height = '210mm'
  } else if (printSettings.value.paperRule === 'custom') {
    width = `${printSettings.value.customWidth}mm`
    height = `${printSettings.value.customHeight}mm`
  }
  
  // 横向时交换宽高
  if (printSettings.value.paperOrientation === 'landscape') {
    [width, height] = [height, width]
  }
  
  // 获取页边距设置
  const { marginTop, marginBottom, marginLeft, marginRight } = printSettings.value
  
  return {
    width: width,
    minHeight: height,
    fontSize: `${printSettings.value.fontSize}px`,
    padding: `${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm`
  }
}

const printSettings = ref<PrintSettings>({
  paperRule: 'A4',
  paperOrientation: 'portrait',
  customWidth: 210,
  customHeight: 297,
  marginTop: 10,
  marginBottom: 10,
  marginLeft: 10,
  marginRight: 10,
  fontSize: 12
})

const fileSettings = ref<FileSettings>({
  defaultPath: '',
  defaultName: '',
  defaultEncoding: 'gbk',
  recentFiles: []
})

onMounted(() => {
  const savedPrintSettings = localStorage.getItem('printSettings')
  if (savedPrintSettings) {
    const parsed = JSON.parse(savedPrintSettings)
    printSettings.value = {
      ...printSettings.value,
      ...parsed
    }
  }

  const savedFileSettings = localStorage.getItem('fileSettings')
  if (savedFileSettings) {
    fileSettings.value = JSON.parse(savedFileSettings)
  }
})

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    fileName.value = file.name

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        const arrayBuffer = e.target.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)
        const byteArray = Array.from(uint8Array)
        let content = ''
        
        // 获取用户选择的编码
        const selectedEncoding = fileSettings.value.defaultEncoding.toLowerCase()
        
        // 获取GBK解码器
        // @ts-ignore
        const gbkLib = GBK.default || GBK
        
        // 根据选择解码
        if (selectedEncoding === 'gbk' || selectedEncoding === 'gb2312' || selectedEncoding === 'ascii') {
          // ANSI在中文Windows下通常是GBK编码
          try {
            content = gbkLib.decode(byteArray)
            console.log('使用GBK编码解码文件成功, 内容长度:', content.length)
          } catch (err) {
            console.warn('GBK解码失败:', err)
            const decoder = new TextDecoder('utf-8', { fatal: false })
            content = decoder.decode(uint8Array)
          }
        } else if (selectedEncoding === 'utf-8') {
          // 先尝试UTF-8
          const utf8Decoder = new TextDecoder('utf-8', { fatal: false })
          const utf8Content = utf8Decoder.decode(uint8Array)
          
          // 检查是否有乱码字符
          const garbledCount = (utf8Content.match(/\uFFFD/g) || []).length
          if (garbledCount > utf8Content.length * 0.05) {
            console.log('UTF-8解码有乱码，尝试GBK')
            try {
              content = gbkLib.decode(byteArray)
              console.log('GBK解码成功')
            } catch {
              content = utf8Content
            }
          } else {
            content = utf8Content
          }
        } else {
          // 其他编码
          const decoder = new TextDecoder(selectedEncoding, { fatal: false })
          content = decoder.decode(uint8Array)
        }
        
        console.log('解码后内容预览:', content.substring(0, 100))
        
        // 直接存储内容，分页由computed处理
        fileContent.value = content
      }
    }
    
    reader.onerror = () => {
      console.error('文件读取失败')
      alert('文件读取失败，请重试')
    }
    
    reader.readAsArrayBuffer(file)
    addToRecentFiles(file.name, file.name)
  }
}

const addToRecentFiles = (name: string, path: string) => {
  const existingIndex = fileSettings.value.recentFiles.findIndex(f => f.path === path)
  if (existingIndex !== -1) {
    fileSettings.value.recentFiles.splice(existingIndex, 1)
  }

  fileSettings.value.recentFiles.unshift({
    name,
    path,
    lastUsed: new Date().toISOString()
  })

  if (fileSettings.value.recentFiles.length > 5) {
    fileSettings.value.recentFiles = fileSettings.value.recentFiles.slice(0, 5)
  }

  localStorage.setItem('fileSettings', JSON.stringify(fileSettings.value))
}

const clearFileContent = () => {
  fileContent.value = ''
  fileName.value = ''
  const fileInput = document.getElementById('txtFile') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
  setTimeout(() => {
    location.reload()
  }, 100)
}

const savePrintSettings = () => {
  localStorage.setItem('printSettings', JSON.stringify(printSettings.value))
  alert('打印设置已保存')
}

const saveFileSettings = () => {
  localStorage.setItem('fileSettings', JSON.stringify(fileSettings.value))
  alert('文件设置已保存')
}

const exportToPDF = async () => {
  if (!fileContent.value) {
    alert('没有内容可导出，请先上传文件')
    return
  }

  console.log('开始导出PDF, 页数:', pages.value.length)

  // 计算纸张尺寸（像素）- 1mm ≈ 3.78px
  const mmToPx = 3.78
  let pageWidthMm = 210
  let pageHeightMm = 297
  
  if (printSettings.value.paperRule === 'A5') {
    pageWidthMm = 148
    pageHeightMm = 210
  } else if (printSettings.value.paperRule === 'custom') {
    pageWidthMm = printSettings.value.customWidth
    pageHeightMm = printSettings.value.customHeight
  }
  
  // 横向时交换宽高
  if (printSettings.value.paperOrientation === 'landscape') {
    [pageWidthMm, pageHeightMm] = [pageHeightMm, pageWidthMm]
  }
  
  const pageWidthPx = pageWidthMm * mmToPx
  const pageHeightPx = pageHeightMm * mmToPx
  
  // 创建jsPDF实例
  const doc = new jsPDF({
    orientation: printSettings.value.paperOrientation,
    unit: 'mm',
    format: printSettings.value.paperRule === 'A5' ? 'a5' : 
            printSettings.value.paperRule === 'custom' ? [printSettings.value.customWidth, printSettings.value.customHeight] : 'a4'
  })
  
  // 为每一页生成图片并添加到PDF
  for (let i = 0; i < pages.value.length; i++) {
    if (i > 0) {
      doc.addPage()
    }
    
    const pageContent = pages.value[i]
    
    // 创建临时容器
    const tempDiv = document.createElement('div')
    tempDiv.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: ${pageWidthPx}px;
      min-height: ${pageHeightPx}px;
      padding: ${printSettings.value.marginTop * mmToPx}px ${printSettings.value.marginRight * mmToPx}px ${printSettings.value.marginBottom * mmToPx}px ${printSettings.value.marginLeft * mmToPx}px;
      box-sizing: border-box;
      background: white;
      font-family: 'Courier New', monospace;
      font-size: ${printSettings.value.fontSize}px;
      line-height: 1.6;
      color: black;
      white-space: pre-wrap;
      z-index: 9999;
    `
    tempDiv.textContent = pageContent
    document.body.appendChild(tempDiv)
    
    // 等待DOM更新
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // 使用html2canvas生成图片
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      width: pageWidthPx,
      height: pageHeightPx,
      backgroundColor: '#ffffff'
    })
    
    // 移除临时容器
    document.body.removeChild(tempDiv)
    
    // 将图片添加到PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.98)
    doc.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm)
    
    console.log(`第${i + 1}页已生成`)
  }
  
  // 保存PDF
  const filename = fileName.value ? fileName.value.replace('.txt', '.pdf') : 'voucher.pdf'
  doc.save(filename)
  console.log('PDF导出成功, 总页数:', pages.value.length)
}

const clearRecentFiles = () => {
  fileSettings.value.recentFiles = []
  localStorage.setItem('fileSettings', JSON.stringify(fileSettings.value))
}

const selectRecentFile = (file: { name: string, path: string }) => {
  fileName.value = file.name
}
</script>

<style scoped>
/* 全局样式重置和基础设置 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app-container {
  font-family: 'Segoe UI', Arial, sans-serif;
  margin: 0 auto;
  padding: 30px;
  max-width: 1200px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 标题样式 */
.main-title {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 600;
}

.card-title {
  text-align: center;
  margin-bottom: 24px;
  color: #34495e;
  font-size: 18px;
  font-weight: 500;
}

.section-title {
  font-weight: 700;
  color: #000000;
}

.preview-section .card-title {
  text-align: center;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 600;
}

.instructions-title {
  text-align: left;
  margin-bottom: 15px;
}

.highlight-dot {
  color: #e74c3c;
  font-size: 18px;
  margin-right: 8px;
  vertical-align: middle;
}

/* 卡片样式 */
.instructions-card {
  margin: 0 0 30px;
  padding: 20px;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: 100%;
}

.settings-container {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.settings-card {
  flex: 1;
  min-width: 400px;
  padding: 24px;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.form-label {
  display: inline-block;
  width: 120px;
  text-align: left;
  margin-right: 15px;
  color: #555;
  font-weight: 500;
}

.form-label.required {
  color: #e74c3c;
}

.form-input,
.form-select {
  padding: 8px 12px;
  border: 1px solid #d1d9e0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
  min-width: 200px;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.file-input {
  font-size: 14px;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin: 0 auto;
  display: block;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-success {
  background-color: #27ae60;
  color: white;
}

.btn-success:hover {
  background-color: #229954;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-large {
  padding: 12px 24px;
  font-size: 16px;
}

/* 输入组样式 */
.size-inputs,
.margin-inputs {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 90px;
}

.input-group label {
  font-size: 12px;
  color: #7f8c8d;
  text-align: left;
  width: auto;
  margin: 0;
}

.font-size-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-unit {
  color: #7f8c8d;
  font-size: 14px;
}

/* 预览部分样式 */
.preview-section {
  margin-bottom: 30px;
}

.preview-action {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 15px 0 20px;
}

.preview-action .btn {
  margin: 0;
  display: inline-block;
}

.preview-container {
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.preview-page {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-family: 'Courier New', monospace;
  line-height: 1.6;
  white-space: pre-wrap;
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ddd;
}

.page-content {
  color: #333;
}

/* 操作部分样式 */
.action-section {
  text-align: center;
  margin-top: 30px;
}

/* 列表样式 */
.instructions-list {
  margin-left: 24px;
  color: #555;
}

.instructions-list li {
  margin-bottom: 10px;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .settings-container {
    flex-direction: column;
  }

  .settings-card {
    min-width: 100%;
  }

  .size-inputs,
  .margin-inputs {
    flex-direction: column;
    gap: 10px;
  }

  .input-group {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  .input-group label {
    width: 80px;
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: 20px;
  }

  .form-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .form-label {
    width: 100%;
    margin: 0;
  }

  .btn {
    margin-left: 0;
    margin-top: 5px;
  }

  .font-size-input {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>