import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Leaderboard from '../Leaderboard';
import * as api from '../../services/api'; // To mock getLeaderboard

// Mock the api module
jest.mock('../../services/api');

describe('Leaderboard Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    api.getLeaderboard.mockResolvedValueOnce({ data: [] }); // Mock an eventual empty response
    render(<Leaderboard />);
    expect(screen.getByText(/Loading Leaderboard.../i)).toBeInTheDocument();
  });

  test('renders leaderboard data successfully after loading', async () => {
    const mockLeaderboardData = [
      { rank: 1, employee_id: 'emp001', name: 'Alice Wonderland', awe_points: 500 },
      { rank: 2, employee_id: 'emp002', name: 'Bob The Builder', awe_points: 450 },
    ];
    api.getLeaderboard.mockResolvedValueOnce({ data: mockLeaderboardData });

    render(<Leaderboard />);

    // Wait for loading to disappear and data to appear
    await waitFor(() => expect(screen.queryByText(/Loading Leaderboard.../i)).not.toBeInTheDocument());

    expect(screen.getByText(/Employee Leaderboard/i)).toBeInTheDocument();
    expect(screen.getByText(/#1/i)).toBeInTheDocument();
    expect(screen.getByText(/Alice Wonderland/i)).toBeInTheDocument();
    expect(screen.getByText(/500 AwePs/i)).toBeInTheDocument();
    expect(screen.getByText(/Bob The Builder/i)).toBeInTheDocument();
    expect(screen.getByText(/450 AwePs/i)).toBeInTheDocument();
    expect(api.getLeaderboard).toHaveBeenCalledTimes(1);
    expect(api.getLeaderboard).toHaveBeenCalledWith(10); // Default limit
  });

  test('renders error message if API call fails', async () => {
    const errorMessage = 'Failed to fetch leaderboard. Is the backend running?';
    api.getLeaderboard.mockRejectedValueOnce(new Error(errorMessage));

    render(<Leaderboard />);

    await waitFor(() => expect(screen.queryByText(/Loading Leaderboard.../i)).not.toBeInTheDocument());

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  test('renders "No leaderboard data available" if API returns empty array', async () => {
    api.getLeaderboard.mockResolvedValueOnce({ data: [] });

    render(<Leaderboard />);

    await waitFor(() => expect(screen.queryByText(/Loading Leaderboard.../i)).not.toBeInTheDocument());

    expect(screen.getByText(/No leaderboard data available./i)).toBeInTheDocument();
  });

  test('renders correct number of list items for leaderboard entries', async () => {
    const mockLeaderboardData = [
      { rank: 1, employee_id: 'emp001', name: 'Alice', awe_points: 500, department: 'Eng' },
      { rank: 2, employee_id: 'emp002', name: 'Bob', awe_points: 450, department: 'Mkt' },
      { rank: 3, employee_id: 'emp003', name: 'Charlie', awe_points: 400, department: 'Sales' },
    ];
    api.getLeaderboard.mockResolvedValueOnce({ data: mockLeaderboardData });

    render(<Leaderboard />);
    await waitFor(() => expect(screen.queryByText(/Loading Leaderboard.../i)).not.toBeInTheDocument());

    // Check for list items. The component uses <li> elements.
    // A common way to get them is by role 'listitem' if the <ul> has a role 'list'.
    // Or by querying for specific text within them.
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(mockLeaderboardData.length);

    // Also verify some summary stats
    expect(screen.getByText(mockLeaderboardData.length.toString())).toBeInTheDocument(); // Total Employees
    expect(screen.getByText(mockLeaderboardData[0].awe_points.toString())).toBeInTheDocument(); // Top Score
  });

  test('displays department and champion/runner-up/third place tags correctly', async () => {
    const mockLeaderboardData = [
      { rank: 1, employee_id: 'emp001', name: 'Diana Prince', awe_points: 500, department: 'Justice League' },
      { rank: 2, employee_id: 'emp002', name: 'Bruce Wayne', awe_points: 450, department: 'Wayne Enterprises' },
      { rank: 3, employee_id: 'emp003', name: 'Clark Kent', awe_points: 400, department: 'Daily Planet' },
      { rank: 4, employee_id: 'emp004', name: 'Barry Allen', awe_points: 350, department: 'CSI' },
    ];
    api.getLeaderboard.mockResolvedValueOnce({ data: mockLeaderboardData });

    render(<Leaderboard />);
    await waitFor(() => expect(screen.queryByText(/Loading Leaderboard.../i)).not.toBeInTheDocument());

    // Check for Diana
    expect(screen.getByText('Diana Prince')).toBeInTheDocument();
    expect(screen.getByText('Justice League')).toBeInTheDocument();
    expect(screen.getByText(/Champion/i)).toBeInTheDocument();

    // Check for Bruce
    expect(screen.getByText('Bruce Wayne')).toBeInTheDocument();
    expect(screen.getByText('Wayne Enterprises')).toBeInTheDocument();
    expect(screen.getByText(/Runner-up/i)).toBeInTheDocument();

    // Check for Clark
    expect(screen.getByText('Clark Kent')).toBeInTheDocument();
    expect(screen.getByText('Daily Planet')).toBeInTheDocument();
    expect(screen.getByText(/Third Place/i)).toBeInTheDocument();

    // Check for Barry (no special tag)
    expect(screen.getByText('Barry Allen')).toBeInTheDocument();
    expect(screen.getByText('CSI')).toBeInTheDocument();
    expect(screen.queryByText(/Champion/i, { exact: false })).toBeVisible(); // Champion tag exists for Diana
    expect(screen.queryByText((content, element) =>
      element.textContent === 'Champion' && element.closest('li').textContent.includes('Barry Allen')
    )).toBeNull();

  });

  test('handles API response with missing optional fields gracefully', async () => {
    const mockDataMissingFields = [
      { rank: 1, employee_id: 'emp005', name: 'Kara Zor-El', awe_points: 480 }, // No department
      { rank: 2, employee_id: 'emp006', name: 'Oliver Queen', awe_points: 420, department: 'Queen Consolidated' },
    ];
    api.getLeaderboard.mockResolvedValueOnce({ data: mockDataMissingFields });

    render(<Leaderboard />);
    await waitFor(() => expect(screen.queryByText(/Loading Leaderboard.../i)).not.toBeInTheDocument());

    // Check for Kara (should render without department, no error)
    expect(screen.getByText('Kara Zor-El')).toBeInTheDocument();
    expect(screen.getByText('480 AwePs')).toBeInTheDocument();
    // Ensure department for Kara is not rendered, or its container is empty
    const karaListItem = screen.getByText('Kara Zor-El').closest('li');
    expect(karaListItem).toBeInTheDocument();
    // This depends on structure, but we can check that 'Queen Consolidated' (Oliver's dept) is NOT in Kara's item.
    // A more robust way would be to ensure no element with class 'department' or specific text for department.
    // For now, we assume if it's not there, it's not rendered.
    // Let's check that "Champion" tag is present for Kara
    expect(within(karaListItem).getByText(/Champion/i)).toBeInTheDocument();


    // Check for Oliver (should render with department)
    expect(screen.getByText('Oliver Queen')).toBeInTheDocument();
    expect(screen.getByText('Queen Consolidated')).toBeInTheDocument();
    expect(screen.getByText('420 AwePs')).toBeInTheDocument();
    const oliverListItem = screen.getByText('Oliver Queen').closest('li');
    expect(within(oliverListItem).getByText(/Runner-up/i)).toBeInTheDocument();
  });

  test('calls getLeaderboard with the default limit of 10', async () => {
    api.getLeaderboard.mockResolvedValueOnce({ data: [] });
    render(<Leaderboard />);
    await waitFor(() => expect(api.getLeaderboard).toHaveBeenCalled());
    expect(api.getLeaderboard).toHaveBeenCalledWith(10);
  });

});

// Helper to scope queries within an element
import { within } from '@testing-library/react';
```
