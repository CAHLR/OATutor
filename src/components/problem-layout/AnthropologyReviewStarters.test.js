import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import AnthropologyReviewStarters from './AnthropologyReviewStarters';

const anthropology = { courseName: 'Anthropology: Reading Review', officeHours: true };
let container;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
});

afterEach(() => {
    act(() => { ReactDOM.unmountComponentAtNode(container); });
    container.remove();
});

function render(props = {}) {
    act(() => {
        ReactDOM.render(<AnthropologyReviewStarters lesson={anthropology}
            messages={[{ role: 'assistant', content: 'Greeting' }]} onSelect={() => {}} {...props} />, container);
    });
}

it('offers the four Anthropology review topics and sends a natural quiz request', () => {
    const onSelect = jest.fn();
    render({ onSelect });
    const buttons = [...container.querySelectorAll('button')];
    expect(buttons.map((button) => button.textContent)).toEqual(['Text structure', 'Key arguments', 'Key terms', 'Mix it up']);
    act(() => buttons[0].click());
    expect(onSelect).toHaveBeenCalledWith('Quiz me on the overall structure of the text.');
    act(() => buttons[3].click());
    expect(onSelect).toHaveBeenLastCalledWith('Quiz me with a mix of text structure, key arguments, and key terms.');
});

it('does not appear for other Office Hours or regular Anthropology lessons', () => {
    render({ lesson: { courseName: 'Math', officeHours: true } });
    expect(container.querySelector('button')).toBeNull();
    render({ lesson: { courseName: anthropology.courseName, chat_display_mode: 'Full' } });
    expect(container.querySelector('button')).toBeNull();
});

it('disappears after a typed message or starter choice and returns for a fresh chat', () => {
    render({ messages: [{ role: 'user', content: 'My own question' }] });
    expect(container.querySelector('button')).toBeNull();
    render();
    expect(container.querySelectorAll('button')).toHaveLength(4);
});

it('disables choices while a request is active', () => {
    render({ disabled: true });
    expect([...container.querySelectorAll('button')].every((button) => button.disabled)).toBe(true);
});
