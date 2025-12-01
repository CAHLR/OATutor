#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
    hashText,
    shouldProcessHint,
    processHint,
    loadStateFile,
    saveStateFile
} = require('../utils/hintProcessor');

/**
 * 解析命令行参数
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        force: false,
        dryRun: false,
        file: null,
        dir: null,
        verbose: false,
        stats: false
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
 * 打印帮助信息
 */
function printHelp() {
    console.log(`
Usage: node autoHintProcessor.js [options]

Options:
  --force          Force regenerate all hints (ignore hash check)
  --dry-run        Only detect, don't update (preview mode)
  --file <path>    Process only specified file
  --dir <path>     Process only specified directory
  --verbose, -v    Verbose output
  --stats          Show statistics
  --help, -h       Show this help message

Examples:
  node autoHintProcessor.js
  node autoHintProcessor.js --force
  node autoHintProcessor.js --dry-run --verbose
  node autoHintProcessor.js --file src/content-sources/oatutor/content-pool/circle1/steps/circle1a/tutoring/circle1aDefaultPathway.json
  node autoHintProcessor.js --dir src/content-sources/oatutor/content-pool/circle1
`);
}

/**
 * 递归查找所有DefaultPathway.json文件
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
 * 处理单个pathway文件
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
            console.log(`\nProcessing: ${filePath}`);
        }
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        if (!Array.isArray(data)) {
            console.warn(`⚠️  Skipping ${filePath}: not an array`);
            return stats;
        }
        
        stats.total = data.length;
        let modified = false;
        
        for (let i = 0; i < data.length; i++) {
            const hint = data[i];
            
            if (!hint.id) {
                console.warn(`⚠️  Hint at index ${i} has no id, skipping`);
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
                    
                    // 在dry run模式下也执行转换，用于验证是否成功
                    const processed = await processHint(hint, options);
                    
                    if (!options.dryRun) {
                        // 只在非dry run模式下更新数据和状态
                        data[i] = processed;
                        if (check.hash) {
                            stateMap.set(hint.id, check.hash);
                        }
                    } else {
                        // dry run模式下只验证转换，不更新数据
                        if (options.verbose) {
                            console.log(`    ✅ Conversion successful (dry run)`);
                        }
                    }
                    
                    stats.processed++;
                    modified = true;
                } catch (error) {
                    console.error(`  ❌ Error processing hint ${hint.id}:`, error.message);
                    stats.errors++;
                }
            } else {
                if (check.hash && !options.dryRun) {
                    // 只在非dry run模式下更新状态
                    stateMap.set(hint.id, check.hash);
                }
                stats.skipped++;
            }
        }
        
        if (modified && !options.dryRun) {
            // 只在非dry run模式下写文件
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf-8');
            if (options.verbose) {
                console.log(`  ✅ Updated ${filePath}`);
            }
        } else if (options.dryRun && modified) {
            if (options.verbose) {
                console.log(`  📋 Would update ${filePath} (dry run)`);
            }
        } else if (options.verbose && !modified) {
            console.log(`  ⏭️  No changes needed`);
        }
        
    } catch (error) {
        console.error(`❌ Error processing file ${filePath}:`, error.message);
        stats.errors++;
    }
    
    return stats;
}

/**
 * 主函数
 */
async function main() {
    const options = parseArgs();
    
    console.log('🚀 Hint Auto Processor');
    console.log('='.repeat(50));
    
    if (options.dryRun) {
        console.log('📋 DRY RUN MODE - No files will be modified\n');
    }
    
    if (options.force) {
        console.log('🔄 FORCE MODE - All hints will be regenerated\n');
    }
    
    const contentPoolDir = path.join(__dirname, '../../content-sources/oatutor/content-pool');
    const stateFilePath = path.join(__dirname, '../.hint-state.json');
    
    let files = [];
    
    if (options.file) {
        const filePath = path.isAbsolute(options.file) 
            ? options.file 
            : path.join(process.cwd(), options.file);
        
        if (fs.existsSync(filePath)) {
            files = [filePath];
        } else {
            console.error(`❌ File not found: ${filePath}`);
            process.exit(1);
        }
    } else if (options.dir) {
        const dirPath = path.isAbsolute(options.dir)
            ? options.dir
            : path.join(process.cwd(), options.dir);
        
        files = findAllPathwayFiles(dirPath);
    } else {
        files = findAllPathwayFiles(contentPoolDir);
    }
    
    if (files.length === 0) {
        console.log('No pathway files found.');
        process.exit(0);
    }
    
    console.log(`Found ${files.length} pathway file(s)\n`);
    
    const stateMap = loadStateFile(stateFilePath);
    
    const totalStats = {
        files: {
            total: files.length,
            processed: 0,
            errors: 0
        },
        hints: {
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
        }
    };
    
    const startTime = Date.now();
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`[${i + 1}/${files.length}] ${path.relative(process.cwd(), file)}`);
        
        const stats = await processPathwayFile(file, options, stateMap);
        
        totalStats.files.processed++;
        totalStats.hints.total += stats.total;
        totalStats.hints.processed += stats.processed;
        totalStats.hints.skipped += stats.skipped;
        totalStats.hints.errors += stats.errors;
        
        Object.keys(stats.reasons).forEach(reason => {
            totalStats.hints.reasons[reason] = 
                (totalStats.hints.reasons[reason] || 0) + stats.reasons[reason];
        });
        
        if (stats.errors > 0) {
            totalStats.files.errors++;
        }
    }
    
    if (!options.dryRun) {
        saveStateFile(stateFilePath, stateMap);
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Processing Complete!');
    console.log('='.repeat(50));
    
    if (options.stats || options.verbose) {
        console.log(`\nFiles:`);
        console.log(`  Total: ${totalStats.files.total}`);
        console.log(`  Processed: ${totalStats.files.processed}`);
        console.log(`  Errors: ${totalStats.files.errors}`);
        
        console.log(`\nHints:`);
        console.log(`  Total: ${totalStats.hints.total}`);
        console.log(`  Processed: ${totalStats.hints.processed}`);
        console.log(`  Skipped: ${totalStats.hints.skipped}`);
        console.log(`  Errors: ${totalStats.hints.errors}`);
        
        console.log(`\nReasons:`);
        Object.entries(totalStats.hints.reasons).forEach(([reason, count]) => {
            if (count > 0) {
                console.log(`  ${reason}: ${count}`);
            }
        });
    }
    
    console.log(`\n⏱️  Time elapsed: ${elapsed}s`);
    
    if (options.dryRun) {
        console.log('\n💡 This was a dry run. Use without --dry-run to apply changes.');
    }
    
    if (totalStats.hints.errors > 0) {
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
    findAllPathwayFiles
};

