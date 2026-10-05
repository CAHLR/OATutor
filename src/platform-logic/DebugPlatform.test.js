import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import DebugPlatform from './DebugPlatform';
import { ThemeContext } from '../config/config';

jest.mock('@generated/processed-content-pool/oatutor.json', () => ([
    { id: 'debug-problem-1', title: 'First problem', steps: [] },
    { id: 'debug-problem-2', title: 'Second problem', steps: [] },
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
        ReactDOM.render(
            <MemoryRouter>
                <ThemeContext.Provider value={context}>
                    <DebugPlatform
                        problemID={problemID}
                        saveProgress={jest.fn()}
                        history={{ push: jest.fn() }}
                    />
                </ThemeContext.Provider>
            </MemoryRouter>,
            container
        );
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
});
