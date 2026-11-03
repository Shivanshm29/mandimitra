import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../app/LanguageContext';
import { AuthProvider } from '../app/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>{ui}</AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

describe('Frontend Form Validations & Pages', () => {
  it('validates empty inputs on login submit', async () => {
    renderWithProviders(<LoginPage />);
    const form = screen.getByRole('button', { name: /लॉगिन करा/i }).closest('form')!;
    fireEvent.submit(form);

    expect(
      await screen.findByText(/कृपया सर्व आवश्यक माहिती भरा/i)
    ).toBeInTheDocument();
  });

  it('validates password mismatch on registration', async () => {
    renderWithProviders(<RegisterPage />);

    // Fill form with mismatched passwords
    const nameInput = screen.getByPlaceholderText(/तुकाराम पाटील/i);
    const usernameInput = screen.getByPlaceholderText(/tukaram_p/i);
    const villageInput = screen.getByPlaceholderText(/पिंपळगाव बसवंत/i);
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);

    fireEvent.change(nameInput, { target: { value: 'तुकाराम पाटील' } });
    fireEvent.change(usernameInput, { target: { value: 'tukaram_p' } });
    fireEvent.change(villageInput, { target: { value: 'पिंपळगाव' } });
    fireEvent.change(passwordInputs[0], { target: { value: 'secret123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'different123' } });

    const form = screen.getByRole('button', { name: /नोंदणी पूर्ण करा/i }).closest('form')!;
    fireEvent.submit(form);

    expect(
      await screen.findByText(/दोन्ही पासवर्ड जुळत नाहीत/i)
    ).toBeInTheDocument();
  });
});
