var hints = [{id: "a746c1bfactoringpoly3a-h1", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["$$x^3$$"], dependencies: [], title: "Looking for a GCF", text: "Is there a greatest common factor? Enter the greatest common factor or 0 if there isn't one.", variabilization: {}}, {id: "a746c1bfactoringpoly3a-h2", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["2"], dependencies: ["a746c1bfactoringpoly3a-h1"], title: "Identifying terms", text: "Is this a binomial, trinomial, or are there more than 3 terms? How many different terms are there in the parentheses?", variabilization: {}}, {id: "a746c1bfactoringpoly3a-h3", type: "hint", dependencies: ["a746c1bfactoringpoly3a-h2"], title: "Squares", text: "Since this is a binomial, is it a sum of squares or difference of squares?", variabilization: {}}, {id: "a746c1bfactoringpoly3a-h4", type: "hint", dependencies: ["a746c1bfactoringpoly3a-h3"], title: "Finished?", text: "Sum of squares cannot be factored anymore.", variabilization: {}}, ]; export {hints};