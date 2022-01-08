var hints = [{id: "b1a0cc26bpoly24a-h1", type: "hint", dependencies: [], title: "Distributive Property Explanation", text: "The distributive property is defined as when you multiply a number by a sum or difference, you have to multiply each term of of the sum or difference by that number.", variabilization: {}}, {id: "b1a0cc26bpoly24a-h2", type: "hint", dependencies: ["b1a0cc26bpoly24a-h1"], title: "Splitting Sums", text: "Split the $$\\frac{sum}{difference}$$ that has the least amount of terms into its individual terms, to use the distributive property with.", variabilization: {}}, {id: "b1a0cc26bpoly24a-h3", type: "hint", dependencies: ["b1a0cc26bpoly24a-h2"], title: "Splitting Sums", text: "In this case, we will split the $$4t^2-1$$ into $$4t^2$$ and -1.", variabilization: {}}, {id: "b1a0cc26bpoly24a-h4", type: "hint", dependencies: ["b1a0cc26bpoly24a-h3"], title: "Multiplying Individual Terms", text: "Multiply each term from the split difference to the other $$\\frac{sum}{difference}$$.", variabilization: {}}, {id: "b1a0cc26bpoly24a-h5", type: "hint", dependencies: ["b1a0cc26bpoly24a-h4"], title: "Multiplying Individual Terms", text: "In this case, we will multiple $$4t^2$$ by $$4t^2+t-7$$ and -1 by $$4t^2+t-7$$", variabilization: {}}, {id: "b1a0cc26bpoly24a-h6", type: "hint", dependencies: ["b1a0cc26bpoly24a-h5"], title: "Adding Terms", text: "Add all the terms generated after both multiplications and simplify like terms", variabilization: {}}, {id: "b1a0cc26bpoly24a-h7", type: "hint", dependencies: ["b1a0cc26bpoly24a-h6"], title: "Adding Terms", text: "In this case, we will add $$16t^4$$, $$4t^3$$, $$-28t^2$$, $$-4t^2$$, -t, and 7.", variabilization: {}}, {id: "b1a0cc26bpoly24a-h8", type: "hint", dependencies: ["b1a0cc26bpoly24a-h7"], title: "Simplification", text: "Simplify like terms in the sum. Like terms are terms of the same degree.", variabilization: {}}, {id: "b1a0cc26bpoly24a-h9", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$16t^4+4t^3-32t^2-t+7$$"], dependencies: ["b1a0cc26bpoly24a-h8"], title: "Simplification", text: "After simplification, what is the final polynomial result?", variabilization: {}}, ]; export {hints};