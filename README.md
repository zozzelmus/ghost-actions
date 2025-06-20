# Ghost Actions

A GitHub Action to publish images and posts to Ghost blog service via their Admin API.

## Features

- 📝 Publish posts to Ghost blog
- 🖼️ Upload images to Ghost
- 🏷️ Add tags to posts
- 📸 Set feature images
- 📄 Support for drafts and published posts
- ✂️ Add post excerpts

## Usage

### Basic Post Publishing

```yaml
name: Publish to Ghost Blog

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Publish Post to Ghost
        uses: ./
        with:
          ghost_url: 'https://yourblog.ghost.io'
          ghost_admin_api_key: ${{ secrets.GHOST_ADMIN_API_KEY }}
          content_type: 'post'
          title: 'My New Blog Post'
          content: |
            # Hello World!
            
            This is my new blog post content in markdown format.
            
            ## Features
            - Feature 1
            - Feature 2
          status: 'published'
          tags: 'technology, programming, github-actions'
```

### Image Upload

```yaml
- name: Upload Image to Ghost
  uses: ./
  with:
    ghost_url: 'https://yourblog.ghost.io'
    ghost_admin_api_key: ${{ secrets.GHOST_ADMIN_API_KEY }}
    content_type: 'image'
    image_path: './images/my-image.png'
```

### Post with Feature Image

```yaml
- name: Publish Post with Feature Image
  uses: ./
  with:
    ghost_url: 'https://yourblog.ghost.io'
    ghost_admin_api_key: ${{ secrets.GHOST_ADMIN_API_KEY }}
    content_type: 'post'
    title: 'Post with Feature Image'
    content: 'This post has a beautiful feature image!'
    feature_image: './images/feature.jpg'
    status: 'published'
    excerpt: 'A brief description of the post'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `ghost_url` | Ghost blog URL (e.g., https://yourblog.ghost.io) | ✅ | - |
| `ghost_admin_api_key` | Ghost Admin API key | ✅ | - |
| `content_type` | Type of content to publish (post, image) | ✅ | post |
| `title` | Post title (required for posts) | ❌ | - |
| `content` | Post content in markdown format (required for posts) | ❌ | - |
| `image_path` | Path to image file (required for images) | ❌ | - |
| `tags` | Comma-separated list of tags for the post | ❌ | - |
| `status` | Post status (draft, published) | ❌ | draft |
| `excerpt` | Post excerpt | ❌ | - |
| `feature_image` | URL or path to feature image for the post | ❌ | - |

## Outputs

| Output | Description |
|--------|-------------|
| `post_id` | ID of the created post |
| `post_url` | URL of the published post |
| `image_url` | URL of the uploaded image |

## Setup

### 1. Get Ghost Admin API Key

1. Go to your Ghost admin panel
2. Navigate to **Settings** → **Integrations**
3. Click **Add custom integration**
4. Copy the **Admin API key**

### 2. Add Secret to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Create a new secret named `GHOST_ADMIN_API_KEY`
4. Paste your Ghost Admin API key

### 3. Configure Workflow

Create a `.github/workflows/publish.yml` file in your repository with your desired workflow configuration.

## Examples

### Automated Blog Publishing

```yaml
name: Auto Publish Blog

on:
  push:
    paths:
      - 'posts/**'
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Publish New Posts
        uses: ./
        with:
          ghost_url: ${{ secrets.GHOST_URL }}
          ghost_admin_api_key: ${{ secrets.GHOST_ADMIN_API_KEY }}
          content_type: 'post'
          title: ${{ github.event.head_commit.message }}
          content: ${{ github.event.head_commit.message }}
          status: 'published'
          tags: 'automated, github'
```

### Image Gallery Upload

```yaml
name: Upload Images

on:
  push:
    paths:
      - 'images/**'
    branches: [main]

jobs:
  upload-images:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Upload Images
        uses: ./
        with:
          ghost_url: ${{ secrets.GHOST_URL }}
          ghost_admin_api_key: ${{ secrets.GHOST_ADMIN_API_KEY }}
          content_type: 'image'
          image_path: './images/${{ github.event.head_commit.message }}'
```

## Development

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Build the action: `npm run build`

### Testing

```bash
npm test
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/ghost-actions/issues) on GitHub.
