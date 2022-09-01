var hints = [{id: "a7da84cCompInv16a-h1", type: "hint", dependencies: [], title: "reverse functions definition", text: "The functions are inverses of each other if $$g((f(x))=x$$ and $$g(f(x))=x$$", variabilization: {}}, {id: "a7da84cCompInv16a-h2", type: "hint", dependencies: ["a7da84cCompInv16a-h1"], title: "Substitute 5x-1 for f(x)", text: "Check if g(5x-1) $$=$$ x", variabilization: {}}, {id: "a7da84cCompInv16a-h3", type: "hint", dependencies: ["a7da84cCompInv16a-h2"], title: "Find g(5x-1) where g(x) $$=$$ $$\\frac{x+1}{5}$$", text: "Check if $$\\frac{5x-1+1}{5}$$ $$=$$ x", variabilization: {}}, {id: "a7da84cCompInv16a-h4", type: "hint", dependencies: ["a7da84cCompInv16a-h3"], title: "Simplify", text: "$$\\frac{5x-1+1}{5}=\\frac{5x}{5}$$ $$=$$ x", variabilization: {}}, {id: "a7da84cCompInv16a-h5", type: "hint", dependencies: ["a7da84cCompInv16a-h4"], title: "Substitude $$\\frac{x+1}{5}$$ for g(x)", text: "Check if $$f{\\left(\\frac{x+1}{5}\\right)}$$ $$=$$ x", variabilization: {}}, {id: "a7da84cCompInv16a-h6", type: "hint", dependencies: ["a7da84cCompInv16a-h5"], title: "Find f((x+1/5) where $$f(x)=5x-1$$", text: "$$f{\\left(\\frac{x+1}{5}\\right)}=5\\left(\\frac{x+1}{5}\\right)$$ - $$1=x+1-1$$", variabilization: {}}, {id: "a7da84cCompInv16a-h7", type: "hint", dependencies: ["a7da84cCompInv16a-h6"], title: "Simplify", text: "$$x+1-1$$ $$=x$$", variabilization: {}}, ]; export {hints};