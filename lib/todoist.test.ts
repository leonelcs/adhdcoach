import { getUserToken } from './todoist'; // Adjust path as necessary
import { prisma } from './prisma';
import { Session } from 'next-auth';

// Mock Prisma
jest.mock('./prisma', () => ({
  prisma: {
    todoistToken: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock environment variable
const mockEnv = {
  TODOIST_API_TOKEN: 'env_token_123',
};
let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  // Save original process.env
  originalEnv = { ...process.env };
  // Set the mock environment variables
  process.env = {
    ...originalEnv,
    ...mockEnv,
  };
  // Reset mocks before each test
  (prisma.todoistToken.findUnique as jest.Mock).mockReset();
});

afterEach(() => {
  // Restore original process.env
  process.env = originalEnv;
});

describe('getUserToken', () => {
  const mockSession: Session = {
    user: { id: 'user_123', email: 'test@example.com', name: 'Test User' },
    expires: '2025-01-01T00:00:00.000Z',
  };

  const mockSessionNoId: Session = {
    user: { email: 'test@example.com', name: 'Test User' }, // No ID
    expires: '2025-01-01T00:00:00.000Z',
  };


  test('should return token from Prisma if found', async () => {
    (prisma.todoistToken.findUnique as jest.Mock).mockResolvedValue({
      token: 'prisma_token_456',
      userId: 'user_123',
    });

    const result = await getUserToken(mockSession);
    expect(result).toEqual({ token: 'prisma_token_456', userId: 'user_123' });
    expect(prisma.todoistToken.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user_123' },
    });
  });

  test('should return environment token if Prisma token not found', async () => {
    (prisma.todoistToken.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getUserToken(mockSession);
    expect(result).toEqual({ token: 'env_token_123', userId: 'user_123' });
  });

  test('should throw "Not authenticated" if session is null', async () => {
    await expect(getUserToken(null)).rejects.toThrow('Not authenticated');
  });

  test('should throw "Not authenticated" if session user ID is missing', async () => {
    // Create a session object without a user ID
    const sessionWithoutUserId: Session = {
        ...mockSession,
        user: { ...mockSession.user, id: undefined as any }, // Or simply omit id if type allows
      };
    await expect(getUserToken(sessionWithoutUserId)).rejects.toThrow('Not authenticated');
  });
  
  test('should throw "Not authenticated" if session user is missing', async () => {
    const sessionWithoutUser: Session = {
        // @ts-expect-error
        user: undefined,
        expires: '2025-01-01T00:00:00.000Z',
      };
    await expect(getUserToken(sessionWithoutUser)).rejects.toThrow('Not authenticated');
  });


  test('should throw "No Todoist token available" if no token in Prisma and no env token', async () => {
    (prisma.todoistToken.findUnique as jest.Mock).mockResolvedValue(null);
    delete process.env.TODOIST_API_TOKEN; // Remove env token for this test

    await expect(getUserToken(mockSession)).rejects.toThrow('No Todoist token available');
  });
});
