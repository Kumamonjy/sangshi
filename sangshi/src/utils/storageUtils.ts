export interface StorageResult {
  success: boolean
  message?: string
  filePath?: string
  content?: string
}

export async function requestStoragePermission(): Promise<StorageResult> {
  // 新版方案：不要求特殊权限，直接使用应用私有目录
  return new Promise((resolve) => {
    resolve({ success: true, message: '无需特殊权限' })
  })
}

export function getExternalStoragePath(): string | null {
  try {
    if (uni.getSystemInfoSync().platform === 'android') {
      // 使用应用私有外部目录（无需特殊权限）
      const mainActivity = plus.android.runtimeMainActivity()
      const context = mainActivity.getApplicationContext()
      const appFilesDir = context.getExternalFilesDir(null)
      if (appFilesDir != null) {
        const File = plus.android.importClass('java.io.File')
        const sangshiDir = new File(appFilesDir, 'SangshiGame')
        return plus.android.invoke(sangshiDir, 'getAbsolutePath')
      }
    }
    return '_doc/SangshiGame'
  } catch (e) {
    console.error('获取外部存储路径失败:', e)
    return '_doc/SangshiGame'
  }
}

export async function saveToExternalStorage(filename: string, content: string): Promise<StorageResult> {
  return new Promise((resolve) => {
    try {
      if (uni.getSystemInfoSync().platform !== 'android') {
        resolve({ success: false, message: '仅支持Android平台' })
        return
      }
      
      // 使用 plus.io API 保存到应用目录，无需特殊权限
      plus.io.requestFileSystem(
        plus.io.PRIVATE_DOC,
        (fs) => {
          fs.root.getDirectory(
            'SangshiGame',
            { create: true },
            (dirEntry) => {
              dirEntry.getFile(
                filename,
                { create: true },
                (fileEntry) => {
                  fileEntry.createWriter(
                    (writer) => {
                      writer.onwriteend = () => {
                        let fullPath = ''
                        try {
                          fullPath = plus.android.invoke(fileEntry, 'getAbsolutePath') || fileEntry.fullPath
                        } catch (e) {
                          fullPath = fileEntry.fullPath
                        }
                        console.log('文件保存成功:', fullPath)
                        resolve({ 
                          success: true, 
                          message: '保存成功', 
                          filePath: fullPath 
                        })
                      }
                      writer.onerror = (e) => {
                        console.error('写入失败:', e)
                        resolve({ success: false, message: '写入失败' })
                      }
                      writer.write(content)
                    },
                    () => resolve({ success: false, message: '创建文件失败' })
                  )
                },
                () => resolve({ success: false, message: '创建目录失败' })
              )
            },
            () => resolve({ success: false, message: '无法访问存储' })
          )
        },
        () => resolve({ success: false, message: '请求文件系统失败' })
      )
    } catch (e) {
      console.error('保存文件失败:', e)
      resolve({ success: false, message: '保存失败: ' + (e as Error).message })
    }
  })
}

export async function loadFromExternalStorage(filename: string): Promise<StorageResult> {
  return new Promise((resolve) => {
    try {
      if (uni.getSystemInfoSync().platform !== 'android') {
        resolve({ success: false, message: '仅支持Android平台' })
        return
      }
      
      // 先检查应用目录
      plus.io.resolveLocalFileSystemURL(
        '_doc/SangshiGame/' + filename,
        (fileEntry) => {
          fileEntry.file(
            (fileObj) => {
              const reader = new plus.io.FileReader()
              reader.onloadend = (e) => {
                if (e.target && e.target.result) {
                  // 修改：返回的是内容，不是文件路径！
                  resolve({ success: true, message: '读取成功', content: e.target.result as string })
                } else {
                  resolve({ success: false, message: '读取内容为空' })
                }
              }
              reader.onerror = () => resolve({ success: false, message: '读取失败' })
              reader.readAsText(fileObj)
            },
            () => resolve({ success: false, message: '文件不存在' })
          )
        },
        () => {
          resolve({ success: false, message: '文件不存在' })
        }
      )
    } catch (e) {
      console.error('读取文件失败:', e)
      resolve({ success: false, message: '读取失败: ' + (e as Error).message })
    }
  })
}

export async function saveGameToExternalStorage(saveKey: string, data: any): Promise<StorageResult> {
  const result = await requestStoragePermission()
  if (!result.success) {
    console.log('外部存储权限未授予，无法保存:', result.message)
    return result
  }
  
  const filename = `${saveKey}.json`
  const content = JSON.stringify(data, null, 2)
  const saveResult = await saveToExternalStorage(filename, content)
  console.log('外部存储保存结果:', saveResult)
  return saveResult
}

export async function loadGameFromExternalStorage(saveKey: string): Promise<StorageResult> {
  const result = await requestStoragePermission()
  if (!result.success) {
    console.log('外部存储权限未授予，无法读取:', result.message)
    return result
  }
  
  const filename = `${saveKey}.json`
  const loadResult = await loadFromExternalStorage(filename)
  console.log('外部存储读取结果:', loadResult)
  return loadResult
}