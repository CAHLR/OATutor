var algebraCheckOptions = {
    // These default to true, but are included to be explicit
    add: true,
    concatenate: true,
    conditional: true,
    divide: true,
    factorial: true,
    multiply: true,
    power: true,
    remainder: true,
    subtract: true,

    // Disable and, or, not, <, ==, !=, etc.
    logical: false,
    comparison: false,

    // Disable 'in' and = operators
    'in': false,
    assignment: false
}

export default algebraCheckOptions;