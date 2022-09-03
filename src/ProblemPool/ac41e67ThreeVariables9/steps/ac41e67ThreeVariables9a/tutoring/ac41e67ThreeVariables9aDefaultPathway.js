var hints = [{id: "ac41e67ThreeVariables9a-h1", type: "hint", dependencies: [], title: "Calculation", text: "Multiply the second equation by 3 and add the first equation to it: $$3\\left(x-3y+z\\right)+x+2y-3z=3\\times1-1$$", variabilization: {}}, {id: "ac41e67ThreeVariables9a-h2", type: "hint", dependencies: ["ac41e67ThreeVariables9a-h1"], title: "Calculation", text: "The equation becomes $$4x-7y=2$$", variabilization: {}}, {id: "ac41e67ThreeVariables9a-h3", type: "hint", dependencies: ["ac41e67ThreeVariables9a-h2"], title: "Calculation", text: "Multiply the second equation by 2 and add the third equation to it: $$2\\left(x-3y+z\\right)+2x+y-2z=2\\times1+2$$", variabilization: {}}, {id: "ac41e67ThreeVariables9a-h4", type: "hint", dependencies: ["ac41e67ThreeVariables9a-h3"], title: "Calculation", text: "The equation becomes $$4x-7y=4$$", variabilization: {}}, {id: "ac41e67ThreeVariables9a-h5", type: "hint", dependencies: ["ac41e67ThreeVariables9a-h4"], title: "Subtraction", text: "Subtract $$4x-7y=2$$ with $$4x-7y=4$$. $$(4x-7y)-(4x-7y)=2-4$$", variabilization: {}}, {id: "ac41e67ThreeVariables9a-h6", type: "hint", dependencies: ["ac41e67ThreeVariables9a-h5"], title: "Subtraction", text: "The equation becomes $$0=-2$$, which is a false statement", variabilization: {}}, ]; export {hints};