import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { getStudentDisplayName } from './util/getStudentDisplayName';

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
