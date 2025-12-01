# pacedSpeech 生成流程详解

## 一、当前流程概览

### 完整转换流程

```
JSON文件（原始内容）
  ↓
hintScraper.py - 提取所有 hint.text
  ↓
scrapedHints.txt - 原始文本（包含 $$LaTeX$$）
  ↓
手动处理/预处理 - 转换为特殊格式
  ↓
Pre.txt 文件 - 特殊格式（; 分隔提示，@ 分隔 LaTeX）
  ↓
sreConverter.py - LaTeX → MathML → Speech
  ↓
Post.txt 文件 - 转换后的语音文本
  ↓
手动处理/后处理 - 生成 pacedSpeech 数组
  ↓
pacedTranslatedHintsPost.txt - 最终格式
  ↓
mtsPacedWriter.py - 写入 JSON 文件
  ↓
JSON文件（包含 pacedSpeech）
```

---

## 二、详细步骤解析

### 步骤 1：提取原始文本

**脚本**：`hintScraper.py`

**功能**：
- 扫描所有 `DefaultPathway.json` 文件
- 提取每个 hint 的 `text` 字段
- 写入 `scrapedHints.txt`

**示例输入**（JSON）：
```json
{
  "text": "The known quantities are $$20$$ and $$0.05$$."
}
```

**示例输出**（scrapedHints.txt）：
```
The known quantities are $$20$$ and $$0.05$$.
What is $$x$$ times $$y$$?
```

---

### 步骤 2：转换为特殊格式（Pre.txt）

**问题**：这一步**需要手动处理**！

**格式规则**：
- `;` 分隔不同的提示（hint）
- `@` 分隔不同的 LaTeX 表达式
- 空提示用 `;;` 表示

**示例**（Pre.txt）：
```
;4@x;4;;;-2y@4y^2;-2y@3y;-2y;;;p@x;p;;;
```

**解释**：
- `;4@x;4` = 第一个提示：文本 "4"，LaTeX "x"，文本 "4"
- `;;;` = 空提示
- `-2y@4y^2;-2y@3y;-2y` = 第二个提示：文本 "-2y"，LaTeX "4y^2"，文本 "-2y"，LaTeX "3y"，文本 "-2y"

**⚠️ 这是手动步骤**：需要将原始文本转换为这种格式

---

### 步骤 3：LaTeX 转语音（SRE 转换）

**脚本**：`sreConverter.py`

**核心函数**：`convert_pre_to_post()`

**处理流程**：

1. **解析 Pre.txt**：
   ```python
   hints = pre_content.split(';')  # 按 ; 分割提示
   ```

2. **提取所有 LaTeX**：
   ```python
   for hint in hints:
       latex_expressions = hint.split('@')  # 按 @ 分割 LaTeX
       all_latex.append(latex)
   ```

3. **LaTeX → MathML → Speech**：
   ```python
   # LaTeX → MathML
   mathml = latex_to_mathml(latex)
   
   # MathML → Speech（通过 sreNode.js）
   speech = sre.toSpeech(mathml)
   
   # 清理输出
   speech = clean_speech(speech)  # 移除 StartFraction, EndFraction 等
   ```

4. **重组为 Post.txt 格式**：
   ```python
   # 用 " at sign " 连接 LaTeX 转换后的语音
   converted_hint = ' at sign '.join(converted_expressions)
   
   # 用 " semicolon " 连接所有提示
   result = ' semicolon '.join(converted_hints)
   ```

**示例转换**：

**输入**（Pre.txt）：
```
;4@x;4
```

**处理过程**：
1. 分割：`['', '4', 'x', '4']`
2. LaTeX "x" → MathML → Speech: "x"
3. 重组：`"4 at sign x, 4"`

**输出**（Post.txt）：
```
semicolon 4 at sign x, semicolon 4
```

---

### 步骤 4：生成 pacedSpeech 数组

**问题**：这一步**也需要手动处理或使用 Jupyter Notebook**！

**目标**：将 Post.txt 转换为 `pacedSpeech` 数组格式

**pacedSpeech 格式**：
- 数组，每个元素是一个文本段
- 文本段之间用 `£` 分隔（在最终文件中）

**示例**：

**原始文本**：
```
The known quantities are $$20$$ and $$0.05$$.
```

**pacedSpeech**：
```json
[
  "The known quantities are   20 ",
  " and   0.05,"
]
```

**生成逻辑**（从 Jupyter Notebook 代码）：
```python
def self_paced_parsing():
    """ 将提示解析为文本段和 LaTeX 段 """
    for hint in hints:
        # 提取文本部分（不在 $$ 之间的）
        strings_not_between_dollars = re.split(r'\$\$.*?\$\$', hint)
        # 提取 LaTeX 部分（在 $$ 之间的）
        strings_between_dollars = re.findall(r'\$\$(.*?)\$\$', hint)
        
        # 组合：文本 + LaTeX转换后的语音 + 文本 + ...
        paced_segments = []
        for i, text_part in enumerate(strings_not_between_dollars):
            if text_part.strip():
                paced_segments.append(text_part.strip())
            if i < len(strings_between_dollars):
                latex = strings_between_dollars[i]
                speech = convert_latex_to_speech(latex)  # 使用 Post.txt 中的转换结果
                paced_segments.append(speech)
```

**最终文件**（pacedTranslatedHintsPost.txt）：
```
The known quantities are   20 £ and   0.05,
What is   x £ times   y?
```

**格式**：
- 每行是一个提示的 `pacedSpeech`
- 用 `£` 分隔不同的段

---

### 步骤 5：写入 JSON 文件

**脚本**：`mtsPacedWriter.py`

**功能**：
- 读取 `pacedTranslatedHintsPost.txt`
- 按行分割，每行用 `£` 分割成数组
- 写入对应的 JSON 文件的 `pacedSpeech` 字段

**代码**：
```python
with open('pacedTranslatedHintsPost.txt', 'r') as file:
    hints = [hint.strip().split('£') for hint in file.readlines()]

i = 0
for source_file in filepaths:
    with open(source_file, 'r+') as file:
        data = json.load(file)
        for obj in data:
            obj['pacedSpeech'] = hints[i]  # 直接赋值数组
            i += 1
        file.write(json.dumps(data, indent=4))
```

**最终 JSON**：
```json
{
  "text": "The known quantities are $$20$$ and $$0.05$$.",
  "pacedSpeech": [
    "The known quantities are   20 ",
    " and   0.05,"
  ]
}
```

---

## 三、关键发现

### 1. 手动步骤仍然存在

**步骤 2**：将原始文本转换为 Pre.txt 格式
- ❌ **需要手动处理**
- 需要理解 `;` 和 `@` 的格式规则
- 容易出错

**步骤 4**：生成 pacedSpeech 数组
- ⚠️ **部分自动化**（使用 Jupyter Notebook）
- 但仍需要手动运行和检查

### 2. pacedSpeech 的生成公式

**核心逻辑**：
```
原始文本: "Text1 $$LaTeX1$$ Text2 $$LaTeX2$$ Text3"
  ↓
分割: ["Text1", "LaTeX1", "Text2", "LaTeX2", "Text3"]
  ↓
转换 LaTeX: ["Text1", "Speech1", "Text2", "Speech2", "Text3"]
  ↓
组合: ["Text1 Speech1", "Text2 Speech2", "Text3"]
  ↓
清理和分段: ["Text1 Speech1", "Text2 Speech2", "Text3"]
```

**分段规则**：
- 每个 LaTeX 表达式前后都是独立的段
- 文本部分如果为空或只有空格，可能被合并或忽略
- 最终数组中的每个元素对应一个音频段

### 3. 当前流程的问题

1. **手动步骤多**：
   - 步骤 2：手动转换格式
   - 步骤 4：手动运行 Notebook

2. **格式复杂**：
   - Pre.txt 的 `;` 和 `@` 格式难以理解
   - 容易出错

3. **不直接**：
   - 不能直接从 JSON 的 `text` 字段生成 `pacedSpeech`
   - 需要中间文件

---

## 四、自动化改进方案

### 方案：直接从 JSON 生成 pacedSpeech

**新流程**：
```
JSON文件（原始内容，包含 text 字段）
  ↓
autoProcessor.js - 直接处理
  ↓
提取 text 字段
  ↓
解析 $$LaTeX$$ 表达式
  ↓
LaTeX → MathML → Speech（使用 SRE）
  ↓
生成 pacedSpeech 数组
  ↓
更新 JSON 文件
```

**核心函数**：
```javascript
function generatePacedSpeech(text) {
    // 1. 分割文本和 LaTeX
    const parts = text.split(/(\$\$.*?\$\$)/);
    
    // 2. 处理每个部分
    const segments = [];
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (part.startsWith('$$') && part.endsWith('$$')) {
            // LaTeX 部分：转换为语音
            const latex = part.replace(/\$\$/g, '');
            const speech = latexToSpeech(latex);  // 使用 SRE
            segments.push(speech);
        } else if (part.trim()) {
            // 文本部分：直接使用
            segments.push(part.trim());
        }
    }
    
    return segments;
}
```

**优势**：
- ✅ 无需手动步骤
- ✅ 直接从 JSON 处理
- ✅ 格式简单明了
- ✅ 可以集成到构建流程

---

## 五、实施建议

### 立即实施

1. **创建 `autoProcessor.js`**：
   - 直接读取 JSON 文件
   - 提取 `text` 字段
   - 生成 `pacedSpeech`
   - 更新 JSON 文件

2. **复用现有 SRE 转换**：
   - 使用 `sreNode.js` 进行 LaTeX 转换
   - 复用清理函数

3. **集成到构建流程**：
   - 在 `preprocessProblemPool.js` 中调用
   - 自动处理所有内容

### 保留现有流程（作为参考）

- 保留现有脚本作为参考
- 新脚本可以逐步替换旧流程
- 确保向后兼容

---

## 六、总结

### 当前流程
1. ✅ SRE 转换已自动化（`sreConverter.py`）
2. ❌ 格式转换需要手动（Pre.txt）
3. ⚠️ pacedSpeech 生成部分手动（Jupyter Notebook）
4. ✅ 写入 JSON 已自动化（`mtsPacedWriter.py`）

### 改进目标
1. ✅ **完全自动化**：直接从 JSON 生成 pacedSpeech
2. ✅ **无需中间文件**：不依赖 Pre.txt 和 Post.txt
3. ✅ **集成到构建**：自动运行，无需手动干预

### 关键公式

**pacedSpeech 生成公式**：
```
pacedSpeech = splitByLaTeX(text)
  .map(part => {
    if (isLaTeX(part)) {
      return latexToSpeech(part);  // SRE 转换
    } else {
      return part.trim();  // 文本部分
    }
  })
  .filter(segment => segment.length > 0);
```

---

**结论**：虽然 SRE 转换已自动化，但**格式转换和 pacedSpeech 生成仍需要手动步骤**。我们需要创建一个完全自动化的脚本，直接从 JSON 文件生成 `pacedSpeech`。




