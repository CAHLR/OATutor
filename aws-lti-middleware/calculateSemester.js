const { SESSION_SYSTEM } = require('@common/global-config')

const calculateSemester = (ms) => {
    const date = new Date(ms)
    const semesters = [
        {
            name: "Fall",
            start: 70,
            end: 100
        },
        {
            name: "Spring",
            start: 0,
            end: 45
        },
        {
            name: "Summer",
            start: 45,
            end: 70
        }
    ]
    const quarters = [
        {
            name: "Fall",
            start: 75,
            end: 100
        },
        {
            name: "Winter",
            start: 0,
            end: 30
        },
        {
            name: "Spring",
            start: 30,
            end: 55
        },
        {
            name: "Summer",
            start: 55,
            end: 75
        }
    ]

    const currentYear = date.getUTCFullYear()
    const nextYear = date.getUTCFullYear() + 1

    const _baseline = new Date(0)
    _baseline.setUTCFullYear(currentYear)
    const baseline = _baseline.getTime()

    const _eoy = new Date(0)
    _eoy.setUTCFullYear(nextYear)
    const eoy = _eoy.getTime()

    const progress = (ms - baseline) / (eoy - baseline) * 100

    const session = (SESSION_SYSTEM === "SEMESTER" ? semesters : quarters)
        .find(({ start, end }) => progress >= start && progress < end);

    return `${session.name} ${currentYear}`
}

module.exports = {
    calculateSemester
}
