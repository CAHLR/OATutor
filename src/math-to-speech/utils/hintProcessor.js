const crypto = require('crypto');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * 生成text的hash值
 */
function hashText(text) {
    return crypto.createHash('md5').update(text || '').digest('hex');
}

/**
 * 清理语音文本
 */
function cleanSpeech(speech) {
    if (!speech) return '';
    
    let cleaned = speech
        .replace(/StartFraction/g, '')
        .replace(/EndFraction/g, '')
        .replace(/StartLayout/g, '')
        .replace(/EndLayout/g, '')
        .replace(/StartRoot/g, '')
        .replace(/EndRoot/g, '');
    
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
}

/**
 * 将LaTeX转换为MathML（使用latex2mathml）
 */
function latexToMathML(latex) {
    try {
        let latex2mathml;
        try {
            latex2mathml = require('latex2mathml');
        } catch (requireError) {
            console.warn('latex2mathml package not found. Install it with: npm install latex2mathml');
            return null;
        }
        
        const mathml = latex2mathml.convert(latex.trim());
        return mathml;
    } catch (error) {
        console.warn(`LaTeX to MathML conversion failed for: ${latex}`, error.message);
        return null;
    }
}

/**
 * 批量转换MathML到语音（使用sreNode.js）
 */
function batchMathMLToSpeech(mathmlList) {
    return new Promise((resolve, reject) => {
        if (!mathmlList || mathmlList.length === 0) {
            resolve([]);
            return;
        }

        const sreNodePath = path.join(__dirname, '../scripts/sreNode.js');
        
        const sreNode = spawn('node', [sreNodePath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        let errorOutput = '';
        
        sreNode.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        sreNode.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        sreNode.on('error', (error) => {
            reject(new Error(`Failed to spawn sreNode: ${error.message}`));
        });
        
        sreNode.on('close', (code) => {
            if (code === 0) {
                try {
                    const results = JSON.parse(output);
                    resolve(results.map(cleanSpeech));
                } catch (error) {
                    reject(new Error(`Failed to parse sreNode output: ${error.message}`));
                }
            } else {
                reject(new Error(`sreNode exited with code ${code}: ${errorOutput}`));
            }
        });
        
        try {
            sreNode.stdin.write(JSON.stringify(mathmlList));
            sreNode.stdin.end();
        } catch (error) {
            reject(new Error(`Failed to write to sreNode: ${error.message}`));
        }
    });
}

/**
 * 将LaTeX转换为语音文本
 */
async function latexToSpeech(latex) {
    if (!latex || !latex.trim()) {
        return '';
    }
    
    try {
        const mathml = latexToMathML(latex);
        if (!mathml) {
            return latex;
        }
        
        const speechList = await batchMathMLToSpeech([mathml]);
        if (!speechList || speechList.length === 0) {
            return latex;
        }
        
        return speechList[0] || latex;
    } catch (error) {
        console.warn(`LaTeX to speech conversion failed for: ${latex}`, error.message);
        return latex;
    }
}

/**
 * 生成pacedSpeech数组
 */
async function generatePacedSpeech(text) {
    if (!text) {
        return [''];
    }
    
    const parts = [];
    const mathRegex = /\$\$(.*?)\$\$/g;
    
    let lastIndex = 0;
    let match;
    const latexExpressions = [];
    const latexPositions = [];
    
    while ((match = mathRegex.exec(text)) !== null) {
        latexExpressions.push(match[1]);
        latexPositions.push({
            start: match.index,
            end: match.index + match[0].length,
            latex: match[1]
        });
    }
    
    if (latexExpressions.length === 0) {
        return text.trim() ? [text.trim()] : [''];
    }
    
    const mathmlList = latexExpressions.map(latex => latexToMathML(latex));
    const validMathml = mathmlList.filter(m => m !== null && m !== undefined);
    
    let speechList = [];
    if (validMathml.length > 0) {
        try {
            speechList = await batchMathMLToSpeech(validMathml);
        } catch (error) {
            console.warn('Batch conversion failed, falling back to individual conversion', error.message);
            speechList = await Promise.all(
                validMathml.map(async (mathml) => {
                    try {
                        const results = await batchMathMLToSpeech([mathml]);
                        return results[0] || '';
                    } catch (e) {
                        return '';
                    }
                })
            );
        }
    }
    
    let validMathmlIndex = 0;
    for (let i = 0; i < latexPositions.length; i++) {
        const pos = latexPositions[i];
        
        if (pos.start > lastIndex) {
            const textPart = text.substring(lastIndex, pos.start).trim();
            if (textPart) {
                parts.push(textPart);
            }
        }
        
        if (mathmlList[i] !== null && mathmlList[i] !== undefined) {
            const speech = speechList[validMathmlIndex] || pos.latex;
            if (speech) {
                parts.push(speech);
            }
            validMathmlIndex++;
        } else {
            parts.push(pos.latex);
        }
        
        lastIndex = pos.end;
    }
    
    if (lastIndex < text.length) {
        const remaining = text.substring(lastIndex).trim();
        if (remaining) {
            parts.push(remaining);
        }
    }
    
    return parts.length > 0 ? parts : [text.trim() || ''];
}

/**
 * 判断是否需要处理hint
 */
function shouldProcessHint(hint, options = {}) {
    const { force = false, stateMap = null } = options;
    
    if (force) {
        return { shouldProcess: true, reason: 'force' };
    }
    
    if (!hint.text) {
        return { shouldProcess: false, reason: 'no-text' };
    }
    
    const currentHash = hashText(hint.text);
    
    if (!hint.pacedSpeech || !Array.isArray(hint.pacedSpeech) || hint.pacedSpeech.length === 0) {
        return { shouldProcess: true, reason: 'missing', hash: currentHash };
    }
    
    if (stateMap) {
        const storedHash = stateMap.get(hint.id);
        if (storedHash && storedHash !== currentHash) {
            return { shouldProcess: true, reason: 'changed', hash: currentHash };
        }
        if (!storedHash) {
            return { shouldProcess: true, reason: 'no-state', hash: currentHash };
        }
    } else {
        return { shouldProcess: true, reason: 'no-state-check', hash: currentHash };
    }
    
    return { shouldProcess: false, reason: 'up-to-date', hash: currentHash };
}

/**
 * 处理单个hint
 */
async function processHint(hint, options = {}) {
    try {
        const pacedSpeech = await generatePacedSpeech(hint.text);
        return {
            ...hint,
            pacedSpeech: pacedSpeech
        };
    } catch (error) {
        console.error(`Failed to process hint ${hint.id}:`, error.message);
        throw error;
    }
}

/**
 * 加载状态文件
 */
function loadStateFile(stateFilePath) {
    const stateMap = new Map();
    
    if (fs.existsSync(stateFilePath)) {
        try {
            const data = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
            Object.entries(data).forEach(([id, hash]) => {
                stateMap.set(id, hash);
            });
        } catch (error) {
            console.warn(`Failed to load state file: ${error.message}`);
        }
    }
    
    return stateMap;
}

/**
 * 保存状态文件
 */
function saveStateFile(stateFilePath, stateMap) {
    try {
        const data = Object.fromEntries(stateMap);
        fs.writeFileSync(stateFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.warn(`Failed to save state file: ${error.message}`);
    }
}

module.exports = {
    hashText,
    generatePacedSpeech,
    shouldProcessHint,
    processHint,
    loadStateFile,
    saveStateFile,
    latexToSpeech
};

