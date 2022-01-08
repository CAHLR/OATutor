var hints = [{id: "b1a137dddgre24a-h1", type: "hint", dependencies: [], title: "GCF of Terms", text: "Find the greatest common factor of all the terms of the polynomial.", variabilization: {}}, {id: "b1a137dddgre24a-h2", type: "hint", dependencies: ["b1a137dddgre24a-h1"], title: "Factor into Primes", text: "Factor $$5a$$ and 5 into primes. $$5a=5a$$ $$5=5$$", variabilization: {}}, {id: "b1a137dddgre24a-h3", type: "hint", dependencies: ["b1a137dddgre24a-h2"], title: "Multiply Common Factors", text: "Multiply the terms shared by both expressions. $$GCF=5$$", variabilization: {}}, {id: "b1a137dddgre24a-h4", type: "hint", dependencies: ["b1a137dddgre24a-h3"], title: "Write each Term as a Product using GCF", text: "Rewrite $$5a$$ and 5 as products of their GCF, 5. $$5a+5$$ $$5a+5\\times1$$", variabilization: {}}, {id: "b1a137dddgre24a-h5", type: "hint", dependencies: ["b1a137dddgre24a-h4"], title: "Reverse Distributive Property", text: "Use the reverse Distributive Property to factor the expression. $$5\\left(a+1\\right)$$", variabilization: {}}, ]; export {hints};