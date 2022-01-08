var hints = [{id: "b1a137dddgre27a-h1", type: "hint", dependencies: [], title: "GCF of Terms", text: "Find the greatest common factor of all the terms of the polynomial.", variabilization: {}}, {id: "b1a137dddgre27a-h2", type: "hint", dependencies: ["b1a137dddgre27a-h1"], title: "Factor into Primes", text: "Factor $$8y$$ and 16 into primes. $$8y=2\\times2\\times2 y$$ $$16=2\\times2\\times2\\times2$$", variabilization: {}}, {id: "b1a137dddgre27a-h3", type: "hint", dependencies: ["b1a137dddgre27a-h2"], title: "Multiply Common Factors", text: "Multiply the terms shared by both expressions. $$GCF=2\\times2\\times2$$ $$GCF=8$$", variabilization: {}}, {id: "b1a137dddgre27a-h4", type: "hint", dependencies: ["b1a137dddgre27a-h3"], title: "Write each Term as a Product using GCF", text: "Rewrite $$8y$$ and 16 as products of their GCF, 8. $$8y+16$$ $$8y+8\\times2$$", variabilization: {}}, {id: "b1a137dddgre27a-h5", type: "hint", dependencies: ["b1a137dddgre27a-h4"], title: "Reverse Distributive Property", text: "Use the reverse Distributive Property to factor the expression. $$8\\left(y+2\\right)$$", variabilization: {}}, ]; export {hints};