import { GET } from './route'; // Adjusted path to be relative to the test file
import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';
// NextResponse is not strictly needed for this test but good for consistency if other tests are added
// import { NextResponse } from 'next/server';
import { getTasks } from '@/lib/todoist'; // Make sure this path is correct

// Mock next-auth/next
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock authOptions from the actual path
// It's important to mock the module from where authOptions is imported in the route
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {}, // Provide a dummy authOptions object
}));

// Mock @/lib/todoist
jest.mock('@/lib/todoist', () => ({
  getTasks: jest.fn(),
}));


describe('GET /api/todoist', () => {
  it('should return 401 if user is not authenticated', async () => {
    // Arrange
    (getServerSession as jest.Mock).mockResolvedValue(null);

    // Act
    // The GET handler in question does not expect a Request object.
    // If it did, we would pass {} as NextRequest or a more detailed mock.
    const response = await GET();

    // Assert
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('should return 200 and tasks if user is authenticated', async () => {
    // Arrange
    const mockSession = { user: { email: 'test@example.com', name: 'Test User' } };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const mockTasks = [{ id: '1', content: 'Buy milk', completed: false }];
    (getTasks as jest.Mock).mockResolvedValue(mockTasks);

    // Act
    const response = await GET(); // Pass a minimal mock request, GET handler does not take any argument

    // Assert
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(mockTasks);
    expect(getTasks).toHaveBeenCalledTimes(1); // Verify getTasks was called
  });
});
