const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class GhostPublisher {
  constructor(ghostUrl, adminApiKey) {
    this.ghostUrl = ghostUrl.replace(/\/$/, ''); // Remove trailing slash
    this.adminApiKey = adminApiKey;
    this.apiVersion = 'v5.0';
    this.baseUrl = `${this.ghostUrl}/ghost/api/${this.apiVersion}/admin`;
    
    // Set up axios instance with default headers
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Ghost ${this.adminApiKey}`,
        'Content-Type': 'application/json',
        'Accept-Version': this.apiVersion
      }
    });
  }

  async createPost(postData) {
    try {
      const response = await this.client.post('/posts/', {
        posts: [postData]
      });

      const post = response.data.posts[0];
      core.info(`Post created successfully: ${post.title}`);
      
      return {
        id: post.id,
        url: post.url,
        title: post.title
      };
    } catch (error) {
      core.error(`Failed to create post: ${error.message}`);
      if (error.response) {
        core.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async uploadImage(imagePath) {
    try {
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      // Read file and create form data
      const imageBuffer = fs.readFileSync(imagePath);
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename: path.basename(imagePath),
        contentType: this.getContentType(imagePath)
      });

      // Upload to Ghost
      const response = await axios.post(`${this.baseUrl}/images/upload/`, formData, {
        headers: {
          'Authorization': `Ghost ${this.adminApiKey}`,
          'Accept-Version': this.apiVersion,
          ...formData.getHeaders()
        }
      });

      const imageUrl = response.data.images[0].url;
      core.info(`Image uploaded successfully: ${imageUrl}`);
      
      return imageUrl;
    } catch (error) {
      core.error(`Failed to upload image: ${error.message}`);
      if (error.response) {
        core.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  async publishPost(inputs) {
    const postData = {
      title: inputs.title,
      html: inputs.content,
      status: inputs.status,
      tags: inputs.tags ? inputs.tags.split(',').map(tag => ({ name: tag.trim() })) : []
    };

    if (inputs.excerpt) {
      postData.excerpt = inputs.excerpt;
    }

    if (inputs.feature_image) {
      // If feature_image is a local path, upload it first
      if (fs.existsSync(inputs.feature_image)) {
        const imageUrl = await this.uploadImage(inputs.feature_image);
        postData.feature_image = imageUrl;
      } else {
        // Assume it's already a URL
        postData.feature_image = inputs.feature_image;
      }
    }

    return await this.createPost(postData);
  }
}

async function run() {
  try {
    // Get inputs
    const ghostUrl = core.getInput('ghost_url', { required: true });
    const ghostAdminApiKey = core.getInput('ghost_admin_api_key', { required: true });
    const contentType = core.getInput('content_type', { required: true });
    const title = core.getInput('title');
    const content = core.getInput('content');
    const imagePath = core.getInput('image_path');
    const tags = core.getInput('tags');
    const status = core.getInput('status') || 'draft';
    const excerpt = core.getInput('excerpt');
    const featureImage = core.getInput('feature_image');

    // Validate inputs based on content type
    if (contentType === 'post') {
      if (!title) {
        throw new Error('Title is required for posts');
      }
      if (!content) {
        throw new Error('Content is required for posts');
      }
    } else if (contentType === 'image') {
      if (!imagePath) {
        throw new Error('Image path is required for image uploads');
      }
    } else {
      throw new Error('Content type must be either "post" or "image"');
    }

    // Initialize Ghost publisher
    const publisher = new GhostPublisher(ghostUrl, ghostAdminApiKey);

    if (contentType === 'post') {
      // Publish post
      const inputs = {
        title,
        content,
        tags,
        status,
        excerpt,
        feature_image: featureImage
      };

      const result = await publisher.publishPost(inputs);
      
      // Set outputs
      core.setOutput('post_id', result.id);
      core.setOutput('post_url', result.url);
      
      core.info(`✅ Post "${result.title}" created successfully!`);
      core.info(`📝 Post URL: ${result.url}`);
      core.info(`🆔 Post ID: ${result.id}`);

    } else if (contentType === 'image') {
      // Upload image
      const imageUrl = await publisher.uploadImage(imagePath);
      
      // Set outputs
      core.setOutput('image_url', imageUrl);
      
      core.info(`✅ Image uploaded successfully!`);
      core.info(`🖼️ Image URL: ${imageUrl}`);
    }

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

// Export for testing
module.exports = { GhostPublisher };

// Run the action
if (require.main === module) {
  run();
} 