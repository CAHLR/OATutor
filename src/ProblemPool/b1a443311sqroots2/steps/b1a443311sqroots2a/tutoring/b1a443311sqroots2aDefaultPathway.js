var hints = [{id: "b1a443311sqroots2a-h1", type: "hint", dependencies: [], title: "Split", text: "Split the numerator into the product of two square roots, one of which can be simplified to a single number such as $$\\sqrt{4}$$ or $$\\sqrt{16}$$.", variabilization: {}}, {id: "b1a443311sqroots2a-h2", type: "hint", dependencies: ["b1a443311sqroots2a-h1"], title: "Simplify", text: "Now, simplify the radical so that there is a product of a constant and a square root.", variabilization: {}}, {id: "b1a443311sqroots2a-h3", type: "hint", dependencies: ["b1a443311sqroots2a-h2"], title: "Remove common factors", text: "Remove the common factors of the numerator and denominator by dividing them out.", variabilization: {}}, {id: "b1a443311sqroots2a-h4", type: "hint", dependencies: ["b1a443311sqroots2a-h3"], title: "Answer", text: "The answer is $$\\frac{\\sqrt{2}}{2}$$.", variabilization: {}}, ]; export {hints};