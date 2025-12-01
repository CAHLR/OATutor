// 使用SRE自动化处理所有hints的完整脚本
// 可以替代整个手动MathCAT流程

const fs = require('fs');
const path = require('path');
const sre = require('speech-rule-engine');

// 初始化SRE
sre.setupEngine({
  domain: 'clearspeak',  // 清晰易懂的朗读风格
  style: 'default',
  locale: 'en'
});

/**
 * 将LaTeX转换为语音文本
 */
function convertLatexToSpeech(latex) {
  try {
    const cleanLatex = latex.replace(/\$\$/g, '').trim();
    let speech = sre.toSpeech(cleanLatex);
    
    // 后处理清理
    speech = postProcessSpeech(speech);
    
    return speech;
  } catch (error) {
    console.error(`转换失败: ${latex}`, error);
    return latex; // 失败时返回原文
  }
}

/**
 * 后处理清理
 */
function postProcessSpeech(text) {
  // 去除多余的词
  const cleanups = {
    'StartFraction': '',
    'EndFraction': '',
    'StartLayout': '',
    'EndLayout': '',
  };
  
  let cleaned = text;
  for (const [old, newText] of Object.entries(cleanups)) {
    cleaned = cleaned.replace(new RegExp(old, 'g'), newText);
  }
  
  return cleaned.trim();
}

/**
 * 处理单个hint对象
 */
function processHint(hint) {
  // 提取所有LaTeX公式
  const mathRegex = /\$\$(.*?)\$\$/g;
  const mathFormulas = [];
  let match;
  
  while ((match = mathRegex.exec(hint.text)) !== null) {
    mathFormulas.push(match[0]); // 保留$$包裹用于显示
  }
  
  // 转换为语音文本
  const speech = hint.text.replace(mathRegex, (match, latex) => {
    return convertLatexToSpeech(latex);
  });
  
  // 生成分段语音（用于同步高亮）
  const pacedSpeech = generatePacedSpeech(hint.text);
  
  return {
    ...hint,
    speech: speech,
    math: mathFormulas.length > 0 ? mathFormulas : [''],
    pacedSpeech: pacedSpeech
  };
}

/**
 * 生成分段语音（用于播放时同步高亮）
 */
function generatePacedSpeech(text) {
  const parts = [];
  const mathRegex = /\$\$(.*?)\$\$/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = mathRegex.exec(text)) !== null) {
    // 添加文本部分
    if (match.index > lastIndex) {
      const textPart = text.substring(lastIndex, match.index);
      if (textPart.trim()) {
        parts.push(textPart.trim());
      }
    }
    
    // 转换并添加数学部分
    const mathSpeech = convertLatexToSpeech(match[1]);
    parts.push(mathSpeech);
    
    lastIndex = match.index + match[0].length;
  }
  
  // 添加剩余文本
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex).trim();
    if (remaining) {
      parts.push(remaining);
    }
  }
  
  return parts.length > 0 ? parts : [text];
}

/**
 * 处理单个pathway文件
 */
function processPathwayFile(filePath) {
  console.log(`处理: ${filePath}`);
  
  try {
    // 读取JSON
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // 处理每个hint
    const processedData = data.map(hint => processHint(hint));
    
    // 保存
    fs.writeFileSync(filePath, JSON.stringify(processedData, null, 4), 'utf-8');
    
    console.log(`✅ 完成: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ 失败: ${filePath}`, error);
    return false;
  }
}

/**
 * 递归查找所有DefaultPathway.json文件
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
function main() {
  const contentPoolDir = 'src/content-sources/oatutor/content-pool';
  
  console.log('🚀 开始处理所有hints...\n');
  console.log(`扫描目录: ${contentPoolDir}\n`);
  
  // 查找所有文件
  const files = findAllPathwayFiles(contentPoolDir);
  console.log(`找到 ${files.length} 个pathway文件\n`);
  
  // 处理所有文件
  let successCount = 0;
  let failCount = 0;
  
  files.forEach((file, index) => {
    console.log(`[${index + 1}/${files.length}]`);
    if (processPathwayFile(file)) {
      successCount++;
    } else {
      failCount++;
    }
    console.log('');
  });
  
  // 统计
  console.log('=' .repeat(50));
  console.log('处理完成！');
  console.log(`✅ 成功: ${successCount}`);
  console.log(`❌ 失败: ${failCount}`);
  console.log(`📊 总计: ${files.length}`);
}

// 运行
if (require.main === module) {
  main();
}

module.exports = {
  convertLatexToSpeech,
  processHint,
  generatePacedSpeech
};


