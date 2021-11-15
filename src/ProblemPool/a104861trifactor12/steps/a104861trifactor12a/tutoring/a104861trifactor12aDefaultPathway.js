var hints = [{id: "a104861trifactor12a-h1", type: "hint", dependencies: [], title: "Perfect Square Trinomials Pattern", text: "The trinomial fits the perfect square trinomials pattern $$a^2+\\left(2\\right) a b+b^2$$ because the first and last terms are perfect squares and the middle term matches $$\\left(2\\right) a b$$.", variabilization: {}}, {id: "a104861trifactor12a-h2", type: "hint", dependencies: ["a104861trifactor12a-h1"], title: "Square of the Binomial", text: "Take the perfect squares of the first and last term and write is as a binomial so you will get $${\\left(\\left(4\\right) y+\\left(3\\right)\\right)}^2$$. Notice how it's now subtraction since the original middle term was negative.", variabilization: {}}, {id: "a104861trifactor12a-h3", type: "hint", dependencies: ["a104861trifactor12a-h2"], title: "Checking Binomial", text: "Check if the squared binomial multiplies out into the original trinomial.", variabilization: {}}, ]; export {hints};