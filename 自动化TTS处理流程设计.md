# 自动化 TTS 处理流程设计

## 一、设计目标

创建一个完全自动化的流程，从 JSON 文件的 `text` 字段直接生成 `pacedSpeech`，并在合适的时机自动触发。

---

## 二、触发时机设计

### 2.1 主要触发时机（推荐）

#### 1. **构建时自动触发** ⭐ 主要方式

**位置**：`preprocessProblemPool.js`（构建流程中）

**触发条件**：
- 每次运行 `npm run build` 或 `npm start` 时
- 在预处理内容池时自动检查和处理

**优势**：
- ✅ 自动化，无需手动干预
- ✅ 确保所有内容都有 `pacedSpeech`
- ✅ 与现有构建流程集成

**实现**：
```javascript
// 在 preprocessProblemPool.js 中
const { processTTSContent } = require('../math-to-speech/scripts/autoProcessor');

// 在处理每个 hint 后
for (const hint of hintPathway) {
    // 检查是否需要生成 pacedSpeech
    if (needsTTSProcessing(hint)) {
        hint.pacedSpeech = await generatePacedSpeech(hint.text);
    }
}
```

---

#### 2. **文件变化时触发**（开发时）

**位置**：文件监听器（可选，开发环境）

**触发条件**：
- JSON 文件被修改
- `text` 字段变化
- `pacedSpeech` 字段缺失

**实现方式**：
- 使用 `chokidar` 或 `nodemon` 监听文件变化
- 开发时自动处理

**优势**：
- ✅ 开发时实时更新
- ✅ 快速反馈

---

#### 3. **手动触发**（CLI 命令）

**位置**：独立的 CLI 脚本

**触发条件**：
- 用户运行 `npm run process-tts`
- 可以指定文件或目录
- 可以强制重新生成

**实现**：
```bash
# package.json
"scripts": {
    "process-tts": "node src/math-to-speech/scripts/autoProcessor.js",
    "process-tts:force": "node src/math-to-speech/scripts/autoProcessor.js --force",
    "process-tts:file": "node src/math-to-speech/scripts/autoProcessor.js --file <path>"
}
```

**优势**：
- ✅ 灵活控制
- ✅ 可以单独运行
- ✅ 支持批量处理

---

#### 4. **运行时检查**（回退方案，不推荐）

**位置**：前端组件（`HintSystem.js`）

**触发条件**：
- `pacedSpeech` 缺失或为空
- 首次加载提示时

**实现**：
```javascript
// 在 HintSystem 中
if (!hint.pacedSpeech || hint.pacedSpeech.length === 0) {
    // 运行时生成（使用客户端 SRE）
    hint.pacedSpeech = generatePacedSpeechRuntime(hint.text);
}
```

**注意**：
- ⚠️ 不推荐作为主要方式
- ⚠️ 性能影响
- ✅ 可以作为回退方案

---

### 2.2 触发条件判断

#### 条件 1：pacedSpeech 缺失或为空
```javascript
function needsTTSProcessing(hint) {
    return !hint.pacedSpeech || 
           !Array.isArray(hint.pacedSpeech) || 
           hint.pacedSpeech.length === 0;
}
```

#### 条件 2：内容变化检测（增量更新）
```javascript
function needsTTSProcessing(hint, cachedHash) {
    // 计算 text 字段的 hash
    const currentHash = hash(hint.text);
    
    // 如果 hash 变化，需要重新生成
    return currentHash !== cachedHash;
}
```

#### 条件 3：强制重新生成
```javascript
function needsTTSProcessing(hint, options = {}) {
    if (options.force) {
        return true;  // 强制重新生成
    }
    
    // 其他条件...
}
```

---

## 三、架构设计

### 3.1 文件结构

```
src/
├── math-to-speech/
│   ├── scripts/
│   │   ├── autoProcessor.js          # 主处理脚本（CLI + 模块）
│   │   ├── ttsProcessor.js           # 核心处理逻辑
│   │   ├── sreNode.js                # SRE 转换（已存在）
│   │   └── cacheManager.js           # 缓存管理
│   └── utils/
│       ├── textParser.js             # 文本解析工具
│       └── latexConverter.js         # LaTeX 转换工具
└── tools/
    └── preprocessProblemPool.js      # 集成点
```

### 3.2 核心模块设计

#### 模块 1：`ttsProcessor.js`（核心处理逻辑）

```javascript
// src/math-to-speech/scripts/ttsProcessor.js

const { latexToSpeech } = require('./latexConverter');
const { parseTextAndLaTeX } = require('../utils/textParser');

/**
 * 从文本生成 pacedSpeech 数组
 * @param {string} text - 原始文本（可能包含 $$LaTeX$$）
 * @returns {Promise<string[]>} - pacedSpeech 数组
 */
async function generatePacedSpeech(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }
    
    // 1. 解析文本和 LaTeX
    const parts = parseTextAndLaTeX(text);
    
    // 2. 处理每个部分
    const segments = [];
    for (const part of parts) {
        if (part.type === 'latex') {
            // LaTeX → Speech（使用 SRE）
            const speech = await latexToSpeech(part.content);
            if (speech) {
                segments.push(speech);
            }
        } else if (part.type === 'text' && part.content.trim()) {
            // 文本部分
            segments.push(part.content.trim());
        }
    }
    
    return segments.length > 0 ? segments : [text];
}

/**
 * 检查是否需要处理
 */
function needsProcessing(hint, options = {}) {
    // 强制重新生成
    if (options.force) {
        return true;
    }
    
    // pacedSpeech 缺失或为空
    if (!hint.pacedSpeech || 
        !Array.isArray(hint.pacedSpeech) || 
        hint.pacedSpeech.length === 0) {
        return true;
    }
    
    // 内容变化检测（如果启用）
    if (options.checkContentHash) {
        const currentHash = hashContent(hint.text);
        const cachedHash = hint._ttsHash;
        if (currentHash !== cachedHash) {
            return true;
        }
    }
    
    return false;
}

module.exports = {
    generatePacedSpeech,
    needsProcessing
};
```

#### 模块 2：`autoProcessor.js`（主脚本）

```javascript
// src/math-to-speech/scripts/autoProcessor.js

const fs = require('fs');
const path = require('path');
const { generatePacedSpeech, needsProcessing } = require('./ttsProcessor');

/**
 * 处理单个 JSON 文件
 */
async function processFile(filePath, options = {}) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let modified = false;
    let processedCount = 0;
    
    // 处理数组（hint pathway）
    if (Array.isArray(data)) {
        for (const hint of data) {
            if (needsProcessing(hint, options)) {
                hint.pacedSpeech = await generatePacedSpeech(hint.text);
                hint._ttsHash = hashContent(hint.text);  // 保存 hash
                modified = true;
                processedCount++;
            }
        }
    }
    
    // 如果修改了，写回文件
    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`✓ Processed ${processedCount} hints in ${path.basename(filePath)}`);
    }
    
    return { modified, processedCount };
}

/**
 * 递归查找所有 pathway 文件
 */
function findAllPathwayFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            
            if (entry.isDirectory()) {
                traverse(fullPath);
            } else if (entry.name.includes('DefaultPathway.json')) {
                files.push(fullPath);
            }
        }
    }
    
    traverse(dir);
    return files;
}

/**
 * 主函数
 */
async function main() {
    const args = process.argv.slice(2);
    const options = {
        force: args.includes('--force'),
        checkContentHash: args.includes('--check-hash'),
        file: args.find(arg => arg.startsWith('--file='))?.split('=')[1],
        dir: args.find(arg => arg.startsWith('--dir='))?.split('=')[1]
    };
    
    let files = [];
    
    if (options.file) {
        // 处理单个文件
        files = [options.file];
    } else if (options.dir) {
        // 处理指定目录
        files = findAllPathwayFiles(options.dir);
    } else {
        // 处理所有文件
        const contentPoolPath = path.join(__dirname, '../../content-sources/oatutor/content-pool');
        files = findAllPathwayFiles(contentPoolPath);
    }
    
    console.log(`Processing ${files.length} files...\n`);
    
    let totalProcessed = 0;
    let totalModified = 0;
    
    for (const file of files) {
        try {
            const { modified, processedCount } = await processFile(file, options);
            if (modified) totalModified++;
            totalProcessed += processedCount;
        } catch (error) {
            console.error(`✗ Error processing ${file}:`, error.message);
        }
    }
    
    console.log(`\n✓ Completed: ${totalProcessed} hints processed, ${totalModified} files modified`);
}

// 如果作为脚本运行
if (require.main === module) {
    main().catch(console.error);
}

// 如果作为模块导入
module.exports = {
    processFile,
    findAllPathwayFiles,
    generatePacedSpeech
};
```

#### 模块 3：集成到构建流程

```javascript
// src/tools/preprocessProblemPool.js

// 在文件顶部添加
const { processFile } = require('../math-to-speech/scripts/autoProcessor');

// 在处理 hint pathway 时
const hintPathways = await Promise.all(
    hintPathwaysDir.map(async hintPathwayFile => {
        const hintPathwayPath = path.join(stepPath, 'tutoring', hintPathwayFullName);
        const hintPathway = require(hintPathwayPath);
        
        // 自动处理 TTS
        await processFile(hintPathwayPath, {
            checkContentHash: true  // 检查内容变化
        });
        
        // 重新加载（因为可能被修改）
        delete require.cache[require.resolve(hintPathwayPath)];
        const updatedPathway = require(hintPathwayPath);
        
        return { [hintPathwayName]: updatedPathway };
    })
);
```

---

## 四、触发时机总结

### 推荐方案：构建时自动触发

**触发位置**：`preprocessProblemPool.js`

**触发条件**：
1. ✅ `pacedSpeech` 缺失或为空
2. ✅ `text` 字段变化（通过 hash 检查）
3. ✅ 强制模式（`--force` 参数）

**优势**：
- ✅ 完全自动化
- ✅ 与现有流程集成
- ✅ 确保内容一致性
- ✅ 支持增量更新

### 辅助方案

1. **开发时**：文件监听器（可选）
2. **手动触发**：CLI 命令
3. **运行时**：回退方案（不推荐）

---

## 五、实施步骤

### 步骤 1：创建核心处理模块

1. 创建 `src/math-to-speech/utils/textParser.js`
   - 解析文本和 LaTeX
   - 提取 `$$LaTeX$$` 表达式

2. 创建 `src/math-to-speech/utils/latexConverter.js`
   - 封装 SRE 转换
   - 调用 `sreNode.js`

3. 创建 `src/math-to-speech/scripts/ttsProcessor.js`
   - 核心处理逻辑
   - `generatePacedSpeech()` 函数

### 步骤 2：创建主处理脚本

1. 创建 `src/math-to-speech/scripts/autoProcessor.js`
   - CLI 接口
   - 文件扫描和处理
   - 支持命令行参数

### 步骤 3：集成到构建流程

1. 修改 `src/tools/preprocessProblemPool.js`
   - 在处理 hint pathway 时调用 `processFile()`
   - 支持增量更新

2. 更新 `package.json`
   - 添加 `process-tts` 脚本

### 步骤 4：测试和优化

1. 测试单个文件处理
2. 测试批量处理
3. 测试增量更新
4. 性能优化

---

## 六、使用示例

### 构建时自动触发

```bash
# 正常构建，自动处理 TTS
npm run build
# 或
npm start
```

### 手动触发

```bash
# 处理所有文件
npm run process-tts

# 强制重新生成所有
npm run process-tts -- --force

# 处理单个文件
npm run process-tts -- --file=path/to/file.json

# 处理指定目录
npm run process-tts -- --dir=path/to/directory

# 检查内容变化（增量更新）
npm run process-tts -- --check-hash
```

---

## 七、性能考虑

### 优化策略

1. **批量处理**：
   - 一次处理多个文件
   - 使用 Promise.all 并行处理

2. **增量更新**：
   - 只处理变化的内容
   - 使用 hash 检查

3. **缓存**：
   - 缓存 SRE 转换结果
   - 避免重复转换

4. **进度显示**：
   - 显示处理进度
   - 错误报告

---

## 八、总结

### 推荐设计

1. **主要触发**：构建时自动（`preprocessProblemPool.js`）
2. **辅助触发**：手动 CLI 命令
3. **回退方案**：运行时检查（不推荐）

### 关键特性

- ✅ 完全自动化
- ✅ 支持增量更新
- ✅ 灵活的控制选项
- ✅ 与现有流程集成
- ✅ 性能优化

### 实施优先级

1. **高优先级**：核心处理模块 + 主脚本
2. **中优先级**：集成到构建流程
3. **低优先级**：文件监听器（开发时）

---

**这个设计确保了完全自动化，同时提供了灵活的控制选项。**




