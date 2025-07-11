import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react'; // ✅ use act from React Testing Library
import * as api from '../../services/api';
import Leaderboard from '../Leaderboard';
import '@testing-library/jest-dom';
jest.mock('../../services/api');

const mockLeaderboard = {
  data: [
    { id: 'emp001', name: 'Alice', score: 95 },
    { id: 'emp002', name: 'Bob', score: 88 },
  ],
};

describe('Leaderboard Component', () => {
  test('renders top employees', async () => {
    api.getLeaderboard.mockResolvedValue(mockLeaderboard); // ✅ Confirmed name matches API file

    await act(async () => {
      render(<Leaderboard />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Alice/i)).toBeInTheDocument();
      expect(screen.getByText(/Bob/i)).toBeInTheDocument();
    });
  });

  test('shows error when API fails', async () => {
    api.getLeaderboard.mockRejectedValue(new Error('API down'));

    await act(async () => {
      render(<Leaderboard />);
    });

    await waitFor(() => {
      expect(screen.getByText(/API down/i)).toBeInTheDocument();
    });
  });

  test('displays fallback if no data', async () => {
    api.getLeaderboard.mockResolvedValue({ data: [] });

    await act(async () => {
      render(<Leaderboard />);
    });

    await waitFor(() => {
      expect(screen.getByText(/No leaderboard data available/i)).toBeInTheDocument();
    });
  });
});
