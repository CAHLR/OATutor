var hints = [{id: "b1a381217systemeq2a-h1", type: "hint", dependencies: [], title: "Convert amounts into first equation", text: "Let's use \"q\" as the number of quarters and \"n\" as the number of nickels. Because the number of nickels is 6 less than 3 times the number of quarters, we can identify the first equation to be $$n=3q-6$$.", variabilization: {}}, {id: "b1a381217systemeq2a-h2", type: "hint", dependencies: ["b1a381217systemeq2a-h1"], title: "Convert amoutn into second equation", text: "Because the total amount of money is $7.30 and quarters are $0.25 and nickels are $0.05 we can determine that the second equation is $$0.25q+0.05n=7.3$$", variabilization: {}}, {id: "b1a381217systemeq2a-h3", type: "hint", dependencies: ["b1a381217systemeq2a-h2"], title: "Plug in", text: "We can plug in $$n=3q-6$$ using the second equation to get $$0.25q+\\operatorname{0.05}\\left(3q-6\\right)=7.3$$", variabilization: {}}, {id: "b1a381217systemeq2a-h4", type: "hint", dependencies: ["b1a381217systemeq2a-h3"], title: "Solve for a", text: "We can determine that the second equation simplified would be $$0.4q-0.3=7.3$$. We now isolate the variable \"q\" and get $$0.4q=7.6$$. Then, we can divide both sides by 0.4 to get $$q=19$$. There are 19 quarters.", variabilization: {}}, {id: "b1a381217systemeq2a-h5", type: "hint", dependencies: ["b1a381217systemeq2a-h4"], title: "Solve for c", text: "After solving for \"q\", we can plug that value into the first equation to get $$n=3(19)-6$$ which we can determine n to be 51.", variabilization: {}}, ]; export {hints};