const sre = require('speech-rule-engine');

sre.setupEngine({
  locale: 'en',
  domain: 'clearspeak',
  style: 'default'
});

// Persistent mode: read newline-delimited JSON batches from stdin,
// write one JSON result per line to stdout. Process stays alive until stdin closes.
let buffer = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop(); // keep incomplete line

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const items = JSON.parse(trimmed);
      const results = items.map(mathml => {
        try {
          return sre.toSpeech(mathml);
        } catch (e) {
          return mathml;
        }
      });
      process.stdout.write(JSON.stringify(results) + '\n');
    } catch (e) {
      process.stdout.write(JSON.stringify([]) + '\n');
    }
  }
});

process.stdin.on('end', () => {
  if (buffer.trim()) {
    try {
      const items = JSON.parse(buffer.trim());
      const results = items.map(mathml => {
        try { return sre.toSpeech(mathml); }
        catch (e) { return mathml; }
      });
      process.stdout.write(JSON.stringify(results) + '\n');
    } catch (e) {
      process.stdout.write(JSON.stringify([]) + '\n');
    }
  }
  process.exit(0);
});
