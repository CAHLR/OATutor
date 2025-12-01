# TTS 缓存系统详细设计

## 一、当前状态分析

### 1.1 现有缓存机制

**当前实现**（`HintSystem.js` 和 `HintVoiceBoard.js`）：
```javascript
// 当前方式：存储在 hint 对象中（内存）
fetchAudioData = async (hint) => {
    if (!hint.audios) {  // 简单的存在性检查
        const response = await axios.post(AWS_LAMBDA_URL, {
            segments: hint.pacedSpeech
        });
        hint.audios = JSON.parse(response.data.body).audios;  // 存储在 hint 对象
    }
}
```

**问题**：
- ❌ 只存储在内存中（hint 对象），刷新页面后丢失
- ❌ 没有跨会话缓存
- ❌ 每次都要重新请求相同内容的音频
- ❌ 没有缓存键管理
- ❌ 无法共享缓存（不同用户无法共享）

---

## 二、三层缓存架构设计

### 2.1 架构概览

```
用户请求音频
  ↓
层级 1：会话内缓存（内存 Map）
  ↓ 未命中
层级 2：浏览器缓存（IndexedDB）
  ↓ 未命中
层级 3：服务器端缓存（Redis/文件系统）
  ↓ 未命中
TTS API（OpenAI/AWS）
  ↓
返回音频并写入所有缓存层
```

---

### 2.2 层级 1：会话内缓存（内存）

#### 设计目标
- **最快访问**：内存访问，几乎无延迟
- **会话内共享**：同一会话内所有组件共享
- **自动清理**：会话结束时自动释放

#### 实现方案

**存储位置**：React Context 或全局 Map

**数据结构**：
```javascript
// 全局缓存 Map
const sessionCache = new Map();

// 缓存项结构
{
    cacheKey: string,           // 缓存键
    audioData: string[],        // base64 编码的音频数组
    metadata: {
        problemID: string,
        stepID: string,
        hintID: string,
        timestamp: number,      // 缓存时间
        size: number           // 数据大小（字节）
    }
}
```

**实现代码**：
```javascript
// src/util/ttsCache.js

class SessionCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100;  // 最大缓存项数
        this.maxMemory = 50 * 1024 * 1024;  // 最大内存 50MB
        this.currentMemory = 0;
    }

    /**
     * 获取缓存
     */
    get(cacheKey) {
        const item = this.cache.get(cacheKey);
        if (item) {
            // 更新访问时间（LRU）
            item.metadata.lastAccessed = Date.now();
            return item.audioData;
        }
        return null;
    }

    /**
     * 设置缓存
     */
    set(cacheKey, audioData, metadata) {
        // 检查内存限制
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }

        const size = this.calculateSize(audioData);
        if (this.currentMemory + size > this.maxMemory) {
            this.evictLRU();
        }

        this.cache.set(cacheKey, {
            audioData,
            metadata: {
                ...metadata,
                timestamp: Date.now(),
                lastAccessed: Date.now(),
                size
            }
        });

        this.currentMemory += size;
    }

    /**
     * 计算数据大小
     */
    calculateSize(audioData) {
        // base64 编码的音频数据大小
        return audioData.reduce((total, segment) => {
            return total + (segment.length * 3 / 4);  // base64 解码后大小
        }, 0);
    }

    /**
     * LRU 淘汰策略
     */
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Infinity;

        for (const [key, item] of this.cache.entries()) {
            if (item.metadata.lastAccessed < oldestTime) {
                oldestTime = item.metadata.lastAccessed;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            const item = this.cache.get(oldestKey);
            this.currentMemory -= item.metadata.size;
            this.cache.delete(oldestKey);
        }
    }

    /**
     * 清除所有缓存
     */
    clear() {
        this.cache.clear();
        this.currentMemory = 0;
    }

    /**
     * 获取缓存统计
     */
    getStats() {
        return {
            size: this.cache.size,
            memory: this.currentMemory,
            maxSize: this.maxSize,
            maxMemory: this.maxMemory
        };
    }
}

// 单例实例
export const sessionCache = new SessionCache();
```

**使用方式**：
```javascript
// 在 HintSystem 中
import { sessionCache } from '../util/ttsCache';

fetchAudioData = async (hint) => {
    const cacheKey = generateCacheKey(
        this.props.problemID,
        this.props.step,
        hint.id
    );

    // 检查会话内缓存
    const cached = sessionCache.get(cacheKey);
    if (cached) {
        hint.audios = cached;
        return;
    }

    // 继续检查其他缓存层...
};
```

---

### 2.3 层级 2：浏览器缓存（IndexedDB）

#### 设计目标
- **跨会话持久化**：刷新页面后仍然可用
- **大容量存储**：支持存储大量音频数据
- **离线支持**：离线时可以使用缓存

#### 实现方案

**存储位置**：IndexedDB（使用 localforage 封装）

**数据库结构**：
```
数据库名：tts-cache
版本：1

对象存储：audio
  - key: cacheKey (string)
  - value: {
      audioData: string[],      // base64 编码的音频数组
      metadata: {
          problemID: string,
          stepID: string,
          hintID: string,
          timestamp: number,    // 缓存时间
          expiresAt: number,    // 过期时间
          size: number,         // 数据大小
          version: string       // 缓存版本（用于失效）
      }
    }

索引：
  - timestamp (用于清理过期缓存)
  - problemID (用于批量删除)
```

**实现代码**：
```javascript
// src/util/ttsCache.js

import localforage from 'localforage';

class BrowserCache {
    constructor() {
        this.store = localforage.createInstance({
            name: 'tts-cache',
            storeName: 'audio',
            description: 'TTS audio cache storage'
        });
        this.ttl = 7 * 24 * 60 * 60 * 1000;  // 7天过期
        this.maxSize = 500 * 1024 * 1024;    // 最大 500MB
    }

    /**
     * 获取缓存
     */
    async get(cacheKey) {
        try {
            const item = await this.store.getItem(cacheKey);
            
            if (!item) {
                return null;
            }

            // 检查是否过期
            if (item.metadata.expiresAt < Date.now()) {
                await this.store.removeItem(cacheKey);
                return null;
            }

            return item.audioData;
        } catch (error) {
            console.error('Browser cache get error:', error);
            return null;
        }
    }

    /**
     * 设置缓存
     */
    async set(cacheKey, audioData, metadata) {
        try {
            // 检查存储空间
            await this.ensureSpace();

            const item = {
                audioData,
                metadata: {
                    ...metadata,
                    timestamp: Date.now(),
                    expiresAt: Date.now() + this.ttl,
                    version: '1.0'  // 用于缓存失效
                }
            };

            await this.store.setItem(cacheKey, item);
            
            // 更新统计
            await this.updateStats();
        } catch (error) {
            console.error('Browser cache set error:', error);
            // 如果存储空间不足，尝试清理
            if (error.name === 'QuotaExceededError') {
                await this.cleanup();
                // 重试一次
                try {
                    await this.store.setItem(cacheKey, item);
                } catch (retryError) {
                    console.error('Browser cache set retry failed:', retryError);
                }
            }
        }
    }

    /**
     * 确保有足够的存储空间
     */
    async ensureSpace() {
        const stats = await this.getStats();
        
        if (stats.totalSize > this.maxSize) {
            await this.cleanup();
        }
    }

    /**
     * 清理过期和旧的缓存
     */
    async cleanup() {
        try {
            const now = Date.now();
            const keys = await this.store.keys();
            let cleaned = 0;

            for (const key of keys) {
                const item = await this.store.getItem(key);
                
                // 删除过期缓存
                if (item && item.metadata.expiresAt < now) {
                    await this.store.removeItem(key);
                    cleaned++;
                }
            }

            // 如果还不够，删除最旧的缓存（LRU）
            if (cleaned < keys.length * 0.1) {  // 如果清理少于10%
                const items = await Promise.all(
                    keys.map(async key => {
                        const item = await this.store.getItem(key);
                        return { key, timestamp: item.metadata.timestamp };
                    })
                );

                // 按时间排序，删除最旧的20%
                items.sort((a, b) => a.timestamp - b.timestamp);
                const toDelete = items.slice(0, Math.floor(items.length * 0.2));

                for (const { key } of toDelete) {
                    await this.store.removeItem(key);
                    cleaned++;
                }
            }

            console.log(`Cleaned ${cleaned} cache entries`);
        } catch (error) {
            console.error('Browser cache cleanup error:', error);
        }
    }

    /**
     * 获取缓存统计
     */
    async getStats() {
        try {
            const keys = await this.store.keys();
            let totalSize = 0;
            let count = 0;

            for (const key of keys) {
                const item = await this.store.getItem(key);
                if (item) {
                    totalSize += item.metadata.size || 0;
                    count++;
                }
            }

            return {
                count,
                totalSize,
                maxSize: this.maxSize
            };
        } catch (error) {
            console.error('Browser cache stats error:', error);
            return { count: 0, totalSize: 0, maxSize: this.maxSize };
        }
    }

    /**
     * 更新统计信息
     */
    async updateStats() {
        // 可以定期更新统计信息
        // 存储在单独的键中
        const stats = await this.getStats();
        await localforage.setItem('tts-cache-stats', stats);
    }

    /**
     * 清除所有缓存
     */
    async clear() {
        await this.store.clear();
    }

    /**
     * 按问题ID批量删除
     */
    async clearByProblemID(problemID) {
        const keys = await this.store.keys();
        const prefix = `${problemID}-`;

        for (const key of keys) {
            if (key.startsWith(prefix)) {
                await this.store.removeItem(key);
            }
        }
    }
}

export const browserCache = new BrowserCache();
```

**使用方式**：
```javascript
// 在 HintSystem 中
import { browserCache } from '../util/ttsCache';

fetchAudioData = async (hint) => {
    const cacheKey = generateCacheKey(...);

    // 检查会话内缓存
    let audioData = sessionCache.get(cacheKey);
    if (audioData) {
        hint.audios = audioData;
        return;
    }

    // 检查浏览器缓存
    audioData = await browserCache.get(cacheKey);
    if (audioData) {
        // 写入会话内缓存
        sessionCache.set(cacheKey, audioData, metadata);
        hint.audios = audioData;
        return;
    }

    // 继续检查服务器端缓存...
};
```

---

### 2.4 层级 3：服务器端缓存（Redis/文件系统）

#### 设计目标
- **跨用户共享**：不同用户可以共享相同内容的缓存
- **减少 API 调用**：避免重复调用 TTS API
- **长期存储**：可以长期保存，减少成本

#### 实现方案

**选项 A：Redis 缓存**（推荐，如果已有 Redis）

**数据结构**：
```
Key: tts:audio:{cacheKey}
Value: {
    audioData: string[],      // base64 编码的音频数组
    metadata: {
        problemID: string,
        stepID: string,
        hintID: string,
        timestamp: number,
        size: number
    }
}
TTL: 30天
```

**实现代码**：
```javascript
// src/tts-server/services/cache.js

const redis = require('redis');

class ServerCache {
    constructor() {
        this.client = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.client.on('error', (err) => console.error('Redis error:', err));
        this.ttl = 30 * 24 * 60 * 60;  // 30天
        this.prefix = 'tts:audio:';
    }

    async connect() {
        if (!this.client.isOpen) {
            await this.client.connect();
        }
    }

    /**
     * 获取缓存
     */
    async get(cacheKey) {
        try {
            await this.connect();
            const key = this.prefix + cacheKey;
            const data = await this.client.get(key);
            
            if (data) {
                return JSON.parse(data);
            }
            return null;
        } catch (error) {
            console.error('Server cache get error:', error);
            return null;
        }
    }

    /**
     * 设置缓存
     */
    async set(cacheKey, audioData, metadata) {
        try {
            await this.connect();
            const key = this.prefix + cacheKey;
            const value = JSON.stringify({
                audioData,
                metadata: {
                    ...metadata,
                    timestamp: Date.now()
                }
            });

            await this.client.setEx(key, this.ttl, value);
        } catch (error) {
            console.error('Server cache set error:', error);
        }
    }

    /**
     * 检查缓存是否存在
     */
    async exists(cacheKey) {
        try {
            await this.connect();
            const key = this.prefix + cacheKey;
            return await this.client.exists(key) === 1;
        } catch (error) {
            console.error('Server cache exists error:', error);
            return false;
        }
    }

    /**
     * 删除缓存
     */
    async delete(cacheKey) {
        try {
            await this.connect();
            const key = this.prefix + cacheKey;
            await this.client.del(key);
        } catch (error) {
            console.error('Server cache delete error:', error);
        }
    }

    /**
     * 获取缓存统计
     */
    async getStats() {
        try {
            await this.connect();
            const keys = await this.client.keys(this.prefix + '*');
            return {
                count: keys.length
            };
        } catch (error) {
            console.error('Server cache stats error:', error);
            return { count: 0 };
        }
    }
}

export const serverCache = new ServerCache();
```

**选项 B：文件系统缓存**（如果没有 Redis）

**目录结构**：
```
cache/
  └── tts/
      └── {problemID}/
          └── {stepID}/
              └── {hintID}.json
```

**实现代码**：
```javascript
// src/tts-server/services/fileCache.js

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FileCache {
    constructor() {
        this.cacheDir = path.join(__dirname, '../../cache/tts');
        this.ttl = 30 * 24 * 60 * 60 * 1000;  // 30天
    }

    /**
     * 获取文件路径
     */
    getFilePath(cacheKey) {
        // 使用 hash 避免路径过长
        const hash = crypto.createHash('md5').update(cacheKey).digest('hex');
        const dir = path.join(this.cacheDir, hash.substring(0, 2));
        return path.join(dir, hash + '.json');
    }

    /**
     * 获取缓存
     */
    async get(cacheKey) {
        try {
            const filePath = this.getFilePath(cacheKey);
            const data = await fs.readFile(filePath, 'utf-8');
            const item = JSON.parse(data);

            // 检查是否过期
            if (item.metadata.timestamp + this.ttl < Date.now()) {
                await this.delete(cacheKey);
                return null;
            }

            return item.audioData;
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('File cache get error:', error);
            }
            return null;
        }
    }

    /**
     * 设置缓存
     */
    async set(cacheKey, audioData, metadata) {
        try {
            const filePath = this.getFilePath(cacheKey);
            const dir = path.dirname(filePath);

            // 确保目录存在
            await fs.mkdir(dir, { recursive: true });

            const item = {
                audioData,
                metadata: {
                    ...metadata,
                    timestamp: Date.now()
                }
            };

            await fs.writeFile(filePath, JSON.stringify(item), 'utf-8');
        } catch (error) {
            console.error('File cache set error:', error);
        }
    }

    /**
     * 删除缓存
     */
    async delete(cacheKey) {
        try {
            const filePath = this.getFilePath(cacheKey);
            await fs.unlink(filePath);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('File cache delete error:', error);
            }
        }
    }

    /**
     * 清理过期缓存
     */
    async cleanup() {
        // 定期清理过期文件
        // 可以设置为定时任务
    }
}

export const fileCache = new FileCache();
```

**后端集成**：
```javascript
// src/tts-server/routes/tts.js

const { serverCache } = require('../services/cache');

router.post('/synthesize', async (req, res) => {
    const { segments, problemID, stepID, hintID } = req.body;
    
    // 生成缓存键
    const cacheKey = generateCacheKey(problemID, stepID, hintID, segments);
    
    // 检查服务器端缓存
    const cached = await serverCache.get(cacheKey);
    if (cached) {
        return res.json({
            audios: cached.audioData,
            cached: true
        });
    }

    // 调用 TTS API
    const audioData = await synthesizeTTS(segments);

    // 写入缓存
    await serverCache.set(cacheKey, audioData, {
        problemID,
        stepID,
        hintID
    });

    res.json({
        audios: audioData,
        cached: false
    });
});
```

---

## 三、缓存键生成策略

### 3.1 缓存键组成

#### 当前情况（无变量）
```javascript
// 简化版缓存键
const cacheKey = `${problemID}-${stepID}-${hintID}`;
```

#### 未来扩展（有变量）
```javascript
// 完整版缓存键
const cacheKey = generateCacheKey(
    problemID,
    stepID,
    hintID,
    seed,
    variabilization,
    pacedSpeech  // 实际内容
);
```

### 3.2 实现代码

```javascript
// src/util/ttsUtils.js

import crypto from 'crypto';

/**
 * 生成缓存键
 */
export function generateCacheKey(problemID, stepID, hintID, options = {}) {
    const {
        seed = null,
        variabilization = {},
        pacedSpeech = null
    } = options;

    // 检查是否有变量
    const hasVariables = variabilization && 
                        Object.keys(variabilization).length > 0;

    if (!hasVariables) {
        // 无变量：简单缓存键（当前情况）
        return `tts:${problemID}:${stepID}:${hintID}`;
    }

    // 有变量：包含 seed 和变量值的缓存键
    if (pacedSpeech) {
        // 基于实际内容生成 hash
        const contentHash = hashContent(pacedSpeech);
        return `tts:${problemID}:${stepID}:${hintID}:${seed}:${contentHash}`;
    } else {
        // 基于变量值生成 hash
        const varsHash = hashContent(JSON.stringify(variabilization));
        return `tts:${problemID}:${stepID}:${hintID}:${seed}:${varsHash}`;
    }
}

/**
 * 内容 hash（用于缓存键）
 */
function hashContent(content) {
    if (typeof content === 'string') {
        return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
    } else if (Array.isArray(content)) {
        return crypto.createHash('md5')
            .update(JSON.stringify(content))
            .digest('hex')
            .substring(0, 8);
    }
    return '';
}

/**
 * 从 hint 对象生成缓存键
 */
export function generateCacheKeyFromHint(hint, problemID, stepID, seed) {
    return generateCacheKey(problemID, stepID, hint.id, {
        seed,
        variabilization: hint.variabilization || {},
        pacedSpeech: hint.pacedSpeech
    });
}
```

---

## 四、统一缓存管理器

### 4.1 设计目标

创建一个统一的缓存管理器，封装三层缓存，提供简单的 API。

### 4.2 实现代码

```javascript
// src/util/ttsCacheManager.js

import { sessionCache } from './ttsCache';
import { browserCache } from './ttsCache';
import { generateCacheKeyFromHint } from './ttsUtils';

class TTSCacheManager {
    /**
     * 获取音频数据（检查所有缓存层）
     */
    async getAudio(hint, problemID, stepID, seed) {
        const cacheKey = generateCacheKeyFromHint(hint, problemID, stepID, seed);

        // 层级 1：会话内缓存
        let audioData = sessionCache.get(cacheKey);
        if (audioData) {
            return { audioData, source: 'session' };
        }

        // 层级 2：浏览器缓存
        audioData = await browserCache.get(cacheKey);
        if (audioData) {
            // 写入会话内缓存
            sessionCache.set(cacheKey, audioData, {
                problemID,
                stepID,
                hintID: hint.id
            });
            return { audioData, source: 'browser' };
        }

        // 层级 3：服务器端缓存（通过 API）
        // 这个会在 fetchAudioData 中处理

        return null;
    }

    /**
     * 设置音频数据（写入所有缓存层）
     */
    async setAudio(hint, problemID, stepID, seed, audioData) {
        const cacheKey = generateCacheKeyFromHint(hint, problemID, stepID, seed);
        const metadata = {
            problemID,
            stepID,
            hintID: hint.id
        };

        // 层级 1：会话内缓存
        sessionCache.set(cacheKey, audioData, metadata);

        // 层级 2：浏览器缓存（异步，不阻塞）
        browserCache.set(cacheKey, audioData, metadata).catch(err => {
            console.error('Browser cache set error:', err);
        });

        // 层级 3：服务器端缓存（由后端处理）
    }

    /**
     * 预加载音频（预取）
     */
    async preloadAudio(hints, problemID, stepID, seed) {
        const promises = hints.map(async hint => {
            const cached = await this.getAudio(hint, problemID, stepID, seed);
            if (!cached && hint.pacedSpeech) {
                // 预取音频（低优先级）
                // 可以在后台请求
            }
        });

        await Promise.allSettled(promises);
    }

    /**
     * 清除缓存
     */
    async clear(options = {}) {
        const { problemID, all } = options;

        if (all) {
            // 清除所有缓存
            sessionCache.clear();
            await browserCache.clear();
        } else if (problemID) {
            // 清除特定问题的缓存
            await browserCache.clearByProblemID(problemID);
        }
    }

    /**
     * 获取缓存统计
     */
    async getStats() {
        const sessionStats = sessionCache.getStats();
        const browserStats = await browserCache.getStats();

        return {
            session: sessionStats,
            browser: browserStats
        };
    }
}

export const ttsCacheManager = new TTSCacheManager();
```

---

## 五、集成到 HintSystem

### 5.1 修改 fetchAudioData

```javascript
// src/components/problem-layout/HintSystem.js

import { ttsCacheManager } from '../../util/ttsCacheManager';
import { generateCacheKeyFromHint } from '../../util/ttsUtils';

fetchAudioData = async (hint) => {
    // 生成缓存键
    const cacheKey = generateCacheKeyFromHint(
        hint,
        this.props.problemID,
        this.props.step,
        this.props.seed
    );

    try {
        // 检查所有缓存层
        const cached = await ttsCacheManager.getAudio(
            hint,
            this.props.problemID,
            this.props.step,
            this.props.seed
        );

        if (cached) {
            hint.audios = cached.audioData;
            console.log(`Audio loaded from ${cached.source} cache`);
            return;
        }

        // 缓存未命中，请求音频
        this.setState({ isLoading: true });

        const response = await axios.post(
            TTS_ENDPOINT,  // 可配置的端点
            {
                segments: hint.pacedSpeech,
                problemID: this.props.problemID,
                stepID: this.props.step,
                hintID: hint.id
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const audioData = response.data.audios || 
                         JSON.parse(response.data.body).audios;

        // 写入所有缓存层
        await ttsCacheManager.setAudio(
            hint,
            this.props.problemID,
            this.props.step,
            this.props.seed,
            audioData
        );

        hint.audios = audioData;
        this.setState({ isLoading: false });

    } catch (error) {
        console.error("Error fetching audio:", error);
        this.setState({ isLoading: false });
        
        // 错误处理：可以显示错误提示或使用回退方案
        throw error;
    }
};
```

---

## 六、缓存策略和优化

### 6.1 缓存策略

#### 写入策略
- **Write-Through**：同时写入所有缓存层
- **Write-Back**：先写入会话内缓存，异步写入其他层

#### 读取策略
- **Cache-Aside**：先检查缓存，未命中则从 API 获取并写入缓存

#### 失效策略
- **TTL（Time To Live）**：基于时间的失效
  - 会话内缓存：会话结束
  - 浏览器缓存：7天
  - 服务器端缓存：30天

- **版本控制**：内容版本变化时失效
  - 如果 `pacedSpeech` 内容变化，缓存失效

### 6.2 性能优化

#### 1. 预加载策略
```javascript
// 预加载下一个提示的音频
preloadNextHint = async (currentIndex, hints) => {
    if (currentIndex + 1 < hints.length) {
        const nextHint = hints[currentIndex + 1];
        // 低优先级预取
        ttsCacheManager.getAudio(
            nextHint,
            this.props.problemID,
            this.props.step,
            this.props.seed
        ).catch(() => {});  // 静默失败
    }
};
```

#### 2. 批量请求
```javascript
// 批量请求多个提示的音频
batchFetchAudio = async (hints) => {
    const requests = hints.map(hint => 
        ttsCacheManager.getAudio(hint, ...)
    );
    
    await Promise.allSettled(requests);
};
```

#### 3. 压缩存储
```javascript
// 压缩音频数据（如果需要）
function compressAudioData(audioData) {
    // 可以压缩 base64 数据
    // 或使用更高效的编码
}
```

---

## 七、缓存监控和统计

### 7.1 缓存统计

```javascript
// src/util/ttsCacheStats.js

class CacheStats {
    constructor() {
        this.stats = {
            hits: {
                session: 0,
                browser: 0,
                server: 0
            },
            misses: 0,
            errors: 0,
            totalRequests: 0
        };
    }

    recordHit(source) {
        this.stats.hits[source]++;
        this.stats.totalRequests++;
    }

    recordMiss() {
        this.stats.misses++;
        this.stats.totalRequests++;
    }

    recordError() {
        this.stats.errors++;
    }

    getHitRate() {
        const totalHits = Object.values(this.stats.hits).reduce((a, b) => a + b, 0);
        return this.stats.totalRequests > 0 
            ? (totalHits / this.stats.totalRequests) * 100 
            : 0;
    }

    getStats() {
        return {
            ...this.stats,
            hitRate: this.getHitRate()
        };
    }

    reset() {
        this.stats = {
            hits: { session: 0, browser: 0, server: 0 },
            misses: 0,
            errors: 0,
            totalRequests: 0
        };
    }
}

export const cacheStats = new CacheStats();
```

### 7.2 集成统计

```javascript
// 在 ttsCacheManager 中
async getAudio(...) {
    const cached = await sessionCache.get(cacheKey);
    if (cached) {
        cacheStats.recordHit('session');
        return { audioData: cached, source: 'session' };
    }
    
    // ...
    
    cacheStats.recordMiss();
    return null;
}
```

---

## 八、错误处理和回退

### 8.1 缓存错误处理

```javascript
// 缓存操作应该优雅降级
async getAudio(...) {
    try {
        // 尝试从缓存获取
        return await this._getFromCache(...);
    } catch (error) {
        console.error('Cache error:', error);
        // 缓存失败不影响主流程
        return null;
    }
}
```

### 8.2 回退策略

```javascript
// 如果所有缓存都失败，直接请求 API
fetchAudioData = async (hint) => {
    try {
        // 尝试从缓存获取
        const cached = await ttsCacheManager.getAudio(...);
        if (cached) return;
    } catch (error) {
        console.warn('Cache failed, falling back to API');
    }

    // 回退到直接 API 请求
    const audioData = await fetchFromAPI(...);
    // ...
};
```

---

## 九、实施步骤

### 步骤 1：创建缓存工具模块

1. 创建 `src/util/ttsCache.js`
   - SessionCache 类
   - BrowserCache 类

2. 创建 `src/util/ttsCacheManager.js`
   - 统一缓存管理器

3. 创建 `src/util/ttsUtils.js`
   - 缓存键生成函数
   - 工具函数

### 步骤 2：集成到 HintSystem

1. 修改 `fetchAudioData` 方法
2. 集成缓存检查
3. 添加错误处理

### 步骤 3：后端缓存（可选）

1. 创建 `src/tts-server/services/cache.js`
2. 集成到 TTS 路由
3. 配置 Redis 或文件系统

### 步骤 4：测试和优化

1. 测试缓存命中率
2. 性能测试
3. 错误处理测试
4. 优化缓存策略

---

## 十、预期效果

### 性能提升

- **缓存命中率**：预计 > 80%
- **加载时间**：
  - 会话内缓存：< 10ms
  - 浏览器缓存：< 50ms
  - 服务器端缓存：< 200ms
  - API 请求：> 1000ms

### 成本降低

- **API 调用减少**：80%+
- **带宽使用减少**：70%+
- **服务器负载降低**：60%+

### 用户体验

- **更快的加载速度**
- **离线支持**（浏览器缓存）
- **更流畅的播放体验**

---

## 十一、总结

### 三层缓存架构

1. **会话内缓存**：最快，但生命周期短
2. **浏览器缓存**：跨会话，大容量
3. **服务器端缓存**：跨用户共享，减少 API 调用

### 关键特性

- ✅ 智能缓存键生成
- ✅ 自动缓存管理
- ✅ LRU 淘汰策略
- ✅ TTL 失效机制
- ✅ 错误处理和回退
- ✅ 性能监控和统计

### 实施优先级

1. **高优先级**：会话内缓存 + 浏览器缓存
2. **中优先级**：服务器端缓存
3. **低优先级**：高级优化（预加载、压缩等）

---

**这个设计提供了一个完整、高效、可扩展的缓存系统，可以显著提升性能和降低成本。**




