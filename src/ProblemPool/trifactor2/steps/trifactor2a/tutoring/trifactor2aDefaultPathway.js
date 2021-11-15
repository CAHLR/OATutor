var hints = [{id: "trifactor2a-h1", type: "hint", dependencies: [], title: "Perfect Square Trinomials Pattern", text: "The trinomial fits the perfect square trinomials pattern $$a^2+2a b+b^2$$ because the first and last terms are perfect squares and the middle term matches $$2a b$$.", variabilization: {}}, {id: "trifactor2a-h2", type: "hint", dependencies: ["trifactor2a-h1"], title: "Square of the Binomial", text: "Take the perfect squares of the first and last term and write is as a binomial so you will get $${\\left(2x+3\\right)}^2$$.", variabilization: {}}, {id: "trifactor2a-h3", type: "hint", dependencies: ["trifactor2a-h2"], title: "Checking Binomial", text: "Check if the squared binomial multiplies out into the original trinomial.", variabilization: {}}, ]; export {hints};