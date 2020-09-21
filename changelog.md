# Changelog

## Beta v0.3
* Major optimizations for mobile views (still more to be done in the future)
    * Improved lesson layout
    * Improved problem card layout
    * Improved layout for hint button and feedback (better for mobile too)
* LaTeX improvements:
    * Changed LaTeX to double dollar sign `$$` to avoid issues when using `$`
    * Fixed LaTeX rendering for multiple choice answers
    * Fixed LaTeX rendering for hint and subhint titles
* Support for symbolic equality using a Computer Algebra System in js (Algebrite)
    * Removed old algebraic equality checker in favor of the symbolic equality check (symbolic equality is called `algebraic` now)
* Problem Pool Updates
    * Integrated problem pool for lessons 1.1-1.6
    * Debug mode for easy viewing of problems of interest
* Bug fixes:
    * Fixed a bug that did not allow hints to be closed due to the accordion style update
    * Removed the cursor tracker component which prevented users from highlighting text
    * Bottom out sub-hints for scaffold hints correctly generate

## Beta v0.23
* Enable LaTeX rendering for multiple choice questions
* Added Windows support for `npm run generate` (used to only support MacOS & Linux)

## Beta v0.22
* Updated README with algebra parser library documentation
* Reverted back to not auto-show first hint when help is requested
* Other hints collapse when a new hint is opened (accordion style)

## Beta v0.21
* Updated README
* Developers can now name id fields for problems, steps, hints, and subhints however they choose to. The only limitation is the file structure naming. Since JSON is unordered, the auto-indexer orders them based on alphabetical order (from a file ls). Therefore steps should be named in alphabetical order or manually indexed.

## Beta v0.2
* Changed `slope2a-h5` to be answer type algebra to accept equivalent fractions
* Real answers for answerType algebra are now interpreted by the algebra interpreter
* Removed `LOCKED` text for locked hints
* Resetting progress works correctly now
* Added a button to return to lesson selection
* Added optional precision field to problems to specify the number of digits to round to. Both real answers and parsed inputs will be rounded to this precision.
* Removed units from hint solutions
* Removed the debug 0 option
* Added confirmation to resetting progress
* Added bottom out subhints
* Added units next to answer textboxes
* Autoexpand first hint
* Must answer scaffolds before moving on to next hint
* Make semantic labels agree for hint dependencies
* Centered hint submit buttons

## TODO
* Randomly order hints adhering to dependency
* MC autoenumerate options, randomize (Not going to do because some figures have the answer choices in them)