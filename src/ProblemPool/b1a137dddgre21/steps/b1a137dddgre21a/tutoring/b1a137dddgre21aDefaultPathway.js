var hints = [{id: "b1a137dddgre21a-h1", type: "hint", dependencies: [], title: "Factor into Primes", text: "Factor each coefficient into primes and write the variables with exponents in expanded form. A prime number is a counting number greater than 1, whose only factors are 1 and itself. The first few prime numbers are: 2, 3, 5, 7, 11, 13, etc.", variabilization: {}}, {id: "b1a137dddgre21a-h2", type: "hint", dependencies: ["b1a137dddgre21a-h1"], title: "Factor First Expression", text: "$$35x^3=5\\times7 x x x$$", variabilization: {}}, {id: "b1a137dddgre21a-h3", type: "hint", dependencies: ["b1a137dddgre21a-h2"], title: "Factor Second Expression", text: "$$10x^4=5\\times2 x x x x$$", variabilization: {}}, {id: "b1a137dddgre21a-h4", type: "hint", dependencies: ["b1a137dddgre21a-h3"], title: "Factor Third Expression", text: "$$5x^5=5x x x x x$$", variabilization: {}}, {id: "b1a137dddgre21a-h5", type: "hint", dependencies: ["b1a137dddgre21a-h2", "b1a137dddgre21a-h3", "b1a137dddgre21a-h4"], title: "Identify Common Factors in each Column", text: "$$35x^3=5\\times7 x x x$$ $$10x^4=5\\times2 x x x x$$ $$5x^5=5x x x x x$$ 5, x, x, and x are shared by both expressions.", variabilization: {}}, {id: "b1a137dddgre21a-h6", type: "hint", dependencies: ["b1a137dddgre21a-h5"], title: "Multiply Common Factors", text: "Bring down the 5, x, x, and x, and then multiply. $$GCF=5x x x$$", variabilization: {}}, {id: "b1a137dddgre21a-h7", type: "hint", dependencies: ["b1a137dddgre21a-h6"], title: "Multiply Common Factors", text: "$$GCF=5x^3$$", variabilization: {}}, ]; export {hints};