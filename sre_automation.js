
const fs = require('fs');
const path = require('path');
const sre = require('speech-rule-engine');
sre.setupEngine({
  domain: 'clearspeak', 
  style: 'default',
  locale: 'en'
});

function convertLatexToSpeech(latex) {
  try {
    const cleanLatex = latex.replace(/\$\$/g, '').trim();
    let speech = sre.toSpeech(cleanLatex);
    
    speech = postProcessSpeech(speech);
    
    return speech;
  } catch (error) {
    return latex;
  }
}

function postProcessSpeech(text) {
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

function processHint(hint) {
  const mathRegex = /\$\$(.*?)\$\$/g;
  const mathFormulas = [];
  let match;
  
  while ((match = mathRegex.exec(hint.text)) !== null) {
    mathFormulas.push(match[0]);
  }
  
  const speech = hint.text.replace(mathRegex, (match, latex) => {
    return convertLatexToSpeech(latex);
  });
  
  const pacedSpeech = generatePacedSpeech(hint.text);
  
  return {
    ...hint,
    speech: speech,
    math: mathFormulas.length > 0 ? mathFormulas : [''],
    pacedSpeech: pacedSpeech
  };
}

function generatePacedSpeech(text) {
  const parts = [];
  const mathRegex = /\$\$(.*?)\$\$/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = mathRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const textPart = text.substring(lastIndex, match.index);
      if (textPart.trim()) {
        parts.push(textPart.trim());
      }
    }
  
    const mathSpeech = convertLatexToSpeech(match[1]);
    parts.push(mathSpeech);
    
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex).trim();
    if (remaining) {
      parts.push(remaining);
    }
  }
  
  return parts.length > 0 ? parts : [text];
}

function processPathwayFile(filePath) {  
  try {

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const processedData = data.map(hint => processHint(hint));

    fs.writeFileSync(filePath, JSON.stringify(processedData, null, 4), 'utf-8');
    
    console.log(`${filePath}`);
    return true;
  } catch (error) {
    console.error(`${filePath}`, error);
    return false;
  }
}

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

function main() {
  const contentPoolDir = 'src/content-sources/oatutor/content-pool';
  
  
  const files = findAllPathwayFiles(contentPoolDir);
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
}

if (require.main === module) {
  main();
}

module.exports = {
  convertLatexToSpeech,
  processHint,
  generatePacedSpeech
};


