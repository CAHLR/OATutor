import update from './BKT-brain';

describe('BKT update', () => {
  it('updates mastery to about 0.55 when the student answers correctly', () => {
    const model = {
      probMastery: 0.1,
      probTransit: 0.1,
      probSlip: 0.1,
      probGuess: 0.1
    };

    update(model, true);

    expect(model.probMastery).toBeCloseTo(0.55, 5);
  });
});