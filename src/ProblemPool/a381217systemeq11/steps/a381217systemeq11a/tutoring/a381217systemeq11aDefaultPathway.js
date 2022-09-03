var hints = [{id: "a381217systemeq11a-h1", type: "hint", dependencies: [], title: "Convert amounts into first equation", text: "Let's use \"a\" as the number of adult tickets and \"c\" as the number of childrens tickets. The total number of tickets combined is 253, therefore we can determine that the first equation is $$a+c=253$$", variabilization: {}}, {id: "a381217systemeq11a-h2", type: "hint", dependencies: ["a381217systemeq11a-h1"], title: "Convert amoutn into second equation", text: "Because the total amount of money made was $2,771 and adult tickets are $15 and childrens $7 we can determine that the second equation is $$15a+7c=2, 771$$", variabilization: {}}, {id: "a381217systemeq11a-h3", type: "hint", dependencies: ["a381217systemeq11a-h2"], title: "Isolate Variable", text: "Let's use the first equation to isolate c. With the equation, we can subtract a from both sides to get $$c=253-a$$", variabilization: {}}, {id: "a381217systemeq11a-h4", type: "hint", dependencies: ["a381217systemeq11a-h3"], title: "Plug in", text: "We can plug in $$c=253-a$$ using the second equation to get $$15a+7\\left(253-a\\right)=2, 771$$", variabilization: {}}, {id: "a381217systemeq11a-h5", type: "hint", dependencies: ["a381217systemeq11a-h4"], title: "Solve for a", text: "We can determine that the second equation after plugging in \"c\" would be 8a+1,771=2,771. We now isolate the variable \"a\" and get $$8a=1000$$. Then, we can divide both sides by 8 to get $$a=125$$.", variabilization: {}}, {id: "a381217systemeq11a-h6", type: "hint", dependencies: ["a381217systemeq11a-h5"], title: "Solve for c", text: "After solving for \"a\", we can plug that value into the first equation to get $$125+c=253$$ which we can determine \"c\" to be 128.", variabilization: {}}, ]; export {hints};