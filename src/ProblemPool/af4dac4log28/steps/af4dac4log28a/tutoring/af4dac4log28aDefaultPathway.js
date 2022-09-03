var hints = [{id: "af4dac4log28a-h1", type: "hint", dependencies: [], title: "Use Log Rules", text: "Logarithm multiplication rule: $$\\log_{a}\\left(b\\right)+\\log_{a}\\left(c\\right)=\\log_{a}\\left(b c\\right)$$. $$\\log_{10}\\left(x\\right)+\\log_{10}\\left(x+3\\right)=\\log_{10}\\left(x \\left(x+3\\right)\\right)$$", variabilization: {}}, {id: "af4dac4log28a-h2", type: "hint", dependencies: ["af4dac4log28a-h1"], title: "Turn the Constant into log", text: "$$1=\\log_{10}\\left(10\\right)$$", variabilization: {}}, {id: "af4dac4log28a-h3", type: "hint", dependencies: ["af4dac4log28a-h2"], title: "Match Bases", text: "With all term containing same log base, the log can be removed, so it becomes $$x \\left(x+3\\right)=10$$. We can simplify it into $$x^2+3x-10=0$$. We can factor the quadratic and get $$\\left(x+5\\right) \\left(x-2\\right)=0$$ which has $$x=-5$$ and $$x=2$$ as solutions.", variabilization: {}}, {id: "af4dac4log28a-h4", type: "hint", dependencies: ["af4dac4log28a-h3"], title: "Check for Constrains", text: "Given $$\\log_{a}\\left(b\\right)$$, b can not be negative. We can omit the negative answer and get $$x=2$$ as the only solution for the equation.", variabilization: {}}, ]; export {hints};