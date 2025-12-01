# TTS 功能完成日志

**完成日期**：2025-11-26  
**版本**：1.0

---

## 一、已完成功能概览

本次完成了两大核心功能：

1. **AWS Lambda TTS 服务**：基于 OpenAI TTS API 的音频生成服务
2. **S3 服务器端缓存**：整条 hint 级别的音频缓存，减少 API 调用和成本

---

## 二、功能 1：AWS Lambda TTS 服务

### 2.1 实现内容

**Lambda 函数**：
- **函数名**：`whisperExperiment`
- **运行时**：Node.js 24.x（ESM 模式）
- **端点**：`https://7g3tiigt6paiqrcfub5f6vouqq0gynjn.lambda-url.us-east-2.on.aws/`
- **部署方式**：Lambda Function URL（直接 HTTPS 端点，无需 API Gateway）

**核心功能**：
- 接收 `segments` 数组（`pacedSpeech` 或文本段落）
- 调用 OpenAI TTS API 生成音频
- 返回 base64 编码的 MP3 音频数组
- 支持批量处理多个文本段

**技术实现**：
- 使用 ESM 模块（`import` 语法）
- 使用原生 `fetch` API（Node.js 20+ 内置）
- 使用 AWS SDK v3（`@aws-sdk/client-s3`）
- 错误处理和日志记录

### 2.2 前端集成

**修改的文件**：
1. `src/components/problem-layout/HintSystem.js`
   - `fetchAudioData()` 方法调用 Lambda 端点
   - 处理响应格式（支持直接返回和 API Gateway 包装）
   - 回退机制：如果 `pacedSpeech` 为空，使用 `hint.text`

2. `src/components/problem-layout/HintVoiceBoard.js`
   - 同样的 `fetchAudioData()` 实现
   - 集成加载状态管理

**关键代码**：
```javascript
const segments = Array.isArray(hint.pacedSpeech) && hint.pacedSpeech.length > 0
    ? hint.pacedSpeech
    : [hint.text || ""];

const response = await axios.post(
    "https://7g3tiigt6paiqrcfub5f6vouqq0gynjn.lambda-url.us-east-2.on.aws/",
    { segments },
    { headers: { "Content-Type": "application/json" } }
);
```

### 2.3 环境配置

**Lambda 环境变量**：
- `OPENAI_API_KEY`：OpenAI API 密钥
- `OPENAI_TTS_MODEL`：TTS 模型（默认：`gpt-4o-mini-tts`）
- `OPENAI_TTS_VOICE`：语音类型（默认：`alloy`）
- `AUDIO_CACHE_BUCKET`：S3 缓存桶名称
- `AUDIO_CACHE_PREFIX`：S3 缓存前缀（默认：`tts-cache/hints/`）

**CORS 配置**：
- Lambda Function URL CORS 设置
- 允许来源：`http://localhost:3001`（开发环境）
- 允许方法：`POST`, `OPTIONS`
- 允许头部：`Content-Type`

### 2.4 解决的问题

1. **CORS 跨域问题**：配置 Function URL CORS 设置
2. **运行时兼容性**：从 CommonJS 迁移到 ESM，适配 Node.js 24.x
3. **AWS SDK 版本**：从 v2 迁移到 v3，使用内置 SDK
4. **响应格式处理**：兼容直接返回和 API Gateway 包装两种格式
5. **错误处理**：完善的错误日志和用户友好的错误提示

---

## 三、功能 2：S3 服务器端缓存

### 3.1 实现内容

**缓存策略**：
- **缓存粒度**：整条 hint（`segments` 数组）
- **缓存键**：基于 `segments + model + voice` 的 SHA256 hash
- **存储位置**：AWS S3
- **存储格式**：JSON 文件（`{ audios: [...] }`）

**S3 配置**：
- **Bucket**：`oatutor-tts-audio`
- **前缀**：`tts-cache/hints/`
- **文件命名**：`{hash}.json`

**缓存流程**：
1. 计算缓存键（SHA256 hash）
2. 尝试从 S3 读取缓存
3. 如果命中，直接返回缓存的音频
4. 如果未命中，调用 OpenAI TTS API
5. 将结果写入 S3 缓存（异步，忽略失败）

### 3.2 技术实现

**Lambda 代码逻辑**：
```javascript
// 1. 计算缓存键
const cacheInput = JSON.stringify({ segments, model: MODEL, voice: VOICE });
const hash = crypto.createHash("sha256").update(cacheInput).digest("hex");
const s3Key = `${AUDIO_CACHE_PREFIX}${hash}.json`;

// 2. 尝试读取缓存
const cachedAudios = await getCachedAudios(AUDIO_CACHE_BUCKET, s3Key);
if (cachedAudios) {
    return makeResponse(200, { audios: cachedAudios });
}

// 3. 调用 OpenAI API
const audios = await generateAudios(segments);

// 4. 写入缓存（忽略失败）
await putCachedAudios(AUDIO_CACHE_BUCKET, s3Key, audios);
```

**S3 操作**：
- 使用 AWS SDK v3 `S3Client`
- `GetObjectCommand`：读取缓存
- `PutObjectCommand`：写入缓存
- 错误处理：缓存失败不影响主流程

### 3.3 IAM 权限

**Lambda 执行角色权限**：
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::oatutor-tts-audio/tts-cache/hints/*"
        }
    ]
}
```

### 3.4 缓存效果

**预期收益**：
- **API 调用减少**：80%+（相同内容的重复请求）
- **响应时间**：缓存命中时 < 200ms（vs 1000ms+ API 调用）
- **成本降低**：减少 OpenAI API 调用费用
- **用户体验**：更快的音频加载速度

**缓存命中日志**：
- 缓存命中：`TTS cache hit: {hash}`
- 缓存未命中：`TTS cache miss: {hash}`
- 缓存存储：`TTS cache stored: {s3Key}`

---

## 四、测试验证

### 4.1 功能测试

**测试场景**：
1. ✅ 首次请求 hint 音频（缓存未命中）
2. ✅ 第二次请求相同 hint（缓存命中）
3. ✅ 不同 hint 的音频生成
4. ✅ `pacedSpeech` 为空时的回退机制
5. ✅ 错误处理（API 失败、网络错误）

**测试结果**：
- ✅ Lambda 函数正常响应
- ✅ 音频生成成功
- ✅ S3 缓存读写正常
- ✅ 前端播放功能正常
- ✅ CORS 配置正确

### 4.2 性能测试

**首次请求**（缓存未命中）：
- Lambda 执行时间：~3000ms
- OpenAI API 调用：~2500ms
- S3 写入：~100ms

**缓存命中**：
- Lambda 执行时间：~200ms
- S3 读取：~150ms
- 总响应时间：显著降低

---

## 五、已知限制和未来改进

### 5.1 当前限制

1. **缓存粒度**：目前是整条 hint，未来可以支持单个 segment 缓存
2. **缓存失效**：目前没有 TTL，缓存永久有效（适合静态内容）
3. **缓存清理**：没有自动清理机制
4. **多环境支持**：目前只配置了开发环境 CORS

### 5.2 未来改进方向

1. **浏览器端缓存**：实现 IndexedDB 缓存（层级 2）
2. **会话内缓存**：实现内存缓存（层级 1）
3. **缓存统计**：添加缓存命中率监控
4. **缓存管理**：添加缓存清理和失效机制
5. **多环境配置**：支持生产环境 CORS 和配置

---

## 六、相关文件

### 6.1 Lambda 代码

- **位置**：AWS Lambda 控制台（`whisperExperiment` 函数）
- **代码类型**：ESM 模块（`index.mjs`）
- **依赖**：AWS SDK v3（内置）

### 6.2 前端代码

- `src/components/problem-layout/HintSystem.js`
- `src/components/problem-layout/HintVoiceBoard.js`

### 6.3 配置文件

- Lambda 环境变量（AWS 控制台）
- Lambda Function URL CORS 设置
- IAM 角色权限策略

---

## 七、部署检查清单

### 7.1 Lambda 配置

- [x] Lambda 函数创建（`whisperExperiment`）
- [x] 运行时设置为 Node.js 24.x
- [x] 环境变量配置（`OPENAI_API_KEY`, `AUDIO_CACHE_BUCKET` 等）
- [x] Function URL 创建并启用 CORS
- [x] IAM 角色权限配置（S3 读写）

### 7.2 S3 配置

- [x] S3 Bucket 创建（`oatutor-tts-audio`）
- [x] 权限配置（Lambda 执行角色访问）

### 7.3 前端集成

- [x] `HintSystem.js` 修改
- [x] `HintVoiceBoard.js` 修改
- [x] 测试音频播放功能

---

## 八、总结

### 8.1 完成状态

✅ **AWS Lambda TTS 服务**：已完成并部署  
✅ **S3 服务器端缓存**：已完成并部署  
✅ **前端集成**：已完成并测试  
✅ **CORS 配置**：已完成  
✅ **错误处理**：已实现  

### 8.2 关键成果

1. **功能完整性**：从文本到音频的完整流程已打通
2. **性能优化**：S3 缓存显著减少 API 调用和响应时间
3. **可扩展性**：架构支持未来添加浏览器端和会话内缓存
4. **稳定性**：完善的错误处理和日志记录

### 8.3 下一步

1. 实现浏览器端缓存（IndexedDB）
2. 实现会话内缓存（内存 Map）
3. 添加缓存统计和监控
4. 优化缓存策略（segment 级别缓存）

---

**文档版本**：1.0  
**最后更新**：2025-11-26  
**维护者**：OATutor 开发团队

