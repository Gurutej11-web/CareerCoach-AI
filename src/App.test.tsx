import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the CareerCoach AI landing page', () => {
  render(<App />);
  const heading = screen.getByText(/AI career coach in your corner/i);
  expect(heading).toBeInTheDocument();
});
