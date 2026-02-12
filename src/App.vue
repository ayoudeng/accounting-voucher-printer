<template>
  <div class="container">
    <h1 style="text-align: center;">会计凭证打印</h1>
    
    <div style="margin: 1rem auto; max-width: 1000px; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; background-color: #f8f9fa;">
      <h3 style="margin-bottom: 0.5rem;">使用说明：</h3>
      <ol style="margin-left: 2rem;">
        <li style="margin-bottom: 0.5rem;">先用事务代码ZFI001执行，选择打印文件下载路径（由于C盘权限问题，建议存放到D盘）；</li>
        <li style="margin-bottom: 0.5rem;">再使用该打印功能，选择第1步下载的文件进行打印。</li>
      </ol>
    </div>
    
    <div style="margin-top: 1rem;"></div>
    
    <!-- 文件上传和纸张规则设置 -->
    <div class="form-section" style="display: flex; gap: 2rem; max-width: 1200px; margin: 0 auto;">
      <!-- 文件上传部分 -->
      <div style="flex: 1; min-width: 0; border: 1px solid #ddd; padding: 1.5rem; border-radius: 8px; text-align: center;">
        <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">文件上传和设置</h2>
        
        <div class="form-group" style="margin-bottom: 1.25rem; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto;">
          <label for="defaultFilePath" style="display: inline-block; width: 100px; text-align: left;">默认文件地址</label>
          <input type="text" id="defaultFilePath" v-model="fileSettings.defaultPath" placeholder="请输入默认文件地址" style="width: calc(100% - 110px);" />
        </div>
        
        <div class="form-group" style="margin-bottom: 1.25rem; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto;">
          <label for="defaultFileName" style="display: inline-block; width: 100px; text-align: left;">默认文件名称</label>
          <input type="text" id="defaultFileName" v-model="fileSettings.defaultName" placeholder="请输入默认文件名称" style="width: calc(100% - 110px);" />
        </div>
        
        <div class="form-group" style="margin-bottom: 1.25rem; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto;">
          <label for="txtFile" style="display: inline-block; width: 100px; text-align: left; color: red;">选择TXT文件 <span style="font-size: 0.8rem;">(必选)</span></label>
          <input type="file" id="txtFile" accept=".txt" @change="handleFileSelect" required style="width: calc(100% - 110px);" />
        </div>
        
        <div class="form-group" style="margin-bottom: 1.25rem; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto;">
          <label for="fileEncoding" style="display: inline-block; width: 100px; text-align: left;">文件编码</label>
          <select id="fileEncoding" v-model="fileSettings.defaultEncoding" style="width: calc(100% - 110px);">
            <option value="utf-8">UTF-8</option>
            <option value="gbk">GBK</option>
            <option value="gb2312">GB2312</option>
            <option value="gb18030">GB18030</option>
            <option value="ansi">ANSI</option>
          </select>
        </div>
        
        <!-- 最近使用的文件列表 -->
        <div class="form-group" style="margin-top: 1.5rem; display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label>最近使用的文件</label>
            <button v-if="fileSettings.recentFiles.length > 0" class="secondary" @click="clearRecentFiles" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">清空</button>
          </div>
          <div v-if="fileSettings.recentFiles.length > 0" style="margin-top: 0.5rem; max-height: 150px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px;">
            <div v-for="(file, index) in fileSettings.recentFiles" :key="index" 
                 style="padding: 0.5rem; border-bottom: 1px solid #f0f0f0; cursor: pointer;"
                 @click="selectRecentFile(file)"
                 :style="{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }">
              <div style="font-weight: 500;">{{ file.name }}</div>
              <div style="font-size: 0.8rem; color: #666;">{{ file.path }}</div>
              <div style="font-size: 0.7rem; color: #999;">{{ new Date(file.lastUsed).toLocaleString() }}</div>
            </div>
          </div>
          <div v-else style="margin-top: 0.5rem; color: #999; font-style: italic;">暂无最近使用的文件</div>
        </div>
        
        <div class="form-row" style="margin-top: 5.8rem; display: flex; gap: 1rem; justify-content: center;">
          <button class="primary" @click="saveFileSettings">保存文件设置</button>
        </div>
      </div>
      
      <!-- 纸张规则选择部分 -->
      <div style="flex: 1; min-width: 0; border: 1px solid #ddd; padding: 1.5rem; border-radius: 8px; text-align: center;">
        <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">凭证打印纸张规则</h2>
        
        <div class="form-group" style="margin-bottom: 1.25rem; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto;">
          <label for="paperRule" style="display: inline-block; width: 140px; text-align: left;">纸张大小</label>
          <select id="paperRule" v-model="printSettings.paperRule" style="width: calc(100% - 150px);">
            <option value="A4">A4 (210mm × 297mm)</option>
            <option value="A5">A5 (148mm × 210mm)</option>
            <option value="voucher">凭证专用纸 (240mm × 140mm)</option>
            <option value="custom">自定义</option>
          </select>
        </div>
        
        <!-- 自定义纸张大小设置 -->
        <div v-if="printSettings.paperRule === 'custom'" class="form-group" style="margin-bottom: 1.25rem; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto;">
          <label style="display: inline-block; width: 140px; text-align: left;">自定义尺寸 (mm)</label>
          <div style="display: inline-block; width: calc(100% - 150px);">
            <div style="display: flex; gap: 1rem;">
              <div style="flex: 1;">
                <label for="customWidth" style="display: block; text-align: left;">宽度</label>
                <input type="number" id="customWidth" v-model.number="printSettings.customWidth" min="1" max="1000" style="width: 100%;" />
              </div>
              <div style="flex: 1;">
                <label for="customHeight" style="display: block; text-align: left;">高度</label>
                <input type="number" id="customHeight" v-model.number="printSettings.customHeight" min="1" max="1000" style="width: 100%;" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- 纸张方向和页边距设置 -->
        <div class="form-group" style="margin-bottom: 1.25rem; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto;">
          <label for="orientation" style="display: inline-block; width: 140px; text-align: left;">纸张方向</label>
          <select id="orientation" v-model="printSettings.orientation" style="width: calc(100% - 150px);">
            <option value="portrait">纵向</option>
            <option value="landscape">横向</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom: 1.25rem; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto;">
          <label style="display: inline-block; width: 140px; text-align: left;">页边距 (mm)</label>
          <div style="display: inline-block; width: calc(100% - 150px);">
            <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem;">
              <div style="flex: 1;">
                <label for="marginTop" style="display: block; text-align: left;">上</label>
                <input type="number" id="marginTop" v-model.number="printSettings.marginTop" min="0" max="50" style="width: 100%;" />
              </div>
              <div style="flex: 1;">
                <label for="marginBottom" style="display: block; text-align: left;">下</label>
                <input type="number" id="marginBottom" v-model.number="printSettings.marginBottom" min="0" max="50" style="width: 100%;" />
              </div>
            </div>
            <div style="display: flex; gap: 1rem;">
              <div style="flex: 1;">
                <label for="marginLeft" style="display: block; text-align: left;">左</label>
                <input type="number" id="marginLeft" v-model.number="printSettings.marginLeft" min="0" max="50" style="width: 100%;" />
              </div>
              <div style="flex: 1;">
                <label for="marginRight" style="display: block; text-align: left;">右</label>
                <input type="number" id="marginRight" v-model.number="printSettings.marginRight" min="0" max="50" style="width: 100%;" />
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 1.25rem; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto;">
          <label for="fontSize" style="display: inline-block; width: 140px; text-align: left;">字体大小 (pt)</label>
          <input type="number" id="fontSize" v-model.number="printSettings.fontSize" min="6" max="20" step="0.5" style="width: calc(100% - 150px);" />
        </div>
        
        <div class="form-row" style="margin-top: 5.8rem; display: flex; gap: 1rem; justify-content: center;">
          <button class="primary" @click="savePrintSettings">保存纸张设置</button>
        </div>
      </div>
    </div>
    
    <!-- 凭证录入功能已取消，只保留文件上传和打印功能 -->
    
    <!-- 凭证预览和操作 -->
    <div class="preview-section" style="margin-top: 2rem; max-width: 1200px; margin-left: auto; margin-right: auto; width: 100%; padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="text-align: center;">凭证预览</h2>
      
      <!-- TXT文件内容预览 -->
      <div v-if="fileContent" class="file-content-preview" style="margin-bottom: 2rem; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3>文件内容预览: {{ fileName }}</h3>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div>
              页码: {{ currentPage }} / {{ totalPages }}
            </div>
            <div>
              <button class="secondary" @click="prevPage" :disabled="currentPage === 1">上一页</button>
              <button class="secondary" @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
            </div>
          </div>
        </div>
        <div class="file-content" 
             :key="`${printSettings.paperRule}-${printSettings.orientation}-${printSettings.marginTop}-${printSettings.marginBottom}-${printSettings.marginLeft}-${printSettings.marginRight}-${printSettings.fontSize}`"
             :style="{
               border: '1px solid #ddd',
               padding: printSettings.marginTop + 'mm ' + printSettings.marginRight + 'mm ' + printSettings.marginBottom + 'mm ' + printSettings.marginLeft + 'mm',
               backgroundColor: '#f8f9fa',
               whiteSpace: 'pre-wrap',
               fontFamily: 'monospace',
               fontSize: printSettings.fontSize + 'pt',
               height: printSettings.paperRule === 'A5' ? '500px' : '800px',
               overflowY: 'auto',
               overflowX: 'auto'
             }">
          <!-- 根据当前页码显示相应内容 -->
          <div v-for="page in totalPages" :key="`page-${page}-${printSettings.paperRule}`" v-show="currentPage === page" 
               :style="{
                 pageBreakAfter: 'always',
                 width: '100%'
               }">
            <div :style="{
              display: 'block',
              textAlign: 'left',
              fontSize: '11.5pt',
              minWidth: (printSettings.paperRule === 'A5' || printSettings.orientation === 'landscape') ? '900px' : '600px',
              width: '100%'
            }">
              {{ getPageContent(page) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 凭证预览已简化，只显示文件内容 -->
      <div v-if="!fileContent" class="voucher" style="border: 1px solid #ddd; padding: 2rem; text-align: center; background-color: #f8f9fa; width: 100%;">
        <div class="voucher-header">
          <h2>请上传TXT文件</h2>
        </div>
        <div class="voucher-meta">
          <div class="voucher-meta-item">
            <span>请在上方选择并上传TXT格式的凭证文件</span>
          </div>
        </div>
      </div>
      
      <div class="action-buttons" style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
        <button class="primary" @click="exportToPDF" :disabled="!fileContent">导出PDF</button>
        <button class="secondary" @click="clearFileContent">清空文件内容</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import jsPDF from 'jspdf'
import html2pdf from 'html2pdf.js'

// 定义凭证数据结构
interface VoucherItem {
  accountCode: string
  accountName: string
  debitAmount: number
  creditAmount: number
}

interface VoucherData {
  date: string
  voucherNo: string
  voucherType: string
  summary: string
  items: VoucherItem[]
  preparedBy: string
  reviewedBy: string
  approvedBy: string
  postedBy: string
}

// 定义文件设置结构
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

// 定义打印设置结构
interface PrintSettings {
  paperRule: string
  orientation: string
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  fontSize: number
  customWidth: number
  customHeight: number
}

// 初始化凭证数据
const voucherData = ref<VoucherData>({
  date: new Date().toISOString().split('T')[0],
  voucherNo: '',
  voucherType: '记账凭证',
  summary: '',
  items: [
    {
      accountCode: '',
      accountName: '',
      debitAmount: 0,
      creditAmount: 0
    }
  ],
  preparedBy: '',
  reviewedBy: '',
  approvedBy: '',
  postedBy: ''
})

// 初始化文件设置
const fileSettings = ref<FileSettings>({
  defaultPath: 'D:\\',
  defaultName: '',
  defaultEncoding: 'utf-8',
  recentFiles: []
})

// 初始化打印设置
const printSettings = ref<PrintSettings>({
  paperRule: 'A4',
  orientation: 'portrait',
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 20,
  marginRight: 20,
  fontSize: 11.5,
  customWidth: 210,
  customHeight: 297
})

// 移除之前的预览刷新触发器和监听逻辑，使用更直接的方式

// 初始化文件内容
const fileContent = ref<string>('')
const fileName = ref<string>('')



// 计算合计金额
const totalDebit = computed(() => {
  return voucherData.value.items.reduce((sum, item) => sum + (item.debitAmount || 0), 0)
})

const totalCredit = computed(() => {
  return voucherData.value.items.reduce((sum, item) => sum + (item.creditAmount || 0), 0)
})

// 计算每页高度（根据纸张规则）
const pageHeight = computed(() => {
  switch (printSettings.value.paperRule) {
    case 'A4':
      return 842 // A4高度（像素）
    case 'A5':
      return 595 // A5高度（像素）
    case 'voucher':
      return 400 // 凭证专用纸高度（像素）
    default:
      return 842 // 默认A4
  }
})

// 移除计算属性，使用更直接的方式

// 当前页码
const currentPage = ref(1)

// 按行数计算总页数
const totalPages = computed(() => {
  if (!fileContent.value) return 1
  // 每页33行
  const lines = fileContent.value.split('\n')
  return Math.ceil(lines.length / 33)
})

// 添加科目明细行
const addItem = () => {
  voucherData.value.items.push({
    accountCode: '',
    accountName: '',
    debitAmount: 0,
    creditAmount: 0
  })
}

// 删除科目明细行
const removeItem = (index: number) => {
  if (voucherData.value.items.length > 1) {
    voucherData.value.items.splice(index, 1)
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toFixed(2)
}



// 保存凭证
const saveVoucher = () => {
  // 模拟保存到本地存储
  localStorage.setItem('voucherData', JSON.stringify(voucherData.value))
  alert('凭证保存成功！')
}

// 重置表单
const resetForm = () => {
  voucherData.value = {
    date: new Date().toISOString().split('T')[0],
    voucherNo: '',
    voucherType: '记账凭证',
    summary: '',
    items: [
      {
        accountCode: '',
        accountName: '',
        debitAmount: 0,
        creditAmount: 0
      }
    ],
    preparedBy: '',
    reviewedBy: '',
    approvedBy: '',
    postedBy: ''
  }
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    fileName.value = file.name
    
    readFileContent(file)
  }
}

// 读取文件内容
const readFileContent = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result
    if (typeof result === 'string') {
      // 直接使用字符串结果，让浏览器处理编码
      fileContent.value = result
    }
  }
  reader.onerror = () => {
    alert('文件读取失败，请重试！')
  }
  // 使用readAsText读取文件，明确指定编码
  if (fileSettings.value.defaultEncoding === 'ansi') {
    // 对于中文ANSI编码，尝试使用GBK编码
    try {
      reader.readAsText(file, 'gbk')
    } catch (error) {
      // 如果GBK失败，尝试GB2312
      try {
        reader.readAsText(file, 'gb2312')
      } catch (error2) {
        // 如果都失败，使用默认编码
        reader.readAsText(file)
      }
    }
  } else {
    // 对于其他编码，使用指定的编码或让浏览器自动检测
    reader.readAsText(file, fileSettings.value.defaultEncoding)
  }
}



// 保存文件设置
const saveFileSettings = () => {
  localStorage.setItem('fileSettings', JSON.stringify(fileSettings.value))
  alert('文件设置保存成功！')
}



// 清空文件内容
const clearFileContent = () => {
  // 清空文件内容和文件名
  fileContent.value = ''
  fileName.value = ''
  
  // 清空已选择的文件
  const fileInput = document.getElementById('txtFile') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
  
  // 使用更强制的刷新方法，确保页面完全重新加载
  setTimeout(() => {
    location.reload(true) // true参数表示强制从服务器重新加载，不使用缓存
  }, 100)
}

// 保存打印设置
const savePrintSettings = () => {
  localStorage.setItem('printSettings', JSON.stringify(printSettings.value))
  alert('打印设置保存成功！')
}



// 清空最近使用的文件
const clearRecentFiles = () => {
  fileSettings.value.recentFiles = []
}

// 选择最近使用的文件
const selectRecentFile = (file: { name: string; path: string; lastUsed: string }) => {
  // 这里可以实现加载最近使用的文件的逻辑
  console.log('Selecting recent file:', file)
}

// 分页控制方法
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const prevPage = () => {
  goToPage(currentPage.value - 1)
}

const nextPage = () => {
  goToPage(currentPage.value + 1)
}

// 根据页码获取内容（按行数分页）
const getPageContent = (page: number) => {
  if (!fileContent.value) return ''
  
  // 每页33行
  const pageSize = 33
  const lines = fileContent.value.split('\n')
  const startLine = (page - 1) * pageSize
  const endLine = startLine + pageSize
  
  return lines.slice(startLine, endLine).join('\n')
}

// 导出为PDF
const exportToPDF = () => {
  if (!fileContent.value) return
  
  // 创建一个临时元素来存储要导出的内容
  const exportElement = document.createElement('div')
  exportElement.style.fontFamily = 'Courier New, monospace'
  exportElement.style.fontSize = printSettings.value.fontSize + 'pt'
  exportElement.style.whiteSpace = 'pre'
  exportElement.style.padding = printSettings.value.marginTop + 'mm ' + printSettings.value.marginRight + 'mm ' + printSettings.value.marginBottom + 'mm ' + printSettings.value.marginLeft + 'mm'
  
  // 按每页33行分割文本
  const allLines = fileContent.value.split('\n')
  const pageSize = 33
  
  // 添加每页内容
  for (let i = 0; i < allLines.length; i += pageSize) {
    const pageLines = allLines.slice(i, i + pageSize)
    const pageContent = pageLines.join('\n')
    
    const pageDiv = document.createElement('div')
    pageDiv.style.pageBreakAfter = 'always'
    pageDiv.style.whiteSpace = 'pre'
    pageDiv.textContent = pageContent
    
    exportElement.appendChild(pageDiv)
  }
  
  // 添加到文档中
  document.body.appendChild(exportElement)
  
  // 设置PDF选项
  let pdfFormat = printSettings.value.paperRule === 'A5' ? 'a5' : 'a4'
  let pdfWidth = 210
  let pdfHeight = 297
  
  // 如果是自定义纸张大小，使用用户输入的尺寸
  if (printSettings.value.paperRule === 'custom') {
    pdfFormat = [printSettings.value.customWidth, printSettings.value.customHeight]
    pdfWidth = printSettings.value.customWidth
    pdfHeight = printSettings.value.customHeight
  } else if (printSettings.value.paperRule === 'A5') {
    pdfWidth = 148
    pdfHeight = 210
  } else if (printSettings.value.paperRule === 'voucher') {
    pdfWidth = 240
    pdfHeight = 140
  }
  
  const pdfOptions = {
    margin: 0,
    filename: `凭证_${fileName.value}_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false
    },
    jsPDF: {
      unit: 'mm',
      format: pdfFormat,
      orientation: printSettings.value.orientation
    }
  }
  
  // 生成PDF
  html2pdf().set(pdfOptions).from(exportElement).save().then(() => {
    // 导出完成后移除临时元素
    document.body.removeChild(exportElement)
    alert('PDF文档已生成并保存到桌面！')
  }).catch((error) => {
    // 导出失败后移除临时元素
    document.body.removeChild(exportElement)
    alert('PDF生成失败，请重试！\n' + error.message)
  })
}




</script>

<style scoped>
.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row .form-group {
  flex: 1;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
}
</style>