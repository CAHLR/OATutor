#!/usr/bin/env python3
"""
LaTeX to MathML converter - persistent mode.
Reads newline-delimited JSON arrays from stdin, writes one JSON result per line to stdout.
Process stays alive until stdin closes.
"""

import sys
import json

try:
    from latex2mathml.converter import convert as latex_to_mathml_convert
except ImportError:
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "latex2mathml", "--quiet"], check=True)
    from latex2mathml.converter import convert as latex_to_mathml_convert

def latex_to_mathml(latex_expr):
    if not latex_expr or not latex_expr.strip():
        return None
    try:
        return latex_to_mathml_convert(latex_expr.strip())
    except Exception:
        return None

if __name__ == '__main__':
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            latex_list = json.loads(line)
            results = [latex_to_mathml(latex) for latex in latex_list]
            print(json.dumps(results), flush=True)
        except Exception as e:
            print(json.dumps([]), flush=True)
