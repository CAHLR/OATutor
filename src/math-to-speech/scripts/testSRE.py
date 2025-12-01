import os
import sys
from pathlib import Path
import difflib

from sreConverter import convert_pre_to_post

def normalize_speech(text):
    text = text.replace(',', '')
    text = text.replace(';', '')
    import re
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

def test_conversion(test_file='onlyMath1-0'):
    base_path = Path(__file__).parent.parent
    test_pre = base_path / 'translation-text-files' / 'pre-translation' / 'conversion-math' / 'math-conversion1' / f'{test_file}Pre.txt'
    test_post = base_path / 'translation-text-files' / 'pre-translation' / 'conversion-math' / 'math-conversion1' / f'{test_file}Post.txt'
    
    if not test_pre.exists():
        print(f'File not found: {test_pre}')
        return
    
    if not test_post.exists():
        print(f'File not found: {test_post}')
        return
    
    print('=' * 80)
    print('SRE vs MathCAT Conversion Test')
    print(f'Test file: {test_file}')
    print('=' * 80)
    print()
    
    with open(test_pre, 'r', encoding='utf-8') as f:
        pre_content = f.read()
    
    with open(test_post, 'r', encoding='utf-8') as f:
        mathcat_output = f.read()
    
    print(f'Input size: {len(pre_content):,} chars')
    print('Processing with SRE...')
    
    sre_output = convert_pre_to_post(pre_content)
    
    print('Done!\n')
    
    pre_hints = [h.strip() for h in pre_content.split(';') if h.strip() and h.strip() != 'nyradhej']
    
    import re
    mathcat_parts = re.split(r';\s*semicolon\s+', mathcat_output)
    mathcat_hints = [h.strip().rstrip(';').strip() for h in mathcat_parts if h.strip() and 'nyradhej' not in h]
    
    sre_parts = sre_output.split(' semicolon ')
    sre_hints = [h.strip() for h in sre_parts if h.strip() and h.strip() != 'nyradhej']
    
    print(f'Total hints found:')
    print(f'  Pre (LaTeX):  {len(pre_hints)}')
    print(f'  MathCAT:      {len(mathcat_hints)}')
    print(f'  SRE:          {len(sre_hints)}')
    print()
    
    exact_matches = 0
    similar_matches = 0
    differences = 0
    
    sample_size = min(30, len(pre_hints), len(mathcat_hints), len(sre_hints))
    
    print(f'Analyzing first {sample_size} hints:')
    print('-' * 80)
    
    diff_examples = []
    
    for idx in range(sample_size):
        if idx >= len(pre_hints):
            break
            
        latex = pre_hints[idx]
        mathcat = mathcat_hints[idx] if idx < len(mathcat_hints) else '[MISSING]'
        sre = sre_hints[idx] if idx < len(sre_hints) else '[MISSING]'
        
        if not latex.strip():
            continue
        
        mathcat_norm = normalize_speech(mathcat) if mathcat != '[MISSING]' else ''
        sre_norm = normalize_speech(sre) if sre != '[MISSING]' else ''
        
        if mathcat == '[MISSING]' or sre == '[MISSING]':
            differences += 1
        elif mathcat_norm == sre_norm:
            exact_matches += 1
        else:
            similarity = difflib.SequenceMatcher(None, mathcat_norm, sre_norm).ratio()
            if similarity > 0.8:
                similar_matches += 1
            else:
                differences += 1
                if len(diff_examples) < 5:
                    diff_examples.append({
                        'idx': idx + 1,
                        'latex': latex,
                        'mathcat': mathcat,
                        'sre': sre,
                        'similarity': similarity
                    })
    
    print()
    print('=' * 80)
    print('Summary:')
    print('=' * 80)
    print(f'  Exact matches:    {exact_matches:3d} ({exact_matches/sample_size*100:.1f}%)')
    print(f'  Similar matches:  {similar_matches:3d} ({similar_matches/sample_size*100:.1f}%)')
    print(f'  Differences:      {differences:3d} ({differences/sample_size*100:.1f}%)')
    print(f'  Overall accuracy: {(exact_matches + similar_matches)/sample_size*100:.1f}%')
    print()
    
    if diff_examples:
        print('Example differences (first 5):')
        print('-' * 80)
        for ex in diff_examples:
            print(f"\n[Hint {ex['idx']}] Similarity: {ex['similarity']*100:.0f}%")
            latex_display = ex['latex'][:70] + '...' if len(ex['latex']) > 70 else ex['latex']
            mathcat_display = ex['mathcat'][:70] + '...' if len(ex['mathcat']) > 70 else ex['mathcat']
            sre_display = ex['sre'][:70] + '...' if len(ex['sre']) > 70 else ex['sre']
            print(f"  LaTeX:   {latex_display}")
            print(f"  MathCAT: {mathcat_display}")
            print(f"  SRE:     {sre_display}")
        print()
    
    print('File sizes:')
    print(f'  MathCAT output: {len(mathcat_output):,} chars')
    print(f'  SRE output:     {len(sre_output):,} chars')
    print(f'  Difference:     {abs(len(sre_output) - len(mathcat_output)):,} chars ({abs(len(sre_output) - len(mathcat_output)) / len(mathcat_output) * 100:.1f}%)')
    print()
    
    sre_test_file = test_pre.parent / f'{test_file}Post-SRE-TEST.txt'
    with open(sre_test_file, 'w', encoding='utf-8') as f:
        f.write(sre_output)
    print(f'SRE output saved to: {sre_test_file.name}')
    print(f'Compare with:        {test_file}Post.txt')
    print()
    print('=' * 80)

if __name__ == '__main__':
    test_file = sys.argv[1] if len(sys.argv) > 1 else 'onlyMath1-0'
    test_conversion(test_file)

