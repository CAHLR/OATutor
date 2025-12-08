#!/usr/bin/env python3
"""
LaTeX to MathML converter script
Called from Node.js to convert LaTeX expressions to MathML
"""

import sys
import json
import subprocess
from pathlib import Path

try:
    from latex2mathml.converter import convert as latex_to_mathml_convert
except ImportError:
    print("Installing latex2mathml...", file=sys.stderr)
    subprocess.run([sys.executable, "-m", "pip", "install", "latex2mathml", "--quiet"], check=True)
    from latex2mathml.converter import convert as latex_to_mathml_convert

def latex_to_mathml(latex_expr):
    """Convert LaTeX expression to MathML"""
    if not latex_expr or not latex_expr.strip():
        return None
    
    try:
        mathml = latex_to_mathml_convert(latex_expr.strip())
        return mathml
    except Exception:
        return None

if __name__ == '__main__':
    try:
        # Read LaTeX expressions from stdin as JSON array
        input_data = sys.stdin.read()
        latex_list = json.loads(input_data)
        
        # Convert each LaTeX expression to MathML
        mathml_list = [latex_to_mathml(latex) for latex in latex_list]
        
        # Output as JSON array
        print(json.dumps(mathml_list))
        sys.exit(0)
    except Exception as e:
        print(json.dumps([None] * len(latex_list) if 'latex_list' in locals() else []), file=sys.stderr)
        sys.exit(1)



