var hints = [{id: "a87674afactoringpoly13a-h1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["7"], dependencies: [], title: "Looking for a GCF", text: "Is there a greatest common factor? Enter the greatest common factor or 0 if there isn't one.", variabilization: {}}, {id: "a87674afactoringpoly13a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3"], dependencies: ["a87674afactoringpoly13a-h1"], title: "Factoring Polynomials", text: "Is this a binomial, trinomial, or are there more than 3 terms? How many different terms are there in the parentheses?", variabilization: {}}, {id: "a87674afactoringpoly13a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["1"], dependencies: ["a87674afactoringpoly13a-h2"], title: "Leading Coefficient", text: "Since this is a trinomial, what is the leading coefficient?", variabilization: {}}, {id: "a87674afactoringpoly13a-h4", type: "hint", dependencies: ["a87674afactoringpoly13a-h3"], title: "FOIL", text: "Undo the FOIL for the polynomial.", variabilization: {}}, {id: "a87674afactoringpoly13a-h5", type: "hint", dependencies: ["a87674afactoringpoly13a-h4"], title: "Factors for the leading coefficient", text: "Think about some factors that multiply to get $$x^2$$", variabilization: {}}, {id: "a87674afactoringpoly13a-h6", type: "hint", dependencies: ["a87674afactoringpoly13a-h5"], title: "Suggestions", text: "How about 1 and 1?", variabilization: {}}, {id: "a87674afactoringpoly13a-h7", type: "hint", dependencies: ["a87674afactoringpoly13a-h6"], title: "Factors for C", text: "What are some factors that can be multiplied to get -6?", variabilization: {}}, {id: "a87674afactoringpoly13a-h8", type: "hint", dependencies: ["a87674afactoringpoly13a-h7"], title: "Suggestions", text: "How about 3 and 2, and 1 and 2?", variabilization: {}}, {id: "a87674afactoringpoly13a-h9", type: "hint", dependencies: ["a87674afactoringpoly13a-h8"], title: "Factors for C", text: "What should the signs be for the factors of C?", variabilization: {}}, ]; export {hints};