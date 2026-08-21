const crypto = require('crypto');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// --- Persistent worker process pools ---
// Both Python and SRE use round-robin pools for parallelism.

const PYTHON_POOL_SIZE = 4;
let _pythonPool = [];    // [{ proc, rl, callbacks[] }, ...]
let _pythonPoolIndex = 0;

function initPythonPool() {
    const scriptPath = path.join(__dirname, '../scripts/latexToMathML.py');
    for (let i = 0; i < PYTHON_POOL_SIZE; i++) {
        const slot = { proc: null, rl: null, callbacks: [] };

        slot.proc = spawn('python', [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });

        slot.proc.on('error', (err) => {
            console.warn('⚠️  Failed to spawn Python:', err.message);
            for (const cb of slot.callbacks) cb(null);
            slot.callbacks = [];
        });

        slot.proc.on('close', () => {
            for (const cb of slot.callbacks) cb(null);
            slot.callbacks = [];
        });

        slot.rl = readline.createInterface({ input: slot.proc.stdout });
        slot.rl.on('line', (line) => {
            const cb = slot.callbacks.shift();
            if (!cb) return;
            try { cb(JSON.parse(line)); }
            catch (e) { cb(null); }
        });

        _pythonPool.push(slot);
    }
}

const SRE_POOL_SIZE = 8;
let _srePool = [];       // [{ proc, rl, callbacks[] }, ...]
let _srePoolIndex = 0;   // round-robin counter

function initSREPool() {
    const scriptPath = path.join(__dirname, '../scripts/sreNode.js');
    for (let i = 0; i < SRE_POOL_SIZE; i++) {
        const slot = { proc: null, rl: null, callbacks: [] };

        slot.proc = spawn('node', [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });

        slot.proc.on('error', (err) => {
            const error = new Error(`sreNode error: ${err.message}`);
            for (const cb of slot.callbacks) cb(error, null);
            slot.callbacks = [];
        });

        slot.proc.on('close', () => {
            for (const cb of slot.callbacks) cb(new Error('sreNode closed'), null);
            slot.callbacks = [];
        });

        slot.rl = readline.createInterface({ input: slot.proc.stdout });
        slot.rl.on('line', (line) => {
            const cb = slot.callbacks.shift();
            if (!cb) return;
            try { cb(null, JSON.parse(line)); }
            catch (e) { cb(new Error('parse error'), null); }
        });

        _srePool.push(slot);
    }
}

function shutdownWorkers() {
    for (const slot of _pythonPool) {
        try { slot.proc.stdin.end(); } catch (e) {}
    }
    _pythonPool = [];
    _pythonPoolIndex = 0;
    for (const slot of _srePool) {
        try { slot.proc.stdin.end(); } catch (e) {}
    }
    _srePool = [];
    _srePoolIndex = 0;
}

function hashText(text) {
    return crypto.createHash('md5').update(text || '').digest('hex');
}

/**
 * Post-process SRE output into natural speech for Whisper TTS.
 * Removes structural markers, normalizes notation, cleans whitespace.
 */
function cleanSpeech(speech) {
    if (!speech || typeof speech !== 'string') return '';

    let cleaned = speech;

    // Remove SRE structural markers
    cleaned = cleaned
        .replace(/StartFraction/g, '')
        .replace(/EndFraction/g, '')
        .replace(/StartLayout/g, '')
        .replace(/EndLayout/g, '')
        .replace(/StartRoot/g, '')
        .replace(/EndRoot/g, '')
        .replace(/StartAbsoluteValue/g, '')
        .replace(/EndAbsoluteValue/g, '');

    // Remove paren descriptors
    cleaned = cleaned
        .replace(/\bopen paren\b/gi, '')
        .replace(/\bclose paren\b/gi, '')
        .replace(/\bopen parenthesis\b/gi, '')
        .replace(/\bclose parenthesis\b/gi, '')
        .replace(/\bparentheses\b/gi, '')
        .replace(/\bparenthesis\b/gi, '');

    // Convert "comma" to actual comma
    cleaned = cleaned.replace(/\bcomma\b/gi, ',');

    cleaned = cleaned.replace(/\btimes,\s*/gi, ' times ');

    // "negative" -> "minus"
    cleaned = cleaned
        .replace(/\bnegative\s+(\d+(?:\.\d+)?)\s+([a-z])\b/gi, 'minus $1 $2')
        .replace(/\bnegative\s+(\d+(?:\.\d+)?)\b/gi, 'minus $1')
        .replace(/\bnegative\s+/gi, 'minus ');

    // Fix "l n" -> "ln"
    cleaned = cleaned.replace(/\bl\s+n\s+of\b/gi, 'ln of');
    cleaned = cleaned.replace(/\bl\s+n\s+(\w)/gi, 'ln $1');

    // Fix decimal spacing: "3. 14" -> "3.14"
    cleaned = cleaned.replace(/(\d+)\.\s+(\d+)/g, '$1.$2');

    // Fix duplicate descriptions
    cleaned = cleaned.replace(/\bthe\s+square\s+root\s+is\s+the\s+square\s+root\s+of\b/gi, 'the square root of');
    cleaned = cleaned.replace(/\bis\s+the\s+square\s+root\s+of\b/gi, 'is the square root of');
    cleaned = cleaned.replace(/\bthe\s+absolute\s+value\s+is\s+the\s+absolute\s+value\s+of\b/gi, 'the absolute value of');
    cleaned = cleaned.replace(/\bis\s+the\s+absolute\s+value\s+of\b/gi, 'is the absolute value of');

    // Normalize math operators
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

    // Clean up commas
    cleaned = cleaned
        .replace(/\s*,\s*,\s*/g, ', ')
        .replace(/\s+,\s+/g, ', ')
        .replace(/,\s*$/g, '')
        .replace(/^\s*,\s*/g, '');

    // Remove remaining SRE exponent markers
    cleaned = cleaned
        .replace(/\bstart of fraction\b/gi, '')
        .replace(/\bend of fraction\b/gi, '')
        .replace(/\bstart of layout\b/gi, '')
        .replace(/\bend of layout\b/gi, '')
        .replace(/\bstart of root\b/gi, '')
        .replace(/\bend of root\b/gi, '')
        .replace(/\bend exponent\b/gi, '')
        .replace(/\bbegin exponent\b/gi, '');

    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // Remove zero-width characters
    cleaned = cleaned
        .replace(/\u200B/g, '')
        .replace(/\u200C/g, '')
        .replace(/\u200D/g, '')
        .replace(/\uFEFF/g, '');

    cleaned = cleaned
        .replace(/\s*,\s*/g, ', ')
        .replace(/\s*\.\s*/g, '. ')
        .replace(/\s+/g, ' ')
        .trim();

    // Re-fix decimals broken by the period cleanup above
    cleaned = cleaned.replace(/(\d+)\.\s+(\d+)/g, '$1.$2');

    return cleaned;
}

/**
 * Batch convert LaTeX strings to MathML via Python process pool (round-robin).
 */
function batchLatexToMathML(latexList) {
    return new Promise((resolve) => {
        if (!latexList || latexList.length === 0) { resolve([]); return; }

        if (_pythonPool.length === 0) initPythonPool();

        const slot = _pythonPool[_pythonPoolIndex++ % PYTHON_POOL_SIZE];

        slot.callbacks.push((result) => {
            resolve(result || latexList.map(() => null));
        });

        try {
            slot.proc.stdin.write(JSON.stringify(latexList) + '\n');
        } catch (e) {
            slot.callbacks.pop();
            resolve(latexList.map(() => null));
        }
    });
}

/**
 * Batch convert MathML strings to speech text via SRE process pool (round-robin).
 */
function batchMathMLToSpeech(mathmlList) {
    return new Promise((resolve, reject) => {
        if (!mathmlList || mathmlList.length === 0) { resolve([]); return; }

        if (_srePool.length === 0) initSREPool();

        const slot = _srePool[_srePoolIndex++ % SRE_POOL_SIZE];

        slot.callbacks.push((err, result) => {
            if (err) { reject(err); return; }
            resolve(result.map(cleanSpeech));
        });

        try {
            slot.proc.stdin.write(JSON.stringify(mathmlList) + '\n');
        } catch (e) {
            slot.callbacks.pop();
            reject(new Error(`Failed to write to sreNode: ${e.message}`));
        }
    });
}

async function latexToSpeech(latex) {
    if (!latex || !latex.trim()) return '';

    try {
        const mathml = (await batchLatexToMathML([latex]))[0];
        if (!mathml) return latex;
        const speechList = await batchMathMLToSpeech([mathml]);
        return (speechList && speechList[0]) || latex;
    } catch (error) {
        console.warn(`LaTeX to speech conversion failed for: ${latex}`, error.message);
        return latex;
    }
}

/**
 * Convert a text string (with $$...$$ LaTeX blocks) to a speech string.
 * Returns a single-element array for compatibility with the pacedSpeech field format.
 */
async function generatePacedSpeech(text) {
    if (!text) return [''];

    const parts = [];
    const mathRegex = /\$\$(.*?)\$\$/g;
    const latexExpressions = [];
    const latexPositions = [];
    let lastIndex = 0;
    let match;

    while ((match = mathRegex.exec(text)) !== null) {
        latexExpressions.push(match[1]);
        latexPositions.push({ start: match.index, end: match.index + match[0].length });
    }

    if (latexExpressions.length === 0) {
        const cleaned = text.trim().replace(/\s+/g, ' ');
        return cleaned ? [cleaned] : [''];
    }

    // Batch convert all LaTeX in this text at once
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
                    try { return (await batchMathMLToSpeech([mathml]))[0] || ''; }
                    catch (e) { return ''; }
                })
            );
        }
    }

    let validMathmlIndex = 0;
    for (let i = 0; i < latexPositions.length; i++) {
        const pos = latexPositions[i];

        if (pos.start > lastIndex) {
            const textPart = text.substring(lastIndex, pos.start).trim().replace(/\s+/g, ' ');
            if (textPart) parts.push(textPart.replace(/\s+-\s+/g, ' minus '));
        }

        if (mathmlList[i] !== null && mathmlList[i] !== undefined) {
            if (validMathmlIndex < speechList.length) {
                const cleaned = cleanSpeech(speechList[validMathmlIndex].trim());
                if (cleaned) parts.push(cleaned);
            }
            validMathmlIndex++;
        }

        lastIndex = pos.end;
    }

    if (lastIndex < text.length) {
        const remaining = text.substring(lastIndex).trim().replace(/\s+/g, ' ');
        if (remaining) parts.push(remaining);
    }

    // Normalize segment boundaries
    let filteredParts = parts
        .map(p => p && typeof p === 'string' ? p.replace(/^[\s,.]+/, '').replace(/[\s,.]+$/, '').trim() : '')
        .filter(p => p.length > 0);

    if (filteredParts.length === 0) {
        const cleaned = text.trim().replace(/\s+/g, ' ');
        return cleaned ? [cleaned] : [''];
    }

    // Join segments with appropriate spacing
    let finalText = '';
    for (let i = 0; i < filteredParts.length; i++) {
        const part = filteredParts[i];
        if (i > 0) {
            const prev = filteredParts[i - 1];
            if (/[a-zA-Z0-9]$/.test(prev) && /^[a-zA-Z0-9]/.test(part)) {
                finalText += ' ';
            } else if (/[.,;:!?]$/.test(prev) && !finalText.endsWith(' ')) {
                finalText += ' ';
            }
        }
        finalText += part;
    }

    finalText = finalText.replace(/\s+/g, ' ').trim();
    finalText = finalText.replace(/\bthe\s+absolute\s+value\s+is\s+the\s+absolute\s+value\s+of\b/gi, 'the absolute value of');
    finalText = finalText.replace(/\bthe\s+square\s+root\s+is\s+the\s+square\s+root\s+of\b/gi, 'the square root of');

    return finalText ? [finalText] : [''];
}

function shouldProcessHint(hint, options = {}) {
    const { force = false, stateMap = null } = options;
    if (!hint.text) return { shouldProcess: false, reason: 'no-text' };
    if (force) return { shouldProcess: true, reason: 'force', hash: hashText(hint.text) };

    const currentHash = hashText(hint.text);
    if (!hint.pacedSpeech || !Array.isArray(hint.pacedSpeech) || hint.pacedSpeech.length === 0) {
        return { shouldProcess: true, reason: 'missing', hash: currentHash };
    }
    if (stateMap) {
        const storedHash = stateMap.get(hint.id);
        if (!storedHash) return { shouldProcess: true, reason: 'no-state', hash: currentHash };
        if (storedHash !== currentHash) return { shouldProcess: true, reason: 'changed', hash: currentHash };
    } else {
        return { shouldProcess: true, reason: 'no-state-check', hash: currentHash };
    }
    return { shouldProcess: false, reason: 'up-to-date', hash: currentHash };
}

async function processHint(hint) {
    try {
        return { ...hint, pacedSpeech: await generatePacedSpeech(hint.text) };
    } catch (error) {
        console.error(`Failed to process hint ${hint.id}:`, error.message);
        throw error;
    }
}

function shouldProcessStep(step, options = {}) {
    const { force = false, stateMap = null } = options;
    const text = (step.stepTitle || '') + ' ' + (step.stepBody || '');
    if (!text.trim()) return { shouldProcess: false, reason: 'no-text' };
    if (force) return { shouldProcess: true, reason: 'force', hash: hashText(text), key: `step:${step.id}` };

    const currentHash = hashText(text);
    const key = `step:${step.id}`;
    if (!step.pacedSpeech || !Array.isArray(step.pacedSpeech) || step.pacedSpeech.length === 0) {
        return { shouldProcess: true, reason: 'missing', hash: currentHash, key };
    }
    if (stateMap) {
        const storedHash = stateMap.get(key);
        if (!storedHash) return { shouldProcess: true, reason: 'no-state', hash: currentHash, key };
        if (storedHash !== currentHash) return { shouldProcess: true, reason: 'changed', hash: currentHash, key };
    } else {
        return { shouldProcess: true, reason: 'no-state-check', hash: currentHash, key };
    }
    return { shouldProcess: false, reason: 'up-to-date', hash: currentHash, key };
}

async function processStep(step) {
    try {
        const text = (step.stepTitle || '') + (step.stepTitle && step.stepBody ? ' ' : '') + (step.stepBody || '');
        if (!text.trim()) return step;
        return { ...step, pacedSpeech: await generatePacedSpeech(text) };
    } catch (error) {
        console.error(`Failed to process step ${step.id}:`, error.message);
        throw error;
    }
}

function shouldProcessProblem(problem, options = {}) {
    const { force = false, stateMap = null } = options;
    const text = problem.body || '';
    if (!text.trim()) return { shouldProcess: false, reason: 'no-text' };
    if (force) return { shouldProcess: true, reason: 'force', hash: hashText(text), key: `problem:${problem.id}` };

    const currentHash = hashText(text);
    const key = `problem:${problem.id}`;
    if (!problem.pacedSpeech || !Array.isArray(problem.pacedSpeech) || problem.pacedSpeech.length === 0) {
        return { shouldProcess: true, reason: 'missing', hash: currentHash, key };
    }
    if (stateMap) {
        const storedHash = stateMap.get(key);
        if (!storedHash) return { shouldProcess: true, reason: 'no-state', hash: currentHash, key };
        if (storedHash !== currentHash) return { shouldProcess: true, reason: 'changed', hash: currentHash, key };
    } else {
        return { shouldProcess: true, reason: 'no-state-check', hash: currentHash, key };
    }
    return { shouldProcess: false, reason: 'up-to-date', hash: currentHash, key };
}

async function processProblem(problem) {
    try {
        const text = problem.body || '';
        if (!text.trim()) return problem;
        return { ...problem, pacedSpeech: await generatePacedSpeech(text) };
    } catch (error) {
        console.error(`Failed to process problem ${problem.id}:`, error.message);
        throw error;
    }
}

function loadStateFile(stateFilePath) {
    const stateMap = new Map();
    if (fs.existsSync(stateFilePath)) {
        try {
            const data = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
            Object.entries(data).forEach(([id, hash]) => stateMap.set(id, hash));
        } catch (error) {
            console.warn(`Failed to load state file: ${error.message}`);
        }
    }
    return stateMap;
}

function saveStateFile(stateFilePath, stateMap) {
    try {
        fs.writeFileSync(stateFilePath, JSON.stringify(Object.fromEntries(stateMap), null, 2), 'utf-8');
    } catch (error) {
        console.warn(`Failed to save state file: ${error.message}`);
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
    latexToSpeech,
    shutdownWorkers
};
