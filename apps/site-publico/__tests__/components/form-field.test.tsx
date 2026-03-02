/**
 * Testes para componente FormField
 */

import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormField, Validators } from '@/components/form-with-validation';

describe('FormField', () => {
  it('deve renderizar campo de input', () => {
    render(
      <FormField
        label="Nome"
        name="name"
        type="text"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  });

  it('deve validar email em tempo real', async () => {
    render(
      <FormField
        label="Email"
        name="email"
        type="email"
        value=""
        onChange={() => {}}
        validator={Validators.email}
      />
    );

    const input = screen.getByLabelText('Email') as HTMLInputElement;
    
    // Email inválido
    fireEvent.change(input, { target: { value: 'email-invalido' } });
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(screen.getByText(/E-mail inválido/i)).toBeInTheDocument();
    });

    // Email válido
    fireEvent.change(input, { target: { value: 'teste@example.com' } });
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(screen.queryByText(/E-mail inválido/i)).not.toBeInTheDocument();
    });
  });

  it('deve validar CPF em tempo real', async () => {
    render(
      <FormField
        label="CPF"
        name="cpf"
        type="text"
        value=""
        onChange={() => {}}
        validator={Validators.cpf}
      />
    );

    const input = screen.getByLabelText('CPF') as HTMLInputElement;
    
    // CPF inválido
    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(screen.getByText(/CPF deve ter 11 dígitos/i)).toBeInTheDocument();
    });

    // CPF válido
    fireEvent.change(input, { target: { value: '12345678909' } });
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(screen.queryByText(/CPF deve ter 11 dígitos/i)).not.toBeInTheDocument();
    });
  });

  it('deve validar telefone', async () => {
    render(
      <FormField
        label="Telefone"
        name="phone"
        type="tel"
        value=""
        onChange={() => {}}
        validator={Validators.phone}
      />
    );

    const input = screen.getByLabelText('Telefone') as HTMLInputElement;
    
    // Telefone inválido
    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(screen.getByText(/Telefone inválido/i)).toBeInTheDocument();
    });

    // Telefone válido
    fireEvent.change(input, { target: { value: '62999999999' } });
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(screen.queryByText(/Telefone inválido/i)).not.toBeInTheDocument();
    });
  });
});

