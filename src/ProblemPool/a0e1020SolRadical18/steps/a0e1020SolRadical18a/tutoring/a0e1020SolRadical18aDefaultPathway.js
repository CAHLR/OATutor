var hints = [{id: "a0e1020SolRadical18a-h1", type: "hint", dependencies: [], title: "Isolate the Radical", text: "Isolate the radical on one side of the equation. We can add 1 on both sides get $$\\sqrt[3]{9x-1}=-4$$ which has radicals isolated on one side.", variabilization: {}}, {id: "a0e1020SolRadical18a-h2", type: "hint", dependencies: ["a0e1020SolRadical18a-h1"], title: "Raise Both Sides Of the Equation To The Power Of The Index", text: "$${\\sqrt[3]{9x-1}}^3={\\left(-4\\right)}^3$$ After cubing both sides, we get $$9x-1=-64$$.", variabilization: {}}, {id: "a0e1020SolRadical18a-h3", type: "hint", dependencies: ["a0e1020SolRadical18a-h2"], title: "Check For Remaining Radicals", text: "Are there any more radicals? No. We can proceed to the next step.", variabilization: {}}, {id: "a0e1020SolRadical18a-h4", type: "hint", dependencies: ["a0e1020SolRadical18a-h3"], title: "Solve For Equation", text: "Solve for the equation $$9x-1=-64$$.", variabilization: {}}, {id: "a0e1020SolRadical18a-h5", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-7"], dependencies: ["a0e1020SolRadical18a-h4"], title: "Solve For Equation", text: "What is the value of x for $$9x-1=-64$$?", variabilization: {}}, ]; export {hints};