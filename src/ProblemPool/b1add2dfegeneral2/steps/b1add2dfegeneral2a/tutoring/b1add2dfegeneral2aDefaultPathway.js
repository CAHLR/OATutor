var hints = [{id: "b1add2dfegeneral2a-h1", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Yes"], dependencies: [], title: "Is there a greatest common factor?", text: "", choices: ["Yes", "No"], variabilization: {}}, {id: "b1add2dfegeneral2a-h2", type: "hint", dependencies: ["b1add2dfegeneral2a-h1"], title: "GCF", text: "Factor out the greatest common factor", variabilization: {}}, {id: "b1add2dfegeneral2a-h3", type: "scaffold", problemType: "MultipleChoice", answerType: "string", hintAnswer: ["Binomial"], dependencies: ["b1add2dfegeneral2a-h2"], title: "Is the polynomial a binomial, trinomial, or are there more than three terms?", text: "", choices: ["Binomial", "Trinomial", "Other"], variabilization: {}}, {id: "b1add2dfegeneral2a-h4", type: "hint", dependencies: ["b1add2dfegeneral2a-h3"], title: "Binomial", text: "Since it's a binomial, check to see whether the expression is a sum or difference.", variabilization: {}}, {id: "b1add2dfegeneral2a-h5", type: "hint", dependencies: ["b1add2dfegeneral2a-h4"], title: "Difference of squares", text: "Factor as the product of conjugates. $$a^2-b^2=\\left(a-b\\right) \\left(a+b\\right)$$", variabilization: {}}, {id: "b1add2dfegeneral2a-h6", type: "hint", dependencies: ["b1add2dfegeneral2a-h5"], title: "Check", text: "Is it factored completely? Do the factors multiply back to the original polynomial?", variabilization: {}}, ]; export {hints};