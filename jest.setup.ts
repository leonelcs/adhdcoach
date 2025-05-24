import { getServerSession } from 'next-auth/next';

// tell Jest to mock the entire module
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// now provide a default resolved value for every test
;(getServerSession as jest.Mock).mockResolvedValue({
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: null
  }
});

// This file can be used for global setup, like mocks or initializations.
// For now, it can be left empty.
