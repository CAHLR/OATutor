var hints = [{id: "a87674afactoringpoly2a-h1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["0"], dependencies: [], title: "Factoring Polynomials", text: "Is there a greatest common factor? Enter the greatest common factor or 0 if there isn't one.", variabilization: {}}, {id: "a87674afactoringpoly2a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["3"], dependencies: ["a87674afactoringpoly2a-h1"], title: "Terms", text: "Is this a binomial, trinomial, or are there more than 3 terms? How many different terms are there?", variabilization: {}}, {id: "a87674afactoringpoly2a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["8"], dependencies: ["a87674afactoringpoly2a-h2"], title: "Leading Coefficient", text: "Since this is a trinomial, what is the leading coefficient?", variabilization: {}}, {id: "a87674afactoringpoly2a-h4", type: "hint", dependencies: ["a87674afactoringpoly2a-h3"], title: "FOIL", text: "Undo the FOIL for the polynomial.", variabilization: {}}, {id: "a87674afactoringpoly2a-h5", type: "hint", dependencies: ["a87674afactoringpoly2a-h4"], title: "Finished?", text: "Is this polynomial factorable or completely simplified?", variabilization: {}}, ]; export {hints};