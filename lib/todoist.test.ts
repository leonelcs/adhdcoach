jest.mock('./todoist', () => {
  const originalModule = jest.requireActual('./todoist');
  return {
    __esModule: true,
    ...originalModule,
    getUserToken: jest.fn(),
  };
});

import { getTasks } from './todoist';
const { getUserToken: mockGetUserToken } = require('./todoist');
import { prisma } from './prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


jest.mock('next-auth/next');



// Mock Prisma
jest.mock('./prisma', () => ({
  prisma: {
    todoistToken: {
      findUnique: jest.fn(),
    },
  },
}));

(getServerSession as jest.Mock).mockResolvedValue({
  user: { id: 'test-user-id', email: 'test@example.com', name: 'Test User' }
});

// Mock authOptions (simple mock, adjust if complex structure is needed)
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {}, 
}));


// Mock environment variable
const mockEnv = {
  TODOIST_API_TOKEN: 'env_token_123',
};
let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  // restore env
  originalEnv = { ...process.env };
  process.env = { ...originalEnv, ...mockEnv };

  // reset Prisma mock
  (prisma.todoistToken.findUnique as jest.Mock).mockReset();

  // reset and re‐mock getServerSession
  (getServerSession as jest.Mock).mockReset();
  (getServerSession as jest.Mock).mockResolvedValue({
    user: { id: 'test-user-id', email: 'test@example.com', name: 'Test User' }
  });
});

afterEach(() => {
  process.env = originalEnv;
});

const { getUserToken: realGetUserToken } = jest.requireActual('./todoist');

describe('getUserToken', () => {
  // Define mock session objects that getServerSession might return
  const mockValidSession = {
    user: { id: 'user_123', email: 'test@example.com', name: 'Test User' },
    expires: '2025-01-01T00:00:00.000Z',
  };

  const mockSessionNoUserId = {
    user: { email: 'test@example.com', name: 'Test User' }, // No id
    expires: '2025-01-01T00:00:00.000Z',
  };
  
  const mockSessionNoUser = {
    // user is undefined
    expires: '2025-01-01T00:00:00.000Z',
  };

  test('should return token from Prisma if found', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockValidSession);
    (prisma.todoistToken.findUnique as jest.Mock).mockResolvedValue({
      token: 'prisma_token_456',
      userId: 'user_123',
    });

    const result = await realGetUserToken();
    expect(result).toEqual({ token: 'prisma_token_456', userId: 'user_123' });
    expect(getServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.todoistToken.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user_123' },
    });
  });

  test('should return environment token if Prisma token not found', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockValidSession);
    (prisma.todoistToken.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await realGetUserToken();
    expect(result).toEqual({ token: 'env_token_123', userId: 'user_123' });
    expect(getServerSession).toHaveBeenCalledWith(authOptions);
  });

  test('should throw "Not authenticated" if getServerSession returns null', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    await expect(realGetUserToken()).rejects.toThrow('Not authenticated');
    expect(getServerSession).toHaveBeenCalledWith(authOptions);
  });

  test('should throw "Not authenticated" if session user ID is missing', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSessionNoUserId);
    await expect(realGetUserToken()).rejects.toThrow('Not authenticated');
    expect(getServerSession).toHaveBeenCalledWith(authOptions);
  });
  
  test('should throw "Not authenticated" if session user is missing', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSessionNoUser);
    await expect(realGetUserToken()).rejects.toThrow('Not authenticated');
    expect(getServerSession).toHaveBeenCalledWith(authOptions);
  });

  test('should throw "No Todoist token available" if no token in Prisma and no env token', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockValidSession);
    (prisma.todoistToken.findUnique as jest.Mock).mockResolvedValue(null);
    
    // Temporarily delete the environment variable for this specific test
    const originalTodoistToken = process.env.TODOIST_API_TOKEN;
    delete process.env.TODOIST_API_TOKEN;

    await expect(realGetUserToken()).rejects.toThrow('No Todoist token available');
    expect(getServerSession).toHaveBeenCalledWith(authOptions);

    // Restore the environment variable
    if (originalTodoistToken !== undefined) {
      process.env.TODOIST_API_TOKEN = originalTodoistToken;
    } else {
      // If it was originally undefined, ensure it remains undefined
      delete process.env.TODOIST_API_TOKEN;
    }
  });
});

// --- Tests for getTasks ---

// Mock the entire module first
jest.mock('./todoist', () => {
  const originalModule = jest.requireActual('./todoist');
  return {
    __esModule: true,
    ...originalModule, // Import and retain default exports
    getUserToken: jest.fn(), // Mock getUserToken specifically
    // getTasks will be implicitly undefined here, but we'll re-import the actual one
  };
});

// Now, import the specific functions needed for testing.
// getTasks will be the actual implementation, but getUserToken within its scope will be the mock.
import { getTasks } from './todoist';

// Import the mock after jest.mock
const { getUserToken: mockGetUserToken } = require('./todoist');

describe('getTasks', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    mockGetUserToken.mockReset();
    originalFetch = global.fetch;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('should throw error if getUserToken throws', async () => {
    mockGetUserToken.mockRejectedValue(new Error('Auth failed'));
    await expect(getTasks()).rejects.toThrow('Auth failed');
    expect(mockGetUserToken).toHaveBeenCalled();
  });

  test('should throw error if fetch fails', async () => {
    mockGetUserToken.mockResolvedValue({ token: 'env_token', userId: 'user_1' });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'API Error',
    });
    await expect(getTasks()).rejects.toThrow('Failed to fetch tasks: 500');
  });

  test('should return all tasks if no filter is provided', async () => {
    mockGetUserToken.mockResolvedValue({ token: 'test_token', userId: 'user_1' });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockTasks,
    });
    const tasks = await getTasks();
    expect(tasks).toEqual(mockTasks);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.todoist.com/rest/v2/tasks',
      expect.objectContaining({ headers: { Authorization: 'Bearer env_token_123' } })
    );
  });
  
  test('should return all tasks if filter is undefined', async () => {
    mockGetUserToken.mockResolvedValue({ token: 'test_token', userId: 'user_1' });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockTasks,
    });
    const tasks = await getTasks(undefined);
    expect(tasks).toEqual(mockTasks);
  });


  describe('with "active" filter', () => {
    const activeFilter = "active";

    test('should return only active tasks (today, future, no due date, null due, undefined due date)', async () => {
      mockGetUserToken.mockResolvedValue({ token: 'test_token', userId: 'user_1' });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTasks,
      });
      const tasks = await getTasks(activeFilter);
      expect(tasks).toEqual([
        mockTasks[1], // Today Task
        mockTasks[2], // Future Task
        mockTasks[3], // No Due Date Task
        mockTasks[4], // Due Null Task
        mockTasks[5], // Due Date Null Task
      ]);
    });

    test('should return all tasks if all are active', async () => {
      const allActiveTasks: TodoistTask[] = [mockTasks[1], mockTasks[2], mockTasks[3], mockTasks[4]];
      mockGetUserToken.mockResolvedValue({ token: 'test_token', userId: 'user_1' });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => allActiveTasks,
      });
      const tasks = await getTasks(activeFilter);
      expect(tasks).toEqual(allActiveTasks);
    });

    test('should return empty array if no tasks are active', async () => {
      const allOverdueTasks: TodoistTask[] = [mockTasks[0]];
       mockGetUserToken.mockResolvedValue({ token: 'test_token', userId: 'user_1' });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => allOverdueTasks,
      });
      const tasks = await getTasks(activeFilter);
      expect(tasks).toEqual([]);
    });
    
    test('should return tasks with no due property or null/undefined due.date as active', async () => {
      const tasksWithNoDueInfo: TodoistTask[] = [mockTasks[3], mockTasks[4], mockTasks[5]];
       mockGetUserToken.mockResolvedValue({ token: 'test_token', userId: 'user_1' });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => tasksWithNoDueInfo,
      });
      const tasks = await getTasks(activeFilter);
      expect(tasks).toEqual(tasksWithNoDueInfo);
    });
  });

  test('should return all tasks if filter is other than "active"', async () => {
    mockGetUserToken.mockResolvedValue({ token: 'test_token', userId: 'user_1' });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockTasks,
    });
    const tasks = await getTasks('completed'); // Example of another filter
    expect(tasks).toEqual(mockTasks);
  });
});
