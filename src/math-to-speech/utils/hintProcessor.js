const crypto = require('crypto');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 全局标志，避免重复警告
let latex2mathmlWarningShown = false;

/**
 * 生成text的hash值
 */
function hashText(text) {
    return crypto.createHash('md5').update(text || '').digest('hex');
}

/**
 * 清理语音文本，使其更适合Whisper TTS
 * 移除SRE的描述性文本，转换为自然语言
 * 让Whisper自己处理语速和语调
 */
function cleanSpeech(speech) {
    if (!speech || typeof speech !== 'string') return '';
    
    let cleaned = speech;
    
    // 移除SRE的结构标记
    cleaned = cleaned
        .replace(/StartFraction/g, '')
        .replace(/EndFraction/g, '')
        .replace(/StartLayout/g, '')
        .replace(/EndLayout/g, '')
        .replace(/StartRoot/g, '')
        .replace(/EndRoot/g, '');
    
    // 移除描述性括号文本 - 让Whisper自然处理
    // "open paren" 和 "close paren" 直接去掉，Whisper会根据上下文自然表达
    cleaned = cleaned
        .replace(/\bopen paren\b/gi, '')
        .replace(/\bclose paren\b/gi, '')
        .replace(/\bopen parenthesis\b/gi, '')
        .replace(/\bclose parenthesis\b/gi, '')
        .replace(/\bparentheses\b/gi, '')
        .replace(/\bparenthesis\b/gi, '');
    
    // 将"comma"转换为实际逗号，Whisper会自然停顿
    cleaned = cleaned.replace(/\bcomma\b/gi, ',');
    
    // 移除多余的"times,"（SRE有时会输出"times,"而不是"times"）
    cleaned = cleaned.replace(/\btimes,\s*/gi, ' times ');
    
    // 处理负数：将"negative"转换为"minus"，让Whisper自然处理
    // SRE输出"negative 9 h"应该转换为"minus 9 h"
    // 匹配各种模式：negative 9, negative 9 h, negative 15 h等
    // 需要先处理带变量的情况，再处理不带变量的
    cleaned = cleaned
        .replace(/\bnegative\s+(\d+(?:\.\d+)?)\s+([a-z])\b/gi, 'minus $1 $2')
        .replace(/\bnegative\s+(\d+(?:\.\d+)?)\b/gi, 'minus $1')
        .replace(/\bnegative\s+/gi, 'minus ');
    
    // 优化数学表达，使其更自然
    cleaned = cleaned
        .replace(/\bwith numerator\b/gi, '')
        .replace(/\band denominator\b/gi, ' over ')
        .replace(/\braised to the\b/gi, ' to the ')
        .replace(/\bpower\b/gi, '')
        .replace(/\btimes\b/gi, ' times ')
        .replace(/\bplus\b/gi, ' plus ')
        .replace(/\bminus\b/gi, ' minus ')
        .replace(/\bequals\b/gi, ' equals ')
        .replace(/\bis equal to\b/gi, ' equals ')
        .replace(/\bof\s+x\b/gi, ' of x')
        .replace(/\bof\s+t\b/gi, ' of t');
    
    // 移除多余的描述性文本和标点
    cleaned = cleaned
        .replace(/\s*,\s*,\s*/g, ', ')  // 多个逗号合并为一个
        .replace(/\s+,\s+/g, ', ')      // 逗号前后的多余空格
        .replace(/,\s*$/g, '')          // 移除句尾的逗号
        .replace(/^\s*,\s*/g, '');      // 移除句首的逗号
    
    // 移除其他描述性文本
    cleaned = cleaned
        .replace(/\bstart of fraction\b/gi, '')
        .replace(/\bend of fraction\b/gi, '')
        .replace(/\bstart of layout\b/gi, '')
        .replace(/\bend of layout\b/gi, '')
        .replace(/\bstart of root\b/gi, '')
        .replace(/\bend of root\b/gi, '');
    
    // 清理多余的空白
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // 移除不可见字符
    cleaned = cleaned
        .replace(/\u200B/g, '')
        .replace(/\u200C/g, '')
        .replace(/\u200D/g, '')
        .replace(/\uFEFF/g, '');
    
    // 最终清理：移除多余的标点空格
    cleaned = cleaned
        .replace(/\s*,\s*/g, ', ')
        .replace(/\s*\.\s*/g, '. ')
        .replace(/\s+/g, ' ')
        .trim();
    
    return cleaned;
}

/**
 * 批量将LaTeX转换为MathML（使用Python脚本）
 */
function batchLatexToMathML(latexList) {
    return new Promise((resolve, reject) => {
        if (!latexList || latexList.length === 0) {
            resolve([]);
            return;
        }

        const pythonScriptPath = path.join(__dirname, '../scripts/latexToMathML.py');
        
        const pythonProcess = spawn('python', [pythonScriptPath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        let errorOutput = '';
        
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        pythonProcess.on('error', (error) => {
            if (!latex2mathmlWarningShown) {
                console.warn('⚠️  Failed to spawn Python for LaTeX conversion:', error.message);
                console.warn('   LaTeX expressions will be used as-is without conversion to MathML.\n');
                latex2mathmlWarningShown = true;
            }
            resolve(latexList.map(() => null));
        });
        
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const results = JSON.parse(output);
                    resolve(results);
                } catch (error) {
                    if (!latex2mathmlWarningShown) {
                        console.warn('⚠️  Failed to parse Python output for LaTeX conversion');
                        latex2mathmlWarningShown = true;
                    }
                    resolve(latexList.map(() => null));
                }
            } else {
                if (!latex2mathmlWarningShown) {
                    console.warn('⚠️  Python LaTeX converter exited with code', code);
                    if (errorOutput) {
                        console.warn('   Error:', errorOutput.trim());
                    }
                    latex2mathmlWarningShown = true;
                }
                resolve(latexList.map(() => null));
            }
        });
        
        try {
            pythonProcess.stdin.write(JSON.stringify(latexList));
            pythonProcess.stdin.end();
        } catch (error) {
            resolve(latexList.map(() => null));
        }
    });
}

/**
 * 将单个LaTeX转换为MathML（内部使用批量转换）
 */
async function latexToMathML(latex) {
    if (!latex || !latex.trim()) {
        return null;
    }
    
    const results = await batchLatexToMathML([latex]);
    return results[0] || null;
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
        const mathml = await latexToMathML(latex);
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
 * 生成pacedSpeech字符串（单个字符串，让Whisper自己处理语速）
 * 返回数组格式以保持向后兼容，但数组只包含一个元素
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
        // 没有LaTeX，直接返回清理后的文本
        const cleaned = text.trim().replace(/\s+/g, ' ');
        return cleaned ? [cleaned] : [''];
    }
    
    // 批量转换所有LaTeX表达式到MathML
    const mathmlList = await batchLatexToMathML(latexExpressions);
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
                // 清理文本段，移除多余的标点和空白
                let cleanedText = textPart.replace(/\s+/g, ' ').trim();
                
                // 处理文本中的减号：如果减号前后都是空白，转换为"minus"
                cleanedText = cleanedText.replace(/\s+-\s+/g, ' minus ');
                
                if (cleanedText) {
                    parts.push(cleanedText);
                }
            }
        }
        
        if (mathmlList[i] !== null && mathmlList[i] !== undefined) {
            if (validMathmlIndex < speechList.length) {
                const speech = speechList[validMathmlIndex];
                if (speech && speech.trim()) {
                    // 清理后的speech已经通过cleanSpeech处理
                    // 但需要再次确保清理，因为cleanSpeech在batchMathMLToSpeech中调用
                    const cleanedSpeech = cleanSpeech(speech.trim());
                    if (cleanedSpeech) {
                        parts.push(cleanedSpeech);
                    }
                }
            }
            validMathmlIndex++;
        } else {
            // MathML转换失败，跳过这个LaTeX表达式
            // 不添加原始LaTeX，避免产生奇怪的声音
        }
        
        lastIndex = pos.end;
    }
    
    if (lastIndex < text.length) {
        const remaining = text.substring(lastIndex).trim();
        if (remaining) {
            const cleanedRemaining = remaining.replace(/\s+/g, ' ').trim();
            if (cleanedRemaining) {
                parts.push(cleanedRemaining);
            }
        }
    }
    
    // 过滤掉空字符串和只有空格的字符串
    let filteredParts = parts
        .map(p => p && typeof p === 'string' ? p.trim() : '')
        .filter(p => p.length > 0);
    
    // 后处理：优化文本段之间的连接，准备合并为单个字符串
    filteredParts = filteredParts.map((part, index, array) => {
        // 移除段首段尾的多余空白和标点
        let cleaned = part.replace(/^[\s,\.]+/, '').replace(/[\s,\.]+$/, '');
        
        // 确保段与段之间的连接自然
        // 如果前一段以标点结尾，当前段以标点开头，移除当前段的标点
        if (index > 0) {
            const prevPart = array[index - 1];
            if (prevPart && /[.,;:]$/.test(prevPart.trim())) {
                cleaned = cleaned.replace(/^[\s,\.]+/, '');
            }
        }
        
        return cleaned.trim();
    }).filter(p => p.length > 0);
    
    // 如果所有部分都被过滤掉了，返回原始文本
    if (filteredParts.length === 0) {
        const cleaned = text.trim().replace(/\s+/g, ' ');
        return cleaned ? [cleaned] : [''];
    }
    
    // 合并所有部分为单个字符串，让Whisper自己处理语速
    // 在段之间添加适当的空格，确保自然连接
    let finalText = '';
    for (let i = 0; i < filteredParts.length; i++) {
        const part = filteredParts[i];
        if (i > 0) {
            // 检查是否需要添加空格
            const prevPart = filteredParts[i - 1];
            // 如果前一段以字母/数字结尾，当前段以字母/数字开头，添加空格
            if (prevPart && /[a-zA-Z0-9]$/.test(prevPart) && /^[a-zA-Z0-9]/.test(part)) {
                finalText += ' ';
            }
            // 如果前一段以标点结尾，通常不需要额外空格（标点后已有空格）
            else if (prevPart && /[.,;:!?]$/.test(prevPart)) {
                // 标点后通常已有空格，但确保有一个空格
                if (!finalText.endsWith(' ')) {
                    finalText += ' ';
                }
            }
        }
        finalText += part;
    }
    
    // 最终清理：确保只有一个空格，移除多余空白
    finalText = finalText.replace(/\s+/g, ' ').trim();
    
    // 返回数组格式以保持向后兼容，但只包含一个元素
    return finalText ? [finalText] : [''];
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

/**
 * Check if a step needs to be processed
 */
function shouldProcessStep(step, options = {}) {
    const { force = false, stateMap = null } = options;
    
    if (force) {
        return { shouldProcess: true, reason: 'force' };
    }
    
    // Combine stepTitle and stepBody for hash
    const text = (step.stepTitle || '') + ' ' + (step.stepBody || '');
    if (!text.trim()) {
        return { shouldProcess: false, reason: 'no-text' };
    }
    
    const currentHash = hashText(text);
    const key = `step:${step.id}`;
    
    if (!step.pacedSpeech || !Array.isArray(step.pacedSpeech) || step.pacedSpeech.length === 0) {
        return { shouldProcess: true, reason: 'missing', hash: currentHash, key };
    }
    
    if (stateMap) {
        const storedHash = stateMap.get(key);
        if (storedHash && storedHash !== currentHash) {
            return { shouldProcess: true, reason: 'changed', hash: currentHash, key };
        }
        if (!storedHash) {
            return { shouldProcess: true, reason: 'no-state', hash: currentHash, key };
        }
    } else {
        return { shouldProcess: true, reason: 'no-state-check', hash: currentHash, key };
    }
    
    return { shouldProcess: false, reason: 'up-to-date', hash: currentHash, key };
}

/**
 * Process a single step
 */
async function processStep(step, options = {}) {
    try {
        // Combine stepTitle and stepBody
        const text = (step.stepTitle || '') + (step.stepTitle && step.stepBody ? ' ' : '') + (step.stepBody || '');
        if (!text.trim()) {
            return step;
        }
        
        const pacedSpeech = await generatePacedSpeech(text);
        return {
            ...step,
            pacedSpeech: pacedSpeech
        };
    } catch (error) {
        console.error(`Failed to process step ${step.id}:`, error.message);
        throw error;
    }
}

/**
 * Check if a problem needs to be processed
 */
function shouldProcessProblem(problem, options = {}) {
    const { force = false, stateMap = null } = options;
    
    if (force) {
        return { shouldProcess: true, reason: 'force' };
    }
    
    // Use problem.body for hash (problem.title is usually short)
    const text = problem.body || '';
    if (!text.trim()) {
        return { shouldProcess: false, reason: 'no-text' };
    }
    
    const currentHash = hashText(text);
    const key = `problem:${problem.id}`;
    
    if (!problem.pacedSpeech || !Array.isArray(problem.pacedSpeech) || problem.pacedSpeech.length === 0) {
        return { shouldProcess: true, reason: 'missing', hash: currentHash, key };
    }
    
    if (stateMap) {
        const storedHash = stateMap.get(key);
        if (storedHash && storedHash !== currentHash) {
            return { shouldProcess: true, reason: 'changed', hash: currentHash, key };
        }
        if (!storedHash) {
            return { shouldProcess: true, reason: 'no-state', hash: currentHash, key };
        }
    } else {
        return { shouldProcess: true, reason: 'no-state-check', hash: currentHash, key };
    }
    
    return { shouldProcess: false, reason: 'up-to-date', hash: currentHash, key };
}

/**
 * Process a single problem
 */
async function processProblem(problem, options = {}) {
    try {
        const text = problem.body || '';
        if (!text.trim()) {
            return problem;
        }
        
        const pacedSpeech = await generatePacedSpeech(text);
        return {
            ...problem,
            pacedSpeech: pacedSpeech
        };
    } catch (error) {
        console.error(`Failed to process problem ${problem.id}:`, error.message);
        throw error;
    }
}

module.exports = {
    hashText,
    generatePacedSpeech,
    shouldProcessHint,
    processHint,
    shouldProcessStep,
    processStep,
    shouldProcessProblem,
    processProblem,
    loadStateFile,
    saveStateFile,
    latexToSpeech
};

