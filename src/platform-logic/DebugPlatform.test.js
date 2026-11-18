import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { DebugPlatform, getScopedDebugProblemIDs } from './DebugPlatform';
import { ThemeContext } from '../config/config';

jest.mock('@generated/processed-content-pool/oatutor.json', () => ([
    { id: 'debug-problem-1', title: 'First problem', courseName: 'Course A', lessonId: 'lesson-1', steps: [] },
    { id: 'debug-problem-2', title: 'Second problem', courseName: 'Course A', lessonId: 'lesson-1', steps: [] },
    { id: 'debug-problem-3', title: 'Another lesson', courseName: 'Course A', lessonId: 'lesson-2', steps: [] },
]));

jest.mock('@components/problem-layout/ProblemWrapper.js', () => (props) => (
    <div data-testid="debug-problem">{props.problem.id}</div>
));

jest.mock('@components/BrandLogoNav', () => () => <div>OATutor</div>);

describe('DebugPlatform problem navigation', () => {
    let container;
    let context;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        context = {
            debug: false,
            problemID: 'n/a',
            problemIDs: null,
            skillModel: {},
            bktParams: {},
            heuristic: jest.fn(),
        };
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(container);
        container.remove();
    });

    const renderProblem = (problemID) => {
        const history = { push: jest.fn() };
        ReactDOM.render(
            <MemoryRouter>
                <ThemeContext.Provider value={context}>
                    <DebugPlatform
                        problemID={problemID}
                        saveProgress={jest.fn()}
                        history={history}
                    />
                </ThemeContext.Provider>
            </MemoryRouter>,
            container
        );
        return history;
    };

    it('switches debug problems when the route problem ID changes without reloading the app', () => {
        renderProblem('debug-problem-1');
        expect(container.querySelector('[data-testid="debug-problem"]').textContent)
            .toBe('debug-problem-1');

        renderProblem('debug-problem-2');
        expect(container.querySelector('[data-testid="debug-problem"]').textContent)
            .toBe('debug-problem-2');
        expect(context.problemID).toBe('debug-problem-2');
    });

    it('keeps Previous and Next within the current lesson and returns Home to the directory', () => {
        const history = renderProblem('debug-problem-1');
        const buttons = Array.from(container.querySelectorAll('button'));
        const home = buttons.find((button) => button.textContent === 'Home');
        const previous = buttons.find((button) => button.textContent === 'Previous Problem');
        const next = buttons.find((button) => button.textContent === 'Next Problem');

        expect(context.problemIDs).toEqual(['debug-problem-1', 'debug-problem-2']);
        expect(previous.disabled).toBe(true);
        expect(next.disabled).toBe(false);

        home.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(history.push).toHaveBeenCalledWith('/debug');
    });
});

describe('getScopedDebugProblemIDs', () => {
    it('uses every problem as a fallback when legacy content has no lesson ID', () => {
        const problems = [{ id: 'p1' }, { id: 'p2' }];
        expect(getScopedDebugProblemIDs(problems, problems[0])).toEqual(['p1', 'p2']);
    });
});
