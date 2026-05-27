# TTS Preprocessing Pipeline

Converts LaTeX math in content JSON files to readable speech text, stored in the `pacedSpeech` field. The frontend reads `pacedSpeech` and sends it to the AWS Lambda Whisper TTS API for audio playback.

## Pipeline

```
$$LaTeX$$ → Python (latex2mathml) → MathML → SRE (speech-rule-engine) → cleanSpeech() → pacedSpeech[]
```

## npm Scripts

| Command | Description |
|---------|-------------|
| `npm run process-tts` | Incremental — only processes new or changed content |
| `npm run process-tts:force` | Reprocess everything |
| `npm run process-tts:dry-run` | Preview only, no files modified |
| `npm run process-tts:hints` | Hints only |
| `npm run process-tts:steps` | Steps only |
| `npm run process-tts:problems` | Problems only |

## Incremental State

`.tts-state.json` tracks MD5 hashes of processed content to skip unchanged items. If the process is interrupted, the state file may be incomplete — but content files are written immediately and won't be reprocessed unless their text changes or `--force` is used.
