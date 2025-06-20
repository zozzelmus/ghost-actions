const { GhostPublisher } = require('../index');

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('GhostPublisher', () => {
  let publisher;
  const mockGhostUrl = 'https://testblog.ghost.io';
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    publisher = new GhostPublisher(mockGhostUrl, mockApiKey);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct base URL', () => {
      expect(publisher.baseUrl).toBe('https://testblog.ghost.io/ghost/api/v5.0/admin');
    });

    it('should remove trailing slash from ghost URL', () => {
      const publisherWithSlash = new GhostPublisher('https://testblog.ghost.io/', mockApiKey);
      expect(publisherWithSlash.baseUrl).toBe('https://testblog.ghost.io/ghost/api/v5.0/admin');
    });
  });

  describe('getContentType', () => {
    it('should return correct content type for jpg', () => {
      expect(publisher.getContentType('test.jpg')).toBe('image/jpeg');
    });

    it('should return correct content type for png', () => {
      expect(publisher.getContentType('test.png')).toBe('image/png');
    });

    it('should return correct content type for gif', () => {
      expect(publisher.getContentType('test.gif')).toBe('image/gif');
    });

    it('should return default content type for unknown extension', () => {
      expect(publisher.getContentType('test.unknown')).toBe('application/octet-stream');
    });
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const mockResponse = {
        data: {
          posts: [{
            id: 'post-123',
            title: 'Test Post',
            url: 'https://testblog.ghost.io/test-post'
          }]
        }
      };

      publisher.client.post = jest.fn().mockResolvedValue(mockResponse);

      const postData = {
        title: 'Test Post',
        html: '<p>Test content</p>',
        status: 'draft'
      };

      const result = await publisher.createPost(postData);

      expect(result).toEqual({
        id: 'post-123',
        url: 'https://testblog.ghost.io/test-post',
        title: 'Test Post'
      });

      expect(publisher.client.post).toHaveBeenCalledWith('/posts/', {
        posts: [postData]
      });
    });

    it('should handle post creation error', async () => {
      const mockError = new Error('API Error');
      mockError.response = {
        data: { errors: ['Invalid post data'] }
      };

      publisher.client.post = jest.fn().mockRejectedValue(mockError);

      const postData = {
        title: 'Test Post',
        html: '<p>Test content</p>'
      };

      await expect(publisher.createPost(postData)).rejects.toThrow('API Error');
    });
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockResponse = {
        data: {
          images: [{
            url: 'https://testblog.ghost.io/content/images/test.jpg'
          }]
        }
      };

      // Mock fs.existsSync and fs.readFileSync
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('test-image-data'));

      // Mock axios.post for image upload
      axios.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await publisher.uploadImage('./test.jpg');

      expect(result).toBe('https://testblog.ghost.io/content/images/test.jpg');
      expect(axios.post).toHaveBeenCalledWith(
        'https://testblog.ghost.io/ghost/api/v5.0/admin/images/upload/',
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Ghost test-api-key'
          })
        })
      );
    });

    it('should handle file not found error', async () => {
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      await expect(publisher.uploadImage('./nonexistent.jpg')).rejects.toThrow(
        'Image file not found: ./nonexistent.jpg'
      );
    });
  });
}); 