import os
import sys
import subprocess
import re
from pathlib import Path

try:
    from latex2mathml.converter import convert as latex_to_mathml_convert
except ImportError:
    print("Installing latex2mathml...")
    subprocess.run([sys.executable, "-m", "pip", "install", "latex2mathml"], check=True)
    from latex2mathml.converter import convert as latex_to_mathml_convert

def latex_to_mathml(latex_expr):
    if not latex_expr or not latex_expr.strip():
        return None
    
    try:
        mathml = latex_to_mathml_convert(latex_expr.strip())
        return mathml
    except Exception as e:
        return None

def batch_mathml_to_speech(mathml_list):
    if not mathml_list:
        return []
    
    try:
        import json
        script_path = Path(__file__).parent / 'sreNode.js'
        
        result = subprocess.run(
            ['node', str(script_path)],
            input=json.dumps(mathml_list),
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            return [m for m in mathml_list]
    except Exception as e:
        return [m for m in mathml_list]

def clean_speech(speech):
    speech = speech.replace('StartFraction', '')
    speech = speech.replace('EndFraction', '')
    speech = speech.replace('StartLayout', '')
    speech = speech.replace('EndLayout', '')
    speech = speech.replace('StartRoot', '')
    speech = speech.replace('EndRoot', '')
    speech = re.sub(r'\s+', ' ', speech).strip()
    return speech

def latex_to_speech(latex_expr):
    if not latex_expr or not latex_expr.strip():
        return ''
    
    latex = latex_expr.strip()
    mathml = latex_to_mathml(latex)
    if not mathml:
        return latex
    
    speech_list = batch_mathml_to_speech([mathml])
    if not speech_list or len(speech_list) == 0:
        return latex
    
    return clean_speech(speech_list[0])

def convert_pre_to_post(pre_content):
    pre_content = pre_content.replace(' nyradhej ', '')
    
    hints = pre_content.split(';')
    
    all_latex = []
    hint_structure = []
    
    for hint in hints:
        if not hint or not hint.strip():
            hint_structure.append([])
            continue
        
        latex_expressions = hint.split('@')
        trimmed_expressions = [latex.strip() for latex in latex_expressions]
        hint_structure.append(trimmed_expressions)
        
        for latex in trimmed_expressions:
            if latex:
                all_latex.append(latex)
    
    all_mathml = [latex_to_mathml(latex) if latex else None for latex in all_latex]
    valid_mathml = [m if m else latex for m, latex in zip(all_mathml, all_latex)]
    
    all_speech = batch_mathml_to_speech(valid_mathml)
    all_speech = [clean_speech(s) for s in all_speech]
    
    speech_idx = 0
    converted_hints = []
    
    for hint_latex_list in hint_structure:
        if not hint_latex_list:
            converted_hints.append('')
            continue
        
        converted_expressions = []
        for latex in hint_latex_list:
            if latex:
                converted_expressions.append(all_speech[speech_idx])
                speech_idx += 1
            else:
                converted_expressions.append('')
        
        converted_hint = ' at sign '.join([e for e in converted_expressions if e])
        converted_hints.append(converted_hint)
    
    return ' semicolon '.join(converted_hints)

def process_pre_file(pre_file_path, post_file_path):
    try:
        with open(pre_file_path, 'r', encoding='utf-8') as f:
            pre_content = f.read()
        
        latex_count = len([l for l in pre_content.split(';') if l.strip()])
        print(f"    Converting {latex_count} expressions...", end=' ', flush=True)
        
        post_content = convert_pre_to_post(pre_content)
        
        with open(post_file_path, 'w', encoding='utf-8') as f:
            f.write(post_content)
        
        print("Done!")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def process_directory(directory_path):
    files = os.listdir(directory_path)
    pre_files = sorted([f for f in files if 'Pre.txt' in f])
    
    success_count = 0
    fail_count = 0
    
    for idx, pre_file in enumerate(pre_files, 1):
        pre_file_path = os.path.join(directory_path, pre_file)
        post_file = pre_file.replace('Pre.txt', 'Post.txt')
        post_file_path = os.path.join(directory_path, post_file)
        
        print(f"  [{idx}/{len(pre_files)}] {pre_file}")
        if process_pre_file(pre_file_path, post_file_path):
            success_count += 1
        else:
            fail_count += 1
    
    return success_count, fail_count

def process_all_directories():
    import time
    start_time = time.time()
    
    base_path = Path(__file__).parent.parent
    conversion_path = base_path / 'translation-text-files' / 'pre-translation' / 'conversion-math'
    
    if not conversion_path.exists():
        print(f"Directory not found: {conversion_path}")
        return
    
    math_dirs = sorted([d for d in conversion_path.iterdir() if d.is_dir() and d.name.startswith('math-conversion')])
    
    print(f"\nSRE Batch Converter - Processing {len(math_dirs)} directories")
    print("=" * 70)
    print()
    
    total_success = 0
    total_fail = 0
    
    for idx, math_dir in enumerate(math_dirs, 1):
        print(f"[{idx}/{len(math_dirs)}] {math_dir.name}")
        success, fail = process_directory(math_dir)
        total_success += success
        total_fail += fail
        print()
    
    elapsed = time.time() - start_time
    print("=" * 70)
    print(f"Completed: {total_success} files succeeded, {total_fail} failed")
    print(f"Time elapsed: {elapsed:.1f} seconds ({elapsed/60:.1f} minutes)")
    print("=" * 70)

if __name__ == '__main__':
    process_all_directories()

