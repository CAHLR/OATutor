# SRE 转换质量人工检查报告

**检查时间**：2026-02-16  
**数据源**：`generated/processed-content-pool/oatutor.json`（process-tts 跑完 + preprocess 后的池）

---

## 1. 覆盖情况（与 verify-tts-dataflow 一致）

| 类型   | 带 pacedSpeech | 总数   | 说明 |
|--------|----------------|--------|------|
| 题目   | 7,685          | 11,581 | 约 66% 题目 body 有 SRE 文本 |
| Step   | 14,154         | 14,197 | 几乎全部 |
| Hint   | 54,497         | 54,497 | 全部 |

未带 pacedSpeech 的项前端会使用 `textToReadable` 回退，行为正常。

---

## 2. 抽样听感/可读性

- **题目 body**（带公式）：如 `f(x)=x^3+1`、`g(x)=(x-1)^{1/3}` → “f of x equals x cubed plus 1”、“x minus 1 to the one third”，表达正确、可读。
- **Step**：如 `(g∘f)(x)=F(x)` → “g composed with f of x equals F of x”；`r(t)=25√(t+2)` → “r of t equals 25 the square root of t plus 2”，符合预期。
- **Hint**：如 `(g∘f)(x)=g(f(x))` → “g composed with f of x equals g of f of x”；分式、根号、指数抽样无 LaTeX 残留，听感自然。

---

## 3. 已发现的问题

### 3.1 LaTeX 未转换残留（需人工或上游修复）

**数量**：15 条 **hint** 的 `pacedSpeech` 中仍含 `$$` 及原始 LaTeX（即 SRE 未成功转换，写入了原文）。

**涉及 id（均为 hint）**：

- `a1fac02a1cc0dcareas3a-h4`
- `a343428l'hopital17a-h2`, `a343428l'hopital21a-h2`, `a343428l'hopital21a-h3`, `a343428l'hopital4a-h2`
- `a9c994ba1cc0dcareas10a-h4`, `a9c994ba1cc0dcareas10a-h5`, `a9c994ba1cc0dcareas6a-h5`
- `a9cf10atrig19a-h3`, `a9cf10atrig19a-h10`, `a9cf10atrig29a-h2`
- `aa82aec5.4q2a-h1`
- `ad88052l'hopital21a-h2`, `ad88052l'hopital21a-h3`, `ad88052l'hopital4a-h2`

**典型内容**：`$$\fractan^\\left(0\right)...$$`、`$$\fracsin^\\left(...$$` 等，多为 LaTeX 书写不规范（如 `\frac` 写成 `\fractan`、`\fracsin`）或 SRE 解析失败导致未转成语音文本。

**建议**：  
- 在内容源（content-pool）中修正这些 hint 的 LaTeX（拼写/结构），然后对该批 hint 重新跑 process-tts；  
- 或对上述 15 条在写入 `pacedSpeech` 前做 fallback：若 SRE 结果仍含 `$$`，用 `textToReadable` 结果写入，避免 TTS 直接读 LaTeX。

---

### 3.2 SRE 标记残留：“end exponent” / “begin exponent”

**数量**：77 条（step/hint）的 `pacedSpeech` 中含 “end exponent” 或 “begin exponent”。

**示例**：  
“g of f of x equals x cubed plus 1 minus 1 **to the exponent one third end exponent**”

**已做修改**：在 `hintProcessor.js` 的 `cleanSpeech()` 中已增加对 `end exponent`、`begin exponent` 的移除。**之后重新跑 process-tts 的段落会自动去掉这些残留**；已有池如需立刻干净，可对当前池中 77 条再做一次相同清理或重跑 TTS。

---

### 3.3 “absolute value” 措辞重复

**数量**：约 198 条含 “the absolute value of … is the absolute value of …” 或类似重复表述。

**说明**：当前 `cleanSpeech` 已处理 “the absolute value is the absolute value of” → “the absolute value of”。若仍有个别句式未覆盖，可在后续对 `cleanSpeech` 再补一条规则，或抽样后按需扩展。

---

### 3.4 其他检查结果

- **小数空格**：未发现 “0. 5” 这类错误（当前 cleanSpeech 已有小数点空格修复）。
- **裸 `$`**：未对“仅含单 `$`”做统计（易与 shell 变量混淆）；抽样中未发现明显因单 `$` 导致的读错。
- **backslash 命令残留**：与上述 15 条 LaTeX 未转换重叠，均为同一批 hint。

---

## 4. 结论与建议

- **整体**：绝大多数 step/hint 和约 2/3 题目已使用 SRE 转换的 `pacedSpeech`，抽样听感正常，无大面积 LaTeX 或 SRE 结构标记残留。
- **建议**：  
  1. **高优先级**：对上述 15 个 hint 检查源 LaTeX 并修正，或对含 `$$` 的 SRE 结果做 fallback，再重跑/更新 TTS。  
  2. **已处理**：在 `cleanSpeech` 中移除 “end exponent” / “begin exponent”，后续转换即可避免该 77 条问题。  
  3. **低优先级**：如需，可再扩展 `cleanSpeech` 以进一步压缩 “absolute value” 重复表述。

以上为本次 SRE 转换质量的人工检查结果与后续可做的小改动建议。
