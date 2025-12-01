const sre = require('speech-rule-engine');

sre.setupEngine({
  locale: 'en',
  domain: 'clearspeak',
  style: 'default'
});

let input = '';

process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const items = JSON.parse(input);
    const results = items.map(mathml => {
      try {
        return sre.toSpeech(mathml);
      } catch (error) {
        return mathml;
      }
    });
    process.stdout.write(JSON.stringify(results));
    process.exit(0);
  } catch (error) {
    process.stderr.write(`SRE Error: ${error.message}`);
    process.exit(1);
  }
});

