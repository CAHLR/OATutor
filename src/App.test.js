import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { getStudentDisplayName } from './util/getStudentDisplayName';

// These packages are ESM-only, while this project's Jest setup expects
// CommonJS dependencies. Markdown rendering is outside the scope of these
// App smoke and display-name tests, so use lightweight stand-ins here.
jest.mock('react-markdown', () => ({ children }) => children || null);
jest.mock('remark-math', () => () => {});
jest.mock('remark-gfm', () => () => {});
jest.mock('rehype-katex', () => () => {});
jest.mock('@components/Firebase.js', () => jest.fn());

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App/>, div);
  ReactDOM.unmountComponentAtNode(div);
});

describe('getStudentDisplayName', () => {
  it('prefers the actual LMS-provided name when available', () => {
    expect(getStudentDisplayName({ studentName: 'Alice%20Example', user: { full_name: 'Bob' }, jwt: 'token' }, 'Not logged in', 'Logged in')).toBe('Alice Example');
  });

  it('shows a logged-in fallback when the user is authenticated but no name was passed', () => {
    expect(getStudentDisplayName({ user: { full_name: 'Student' }, jwt: 'token' }, 'Not logged in', 'Logged in')).toBe('Student');
    expect(getStudentDisplayName({ user: { full_name: '' }, jwt: 'token' }, 'Not logged in', 'Logged in')).toBe('Logged in');
  });

  it('shows not logged in when there is no authenticated user', () => {
    expect(getStudentDisplayName({}, 'Not logged in', 'Logged in')).toBe('Not logged in');
  });
});
