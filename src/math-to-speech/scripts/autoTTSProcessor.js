#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
    hashText,
    shouldProcessHint,
    processHint,
    shouldProcessStep,
    processStep,
    shouldProcessProblem,
    processProblem,
    loadStateFile,
    saveStateFile
} = require('../utils/hintProcessor');

/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        force: false,
        dryRun: false,
        file: null,
        dir: null,
        verbose: false,
        stats: false,
        types: ['hints', 'steps', 'problems'] // Default: process all types
    };
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '--force':
                options.force = true;
                break;
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--verbose':
            case '-v':
                options.verbose = true;
                break;
            case '--stats':
                options.stats = true;
                break;
            case '--file':
                if (i + 1 < args.length) {
                    options.file = args[++i];
                }
                break;
            case '--dir':
                if (i + 1 < args.length) {
                    options.dir = args[++i];
                }
                break;
            case '--types':
                if (i + 1 < args.length) {
                    options.types = args[++i].split(',').map(t => t.trim());
                }
                break;
            case '--help':
            case '-h':
                printHelp();
                process.exit(0);
                break;
        }
    }
    
    return options;
}

/**
 * Print help information
 */
function printHelp() {
    console.log(`
Usage: node autoTTSProcessor.js [options]

Options:
  --force          Force regenerate all content (ignore hash check)
  --dry-run        Only detect, don't update (preview mode)
  --file <path>    Process only specified file
  --dir <path>     Process only specified directory
  --types <list>   Comma-separated list: hints,steps,problems (default: all)
  --verbose, -v    Verbose output
  --stats          Show statistics
  --help, -h       Show this help message

Examples:
  node autoTTSProcessor.js
  node autoTTSProcessor.js --force
  node autoTTSProcessor.js --dry-run --verbose
  node autoTTSProcessor.js --types hints,steps
  node autoTTSProcessor.js --file src/content-sources/oatutor/content-pool/circle1/circle1.json
  node autoTTSProcessor.js --dir src/content-sources/oatutor/content-pool/circle1
`);
}

/**
 * Recursively find all DefaultPathway.json files (hints)
 */
function findAllPathwayFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
        if (!fs.existsSync(currentDir)) {
            return;
        }
        
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
 * Recursively find all step JSON files
 */
function findAllStepFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
        if (!fs.existsSync(currentDir)) {
            return;
        }
        
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            
            if (entry.isDirectory()) {
                // Skip tutoring directory
                if (entry.name !== 'tutoring') {
                    traverse(fullPath);
                }
            } else if (entry.name.endsWith('.json') && !entry.name.includes('DefaultPathway')) {
                // Check if in steps directory
                const parentDir = path.dirname(fullPath);
                if (parentDir.includes('steps')) {
                    files.push(fullPath);
                }
            }
        }
    }
    
    traverse(dir);
    return files;
}

/**
 * Recursively find all problem JSON files
 */
function findAllProblemFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
        if (!fs.existsSync(currentDir)) {
            return;
        }
        
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            
            if (entry.isDirectory()) {
                // Skip steps directory
                if (entry.name !== 'steps') {
                    traverse(fullPath);
                }
            } else if (entry.name.endsWith('.json') && !entry.name.includes('DefaultPathway')) {
                // Check if in problem root directory (not in steps)
                const parentDir = path.dirname(fullPath);
                if (!parentDir.includes('steps') && !parentDir.includes('tutoring')) {
                    files.push(fullPath);
                }
            }
        }
    }
    
    traverse(dir);
    return files;
}

/**
 * Process a single pathway file (hints)
 */
async function processPathwayFile(filePath, options, stateMap) {
    const stats = {
        total: 0,
        processed: 0,
        skipped: 0,
        errors: 0,
        reasons: {
            missing: 0,
            changed: 0,
            force: 0,
            'up-to-date': 0,
            'no-text': 0
        }
    };
    
    try {
        if (options.verbose) {
            console.log(`\nProcessing hints: ${filePath}`);
        }
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        if (!Array.isArray(data)) {
            console.warn(`Warning: Skipping ${filePath}: not an array`);
            return stats;
        }
        
        stats.total = data.length;
        let modified = false;
        
        for (let i = 0; i < data.length; i++) {
            const hint = data[i];
            
            if (!hint.id) {
                console.warn(`Warning: Hint at index ${i} has no id, skipping`);
                continue;
            }
            
            const check = shouldProcessHint(hint, {
                force: options.force,
                stateMap: stateMap
            });
            
            stats.reasons[check.reason] = (stats.reasons[check.reason] || 0) + 1;
            
            if (check.shouldProcess) {
                try {
                    if (options.verbose) {
                        console.log(`  Processing hint ${hint.id} (${check.reason})`);
                    }
                    
                    const processed = await processHint(hint, options);
                    
                    if (!options.dryRun) {
                        data[i] = processed;
                        if (check.hash) {
                            stateMap.set(hint.id, check.hash);
                        }
                    } else if (options.verbose) {
                        console.log(`    [OK] Conversion successful (dry run)`);
                    }
                    
                    stats.processed++;
                    modified = true;
                } catch (error) {
                    console.error(`  [ERROR] Error processing hint ${hint.id}:`, error.message);
                    stats.errors++;
                }
            } else {
                if (check.hash && !options.dryRun) {
                    stateMap.set(hint.id, check.hash);
                }
                stats.skipped++;
            }
        }
        
        if (modified && !options.dryRun) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf-8');
            if (options.verbose) {
                console.log(`  [OK] Updated ${filePath}`);
            }
        } else if (options.dryRun && modified) {
            if (options.verbose) {
                console.log(`  [DRY RUN] Would update ${filePath} (dry run)`);
            }
        } else if (options.verbose && !modified) {
            console.log(`  [SKIP] No changes needed`);
        }
        
    } catch (error) {
        console.error(`[ERROR] Error processing file ${filePath}:`, error.message);
        stats.errors++;
    }
    
    return stats;
}

/**
 * Process a single step file
 */
async function processStepFile(filePath, options, stateMap) {
    const stats = {
        processed: 0,
        skipped: 0,
        errors: 0,
        reasons: {
            missing: 0,
            changed: 0,
            force: 0,
            'up-to-date': 0,
            'no-text': 0
        }
    };
    
    try {
        if (options.verbose) {
            console.log(`\nProcessing step: ${filePath}`);
        }
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        if (!data.id) {
            console.warn(`Warning: Skipping ${filePath}: no id field`);
            return stats;
        }
        
        const check = shouldProcessStep(data, {
            force: options.force,
            stateMap: stateMap
        });
        
        stats.reasons[check.reason] = (stats.reasons[check.reason] || 0) + 1;
        
        if (check.shouldProcess) {
            try {
                if (options.verbose) {
                    console.log(`  Processing step ${data.id} (${check.reason})`);
                }
                
                const processed = await processStep(data, options);
                
                if (!options.dryRun) {
                    fs.writeFileSync(filePath, JSON.stringify(processed, null, 4), 'utf-8');
                    if (check.hash && check.key) {
                        stateMap.set(check.key, check.hash);
                    }
                    if (options.verbose) {
                        console.log(`  [OK] Updated ${filePath}`);
                    }
                } else if (options.verbose) {
                    console.log(`    [OK] Conversion successful (dry run)`);
                }
                
                stats.processed++;
            } catch (error) {
                console.error(`  [ERROR] Error processing step ${data.id}:`, error.message);
                stats.errors++;
            }
        } else {
            if (check.hash && check.key && !options.dryRun) {
                stateMap.set(check.key, check.hash);
            }
            stats.skipped++;
            if (options.verbose) {
                console.log(`  [SKIP] No changes needed`);
            }
        }
        
    } catch (error) {
        console.error(`[ERROR] Error processing file ${filePath}:`, error.message);
        stats.errors++;
    }
    
    return stats;
}

/**
 * Process a single problem file
 */
async function processProblemFile(filePath, options, stateMap) {
    const stats = {
        processed: 0,
        skipped: 0,
        errors: 0,
        reasons: {
            missing: 0,
            changed: 0,
            force: 0,
            'up-to-date': 0,
            'no-text': 0
        }
    };
    
    try {
        if (options.verbose) {
            console.log(`\nProcessing problem: ${filePath}`);
        }
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        if (!data.id) {
            console.warn(`Warning: Skipping ${filePath}: no id field`);
            return stats;
        }
        
        const check = shouldProcessProblem(data, {
            force: options.force,
            stateMap: stateMap
        });
        
        stats.reasons[check.reason] = (stats.reasons[check.reason] || 0) + 1;
        
        if (check.shouldProcess) {
            try {
                if (options.verbose) {
                    console.log(`  Processing problem ${data.id} (${check.reason})`);
                }
                
                const processed = await processProblem(data, options);
                
                if (!options.dryRun) {
                    fs.writeFileSync(filePath, JSON.stringify(processed, null, 4), 'utf-8');
                    if (check.hash && check.key) {
                        stateMap.set(check.key, check.hash);
                    }
                    if (options.verbose) {
                        console.log(`  [OK] Updated ${filePath}`);
                    }
                } else if (options.verbose) {
                    console.log(`    [OK] Conversion successful (dry run)`);
                }
                
                stats.processed++;
            } catch (error) {
                console.error(`  [ERROR] Error processing problem ${data.id}:`, error.message);
                stats.errors++;
            }
        } else {
            if (check.hash && check.key && !options.dryRun) {
                stateMap.set(check.key, check.hash);
            }
            stats.skipped++;
            if (options.verbose) {
                console.log(`  [SKIP] No changes needed`);
            }
        }
        
    } catch (error) {
        console.error(`[ERROR] Error processing file ${filePath}:`, error.message);
        stats.errors++;
    }
    
    return stats;
}

/**
 * Main function
 */
async function main() {
    const options = parseArgs();
    
    console.log('TTS Auto Processor (Hints, Steps, Problems)');
    console.log('='.repeat(60));
    
    if (options.dryRun) {
        console.log('[DRY RUN MODE] No files will be modified\n');
    }
    
    if (options.force) {
        console.log('[FORCE MODE] All content will be regenerated\n');
    }
    
    console.log(`Processing types: ${options.types.join(', ')}\n`);
    
    const contentPoolDir = path.join(__dirname, '../../content-sources/oatutor/content-pool');
    const stateFilePath = path.join(__dirname, '../.tts-state.json');
    
    const stateMap = loadStateFile(stateFilePath);
    
    const totalStats = {
        hints: { files: 0, total: 0, processed: 0, skipped: 0, errors: 0, reasons: {} },
        steps: { files: 0, processed: 0, skipped: 0, errors: 0, reasons: {} },
        problems: { files: 0, processed: 0, skipped: 0, errors: 0, reasons: {} }
    };
    
    const startTime = Date.now();
    
    // Process hints
    if (options.types.includes('hints')) {
        let hintFiles = [];
        
        if (options.file) {
            if (options.file.includes('DefaultPathway.json')) {
                hintFiles = [path.isAbsolute(options.file) ? options.file : path.join(process.cwd(), options.file)];
            }
        } else if (options.dir) {
            const dirPath = path.isAbsolute(options.dir) ? options.dir : path.join(process.cwd(), options.dir);
            hintFiles = findAllPathwayFiles(dirPath);
        } else {
            hintFiles = findAllPathwayFiles(contentPoolDir);
        }
        
        if (hintFiles.length > 0) {
            console.log(`\nProcessing ${hintFiles.length} hint file(s)...`);
            for (let i = 0; i < hintFiles.length; i++) {
                const file = hintFiles[i];
                if (options.verbose || i % 10 === 0) {
                    console.log(`[${i + 1}/${hintFiles.length}] ${path.relative(process.cwd(), file)}`);
                }
                
                const stats = await processPathwayFile(file, options, stateMap);
                totalStats.hints.files++;
                totalStats.hints.total += stats.total;
                totalStats.hints.processed += stats.processed;
                totalStats.hints.skipped += stats.skipped;
                totalStats.hints.errors += stats.errors;
                
                Object.keys(stats.reasons).forEach(reason => {
                    totalStats.hints.reasons[reason] = 
                        (totalStats.hints.reasons[reason] || 0) + stats.reasons[reason];
                });
            }
        }
    }
    
    // Process steps
    if (options.types.includes('steps')) {
        let stepFiles = [];
        
        if (options.file) {
            if (!options.file.includes('DefaultPathway.json') && options.file.includes('steps')) {
                stepFiles = [path.isAbsolute(options.file) ? options.file : path.join(process.cwd(), options.file)];
            }
        } else if (options.dir) {
            const dirPath = path.isAbsolute(options.dir) ? options.dir : path.join(process.cwd(), options.dir);
            stepFiles = findAllStepFiles(dirPath);
        } else {
            stepFiles = findAllStepFiles(contentPoolDir);
        }
        
        if (stepFiles.length > 0) {
            console.log(`\nProcessing ${stepFiles.length} step file(s)...`);
            for (let i = 0; i < stepFiles.length; i++) {
                const file = stepFiles[i];
                if (options.verbose || i % 10 === 0) {
                    console.log(`[${i + 1}/${stepFiles.length}] ${path.relative(process.cwd(), file)}`);
                }
                
                const stats = await processStepFile(file, options, stateMap);
                totalStats.steps.files++;
                totalStats.steps.processed += stats.processed;
                totalStats.steps.skipped += stats.skipped;
                totalStats.steps.errors += stats.errors;
                
                Object.keys(stats.reasons).forEach(reason => {
                    totalStats.steps.reasons[reason] = 
                        (totalStats.steps.reasons[reason] || 0) + stats.reasons[reason];
                });
            }
        }
    }
    
    // Process problems
    if (options.types.includes('problems')) {
        let problemFiles = [];
        
        if (options.file) {
            if (!options.file.includes('DefaultPathway.json') && !options.file.includes('steps')) {
                problemFiles = [path.isAbsolute(options.file) ? options.file : path.join(process.cwd(), options.file)];
            }
        } else if (options.dir) {
            const dirPath = path.isAbsolute(options.dir) ? options.dir : path.join(process.cwd(), options.dir);
            problemFiles = findAllProblemFiles(dirPath);
        } else {
            problemFiles = findAllProblemFiles(contentPoolDir);
        }
        
        if (problemFiles.length > 0) {
            console.log(`\nProcessing ${problemFiles.length} problem file(s)...`);
            for (let i = 0; i < problemFiles.length; i++) {
                const file = problemFiles[i];
                if (options.verbose || i % 10 === 0) {
                    console.log(`[${i + 1}/${problemFiles.length}] ${path.relative(process.cwd(), file)}`);
                }
                
                const stats = await processProblemFile(file, options, stateMap);
                totalStats.problems.files++;
                totalStats.problems.processed += stats.processed;
                totalStats.problems.skipped += stats.skipped;
                totalStats.problems.errors += stats.errors;
                
                Object.keys(stats.reasons).forEach(reason => {
                    totalStats.problems.reasons[reason] = 
                        (totalStats.problems.reasons[reason] || 0) + stats.reasons[reason];
                });
            }
        }
    }
    
    if (!options.dryRun) {
        saveStateFile(stateFilePath, stateMap);
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('Processing Complete!');
    console.log('='.repeat(60));
    
    if (options.stats || options.verbose) {
        if (options.types.includes('hints')) {
            console.log(`\nHints:`);
            console.log(`  Files: ${totalStats.hints.files}`);
            console.log(`  Total: ${totalStats.hints.total}`);
            console.log(`  Processed: ${totalStats.hints.processed}`);
            console.log(`  Skipped: ${totalStats.hints.skipped}`);
            console.log(`  Errors: ${totalStats.hints.errors}`);
            if (Object.keys(totalStats.hints.reasons).length > 0) {
                console.log(`  Reasons:`);
                Object.entries(totalStats.hints.reasons).forEach(([reason, count]) => {
                    if (count > 0) {
                        console.log(`    ${reason}: ${count}`);
                    }
                });
            }
        }
        
        if (options.types.includes('steps')) {
            console.log(`\nSteps:`);
            console.log(`  Files: ${totalStats.steps.files}`);
            console.log(`  Processed: ${totalStats.steps.processed}`);
            console.log(`  Skipped: ${totalStats.steps.skipped}`);
            console.log(`  Errors: ${totalStats.steps.errors}`);
            if (Object.keys(totalStats.steps.reasons).length > 0) {
                console.log(`  Reasons:`);
                Object.entries(totalStats.steps.reasons).forEach(([reason, count]) => {
                    if (count > 0) {
                        console.log(`    ${reason}: ${count}`);
                    }
                });
            }
        }
        
        if (options.types.includes('problems')) {
            console.log(`\nProblems:`);
            console.log(`  Files: ${totalStats.problems.files}`);
            console.log(`  Processed: ${totalStats.problems.processed}`);
            console.log(`  Skipped: ${totalStats.problems.skipped}`);
            console.log(`  Errors: ${totalStats.problems.errors}`);
            if (Object.keys(totalStats.problems.reasons).length > 0) {
                console.log(`  Reasons:`);
                Object.entries(totalStats.problems.reasons).forEach(([reason, count]) => {
                    if (count > 0) {
                        console.log(`    ${reason}: ${count}`);
                    }
                });
            }
        }
    }
    
    console.log(`\nTime elapsed: ${elapsed}s`);
    
    if (options.dryRun) {
        console.log('\n[INFO] This was a dry run. Use without --dry-run to apply changes.');
    }
    
    const totalErrors = totalStats.hints.errors + totalStats.steps.errors + totalStats.problems.errors;
    if (totalErrors > 0) {
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = {
    processPathwayFile,
    processStepFile,
    processProblemFile,
    findAllPathwayFiles,
    findAllStepFiles,
    findAllProblemFiles
};


