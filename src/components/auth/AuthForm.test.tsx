import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthForm from './AuthForm';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <NotificationProvider>
        <AuthProvider>
          <AuthForm />
        </AuthProvider>
      </NotificationProvider>
    </MemoryRouter>
  );
}

// Regression test: AuthForm previously ignored the route and always showed
// the login form, even when the user navigated to /signup.
describe('AuthForm', () => {
  test('shows the login form at /login', () => {
    renderAt('/login');
    expect(screen.getByText(/login to your account/i)).toBeInTheDocument();
  });

  test('shows the signup form at /signup', () => {
    renderAt('/signup');
    expect(screen.getByText(/create an account/i)).toBeInTheDocument();
  });
});
