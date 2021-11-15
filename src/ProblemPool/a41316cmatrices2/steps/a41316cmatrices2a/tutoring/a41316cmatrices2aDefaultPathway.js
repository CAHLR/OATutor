var hints = [{id: "a41316cmatrices2a-h1", type: "hint", dependencies: [], title: "Adding and Subtracting Matrices", text: "Given matrices A and B of like dimensions, addition and subtraction of A and B will produce matrix C or matrix D of the same dimension. \\n $$A+B=C$$ such that $$a_{ij}+b_{ij}=c_{ij}$$ \\n $$A-B=D$$ such that $$a_{ij}-b_{ij}=d_{ij}$$", variabilization: {}}, {id: "a41316cmatrices2a-h2", type: "hint", dependencies: ["a41316cmatrices2a-h1"], title: "Subtracting Corresponding Entries", text: "Since the dimension of the matrices are the same, we perform matrix subtraction $$A-B=D$$ such that $$a_{ij}-b_{ij}=d_{ij}$$", variabilization: {}}, {id: "a41316cmatrices2a-h3", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["-4"], dependencies: ["a41316cmatrices2a-h2"], title: "Subtracting Corresponding Entries", text: "We will start by subtracting the top left entry of D, $$d_{11}$$, from C, $$c_{11}$$. What is $$c_{11}-d_{11}$$?", variabilization: {}}, {id: "a41316cmatrices2a-h4", type: "scaffold", problemType: "TextBox", answerType: "arithmetic", hintAnswer: ["2"], dependencies: ["a41316cmatrices2a-h3"], title: "Subtracting Corresponding Entries", text: "We will next subtract the top right entry of D, $$d_{12}$$, from C, $$c_{12}$$. What is $$c_{12}-d_{12}$$?", variabilization: {}}, {id: "a41316cmatrices2a-h5", type: "hint", dependencies: ["a41316cmatrices2a-h4"], title: "Subtracting Corresponding Entries", text: "Repeat the same process for each corresponding entries to compute the subtraction between the two matrices.", variabilization: {}}, ]; export {hints};