<template>
  <div style="font-family: Arial, sans-serif; margin: 20px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 1200px; margin: 0 auto;">
    <h1 style="text-align: center; margin-bottom: 20px;">会计凭证打印</h1>

    <div style="margin: 1rem auto; max-width: 1000px; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; background-color: #f8f9fa;">
      <h3 style="margin-bottom: 0.5rem;">使用说明：</h3>
      <ol style="margin-left: 2rem;">
        <li style="margin-bottom: 0.5rem;">先用事务代码ZFI001执行，选择打印文件下载路径（由于C盘权限问题，建议存放到D盘）；</li>
        <li style="margin-bottom: 0.5rem;">再使用该打印功能，选择第1步下载的文件进行打印。</li>
      </ol>
    </div>

    <div style="display: flex; gap: 20px; margin-bottom: 20px; align-items: flex-start;">
      <div style="flex: 1;">
        <h2 style="text-align: center; margin-bottom: 20px;">文件上传和设置</h2>
        
        <div style="margin-bottom: 15px;">
          <label style="display: inline-block; width: 100px; text-align: left; color: red;">必选：</label>
          <input type="file" id="txtFile" @change="handleFileUpload" accept=".txt" />
        </div>

        <div style="margin-bottom: 15px;">
          <button @click="clearFileContent" style="margin-left: 100px; padding: 5px 10px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">清空文件内容</button>
        </div>

        <div style="margin-bottom: 15px;">
          <label style="display: inline-block; width: 100px; text-align: left;">文件内容：</label>
          <textarea v-model="fileContent" readonly style="width: calc(100% - 110px); height: 200px; padding: 5px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace;"></textarea>
        </div>

        <div style="margin-bottom: 15px;">
          <label style="display: inline-block; width: 100px; text-align: left;">字体大小：</label>
          <input type="number" v-model.number="fontSize" min="8" max="24" style="width: 60px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;" />
          <span style="margin-left: 10px;">px</span>
        </div>
      </div>

      <div style="flex: 1;">
        <h2 style="text-align: center; margin-bottom: 20px;">纸张大小</h2>
        
        <div style="margin-bottom: 15px;">
          <label style="display: inline-block; width: 100px; text-align: left;">纸张大小：</label>
          <select v-model="printSettings.paperRule" style="padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="custom">自定义</option>
          </select>
        </div>

        <div v-if="printSettings.paperRule === 'custom'" style="margin-bottom: 15px;">
          <label style="display: inline-block; width: 100px; text-align: left;">自定义尺寸 (mm)</label>
          <div style="display: inline-block; width: calc(100% - 110px);">
            <div style="display: flex; gap: 1rem;">
              <div style="flex: 1;">
                <label for="customWidth" style="display: block; text-align: left;">宽度</label>
                <input type="number" id="customWidth" v-model.number="printSettings.customWidth" min="1" max="1000" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;" />
              </div>
              <div style="flex: 1;">
                <label for="customHeight" style="display: block; text-align: left;">高度</label>
                <input type="number" id="customHeight" v-model.number="printSettings.customHeight" min="1" max="1000" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;" />
              </div>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <label style="display: inline-block; width: 100px; text-align: left;">页边距(mm)：</label>
          <div style="display: inline-block; width: calc(100% - 110px);">
            <div style="display: flex; gap: 1rem;">
              <div style="flex: 1;">
                <label for="marginTop" style="display: block; text-align: left;">上边距</label>
                <input type="number" id="marginTop" v-model.number="printSettings.marginTop" min="0" max="50" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;" />
              </div>
              <div style="flex: 1;">
                <label for="marginBottom" style="display: block; text-align: left;">下边距</label>
                <input type="number" id="marginBottom" v-model.number="printSettings.marginBottom" min="0" max="50" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;" />
              </div>
              <div style="flex: 1;">
                <label for="marginLeft" style="display: block; text-align: left;">左边距</label>
                <input type="number" id="marginLeft" v-model.number="printSettings.marginLeft" min="0" max="50" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;" />
              </div>
              <div style="flex: 1;">
                <label for="marginRight" style="display: block; text-align: left;">右边距</label>
                <input type="number" id="marginRight" v-model.number="printSettings.marginRight" min="0" max="50" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;" />
              </div>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <button @click="savePrintSettings" style="margin-left: 100px; padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">保存纸张设置</button>
        </div>
      </div>
    </div>

    <div style="margin-top: 20px;">
      <h2 style="text-align: center; margin-bottom: 20px;">凭证预览</h2>
      <div ref="previewContainer" style="border: 1px solid #ddd; padding: 20px; margin: 0 auto; width: 80%; min-height: 400px; white-space: pre-wrap; font-family: monospace; font-size: v-bind(fontSize + 'px');">{{ fileContent }}</div>
    </div>

    <div style="margin-top: 20px; text-align: center;">
      <button @click="exportToPDF" style="padding: 10px 20px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">导出为PDF</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import html2pdf from 'html2pdf.js'

interface PrintSettings {
  paperRule: string
  customWidth: number
  customHeight: number
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
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
const fontSize = ref(12)
const previewContainer = ref<HTMLElement | null>(null)

const printSettings = ref<PrintSettings>({
  paperRule: 'A4',
  customWidth: 210,
  customHeight: 297,
  marginTop: 10,
  marginBottom: 10,
  marginLeft: 10,
  marginRight: 10
})

const fileSettings = ref<FileSettings>({
  defaultPath: '',
  defaultName: '',
  defaultEncoding: 'utf-8',
  recentFiles: []
})

onMounted(() => {
  const savedPrintSettings = localStorage.getItem('printSettings')
  if (savedPrintSettings) {
    printSettings.value = JSON.parse(savedPrintSettings)
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
        fileContent.value = e.target.result as string
      }
    }
    reader.readAsText(file, fileSettings.value.defaultEncoding)

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

const exportToPDF = () => {
  if (!previewContainer.value) return

  let pdfFormat: any = printSettings.value.paperRule === 'A5' ? 'a5' : 'a4'
  if (printSettings.value.paperRule === 'custom') {
    pdfFormat = [printSettings.value.customWidth, printSettings.value.customHeight]
  }

  const opt = {
    margin: [
      printSettings.value.marginTop,
      printSettings.value.marginLeft,
      printSettings.value.marginBottom,
      printSettings.value.marginRight
    ],
    filename: fileName.value ? fileName.value.replace('.txt', '.pdf') : 'voucher.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: pdfFormat, orientation: 'portrait' }
  }

  html2pdf().set(opt).from(previewContainer.value).save()
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
.form-group {
  margin-bottom: 15px;
}

label {
  display: inline-block;
  width: 140px;
  text-align: right;
  margin-right: 10px;
}

input[type="text"],
input[type="number"],
select,
textarea {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

#preview {
  border: 1px solid #ddd;
  padding: 10px;
  margin-top: 10px;
  white-space: pre-wrap;
  font-family: monospace;
}
</style>