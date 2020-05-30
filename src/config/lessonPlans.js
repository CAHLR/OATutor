var lessonPlans = [
  {
    id: "lesson1",
    name: "Lesson 1",
    topics: "Pythagorean Theorem",
    allowRecycle: true,
    learningObjectives: {
      pythagorean: 0.95
    }
  }, {
    id: "lesson2",
    name: "Lesson 2",
    topics: "Circles",
    allowRecycle: false,
    learningObjectives: {
      circle: 0.90
    }
  }, {
    id: "lesson3",
    name: "Lesson 3",
    topics: "Slope",
    allowRecycle: false,
    learningObjectives: {
      slope: 0.95
    }
  }, {
    id: "lesson4",
    name: "Lesson 4",
    topics: "Cumulative Review",
    allowRecycle: false,
    learningObjectives: {
      pythagorean: 0.95,
      circle: 0.95,
      slope: 0.95
    }
  },
];

export default lessonPlans;