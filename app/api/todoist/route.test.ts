import { GET } from './route';
import { getServerSession } from 'next-auth/next';
import { getTasks } from '@/lib/todoist';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Only if you get "Request is not defined" error in Jest
import { Request } from 'node-fetch';
(global as any).Request = Request;

// Mock next-auth/next
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock authOptions - this is already done by the previous jest.mock,
// but we might want to ensure it's typed if we use it directly in tests.
// For now, the existing mock of the module is fine.
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: { secret: 'mock_secret' }, // Provide a dummy authOptions object
}));


// Mock @/lib/todoist
jest.mock('@/lib/todoist', () => ({
  getTasks: jest.fn(),
}));

// Typed mocks
const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockedGetTasks = getTasks as jest.MockedFunction<typeof getTasks>;

describe('GET /api/todoist', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedGetServerSession.mockReset();
    mockedGetTasks.mockReset();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const request = new Request('http://localhost/api/todoist');
    
    const response = await GET(request);
    
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: 'Unauthorized' });
    expect(mockedGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(mockedGetTasks).not.toHaveBeenCalled();
  });

  describe('when user is authenticated', () => {
    const mockSession = { user: { id: 'test-user-id', email: 'test@example.com', name: 'Test User' } };
    const sampleTasks = [{ id: '1', content: 'Buy milk' }];

    beforeEach(() => {
      mockedGetServerSession.mockResolvedValue(mockSession);
    });

    it('should call getTasks with "active" filter and return tasks', async () => {
      mockedGetTasks.mockResolvedValue(sampleTasks);
      const request = new Request('http://localhost/api/todoist?filter=active');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(sampleTasks);
      expect(mockedGetServerSession).toHaveBeenCalledWith(authOptions);
      expect(mockedGetTasks).toHaveBeenCalledWith('active');
    });

    it('should call getTasks with undefined if no filter is provided', async () => {
      mockedGetTasks.mockResolvedValue(sampleTasks);
      const request = new Request('http://localhost/api/todoist');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(sampleTasks);
      expect(mockedGetTasks).toHaveBeenCalledWith(undefined);
    });

    it('should call getTasks with the provided filter string', async () => {
      mockedGetTasks.mockResolvedValue(sampleTasks);
      const request = new Request('http://localhost/api/todoist?filter=pending');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(sampleTasks);
      expect(mockedGetTasks).toHaveBeenCalledWith('pending');
    });

    it('should return 500 if getTasks throws an error', async () => {
      mockedGetTasks.mockRejectedValue(new Error('Failed to fetch'));
      const request = new Request('http://localhost/api/todoist?filter=active');
      
      const response = await GET(request);
      
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({ error: 'Failed to fetch tasks' });
      expect(mockedGetTasks).toHaveBeenCalledWith('active');
    });
  });
});
