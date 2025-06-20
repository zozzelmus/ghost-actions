// Global test setup
jest.setTimeout(10000);

// Mock @actions/core for testing
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setOutput: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  setFailed: jest.fn()
}));

// Mock @actions/github for testing
jest.mock('@actions/github', () => ({
  context: {
    repo: {
      owner: 'test-owner',
      repo: 'test-repo'
    },
    sha: 'test-sha',
    ref: 'refs/heads/main'
  }
})); 