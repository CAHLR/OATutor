var hints = [{id: "b1a1a1ee1measure28a-h1", type: "hint", dependencies: [], title: "Relating gal to L", text: "We don't know the conversion between gallons and liters right away, but we do know the conversion from gallons to quart and the conversion from quart to liters.Therefore, we can convert the measurement into quarts first, then convert it into liters.", variabilization: {}}, {id: "b1a1a1ee1measure28a-h2", type: "hint", dependencies: ["b1a1a1ee1measure28a-h1"], title: "Relating gal to qt.", text: "The conversion from gallons to quarts is 1 $$gal=4$$ qt.", variabilization: {}}, {id: "b1a1a1ee1measure28a-h3", type: "hint", dependencies: ["b1a1a1ee1measure28a-h2"], title: "Multiply by 1", text: "The first step is to multiply the measurement to be converted by 1; write 1 as a fraction relating the units given and the units needed.", variabilization: {}}, {id: "b1a1a1ee1measure28a-h4", type: "hint", dependencies: ["b1a1a1ee1measure28a-h3"], title: "Writing 1 as a Fraction", text: "Using the relation between gal and qt., we can rewrite the 1 we multiply in the last step as (4 qt.)/(1 gal), so we get the expression (14 gal)*(4 qt.)/(1 gal).", variabilization: {}}, {id: "b1a1a1ee1measure28a-h5", type: "hint", dependencies: ["b1a1a1ee1measure28a-h4"], title: "Simplifying", text: "gal divides out, so we get the expression (14)*(4 qt.)/(1).", variabilization: {}}, {id: "b1a1a1ee1measure28a-h6", type: "hint", dependencies: ["b1a1a1ee1measure28a-h5"], title: "Multiplying", text: "Multiplying the expression, we get 14 $$gal=56$$ qt.", variabilization: {}}, {id: "b1a1a1ee1measure28a-h7", type: "hint", dependencies: ["b1a1a1ee1measure28a-h6"], title: "Converting qt. to L", text: "Our next step is to convert 56 qt. into liters.", variabilization: {}}, {id: "b1a1a1ee1measure28a-h8", type: "hint", dependencies: ["b1a1a1ee1measure28a-h7"], title: "Relating qt. to liters", text: "The conversion from quarts to liters is 1 $$qt.=0.95$$ L.", variabilization: {}}, {id: "b1a1a1ee1measure28a-h9", type: "hint", dependencies: ["b1a1a1ee1measure28a-h8"], title: "Multiply by 1", text: "The first step is to multiply the measurement to be converted by 1; write 1 as a fraction relating the units given and the units needed.", variabilization: {}}, {id: "b1a1a1ee1measure28a-h10", type: "hint", dependencies: ["b1a1a1ee1measure28a-h9"], title: "Writing 1 as a Fraction", text: "Using the relation between qt. and L, we can rewrite the 1 we multiply in the last step as (0.95 L)/(1 qt.), so we get the expression (56 qt.)*(0.95 L)/(1 qt.).", variabilization: {}}, {id: "b1a1a1ee1measure28a-h11", type: "hint", dependencies: ["b1a1a1ee1measure28a-h10"], title: "Simplifying", text: "qt. divides out, so we get the expression (56)*(0.95 L)/(1).", variabilization: {}}, {id: "b1a1a1ee1measure28a-h12", type: "hint", dependencies: ["b1a1a1ee1measure28a-h11"], title: "Multiplying", text: "Multiplying the expression, we get the final answer 53.2 L.", variabilization: {}}, ]; export {hints};