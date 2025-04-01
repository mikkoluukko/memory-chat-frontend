import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Chat } from '../Chat';

describe('Chat Component', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders chat interface', () => {
    render(<Chat />);
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('sends message and displays response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ response: 'AI response' })
    });

    render(<Chat />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('AI response')).toBeInTheDocument();
    });
  });

  it('handles error responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    render(<Chat />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Sorry, there was an error processing your message.')).toBeInTheDocument();
    });
  });
}); 