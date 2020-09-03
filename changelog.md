# Changelog

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