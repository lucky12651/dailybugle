# URL Shortener Application

A full-stack URL shortener application built with Node.js, React, and Firebase Firestore.

## Features

- Shorten long URLs with custom or auto-generated aliases
- Server-side redirects for proper SEO and social media crawler support
- Analytics tracking (click counts)
- Recent links history
- Copy to clipboard functionality
- Responsive design

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Firebase Firestore
- **Frontend**: React, Vite, Tailwind CSS
- **Authentication**: Firebase Admin SDK

## Firestore Data Model

The application uses a collection called `urls` with documents structured as:

```javascript
{
  "longUrl": "https://example.com/very/long/url",
  "createdAt": "timestamp",
  "clicks": 0,
  "lastAccessed": "timestamp"
}
```

The document ID serves as the slug for the short URL.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project with Firestore enabled

### Backend Setup

1. Navigate to the `server` directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Firebase:

   - Follow the instructions in `FIREBASE_SETUP.md` to create a Firebase project
   - Download the service account key as `firebaseServiceAccount.json`
   - Add the file to the `server` directory
   - Add to `.gitignore` for security

4. Create a `.env` file in the `server` directory:

   ```
   GOOGLE_APPLICATION_CREDENTIALS="./firebaseServiceAccount.json"
   FIRESTORE_DATABASE_URL="https://your-project-id.firebaseio.com"
   PORT=3000
   BASE_URL=http://localhost:3000
   ```

5. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the `client` directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/shorten` - Create a shortened URL
- `GET /:slug` - Redirect to the original URL
- `GET /api/recent` - Get recently created URLs
- `GET /api/stats/:slug` - Get statistics for a specific URL

## Environment Variables

**Server (.env)**:

- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Firebase service account file
- `FIRESTORE_DATABASE_URL` - Firebase database URL
- `PORT` - Server port (default: 3000)
- `BASE_URL` - Base URL for short URLs

## Deployment

For production deployment:

1. Build the React app: `npm run build` in the client directory
2. Serve the built files from the server or a CDN
3. Ensure environment variables are properly configured in production
4. Set up reverse proxy (nginx/Apache) if needed

## Security Considerations

- Store service account keys securely and never commit to version control
- Implement rate limiting to prevent abuse
- Consider adding user authentication for personal link management
- Update Firestore security rules for production use

## Contributing

Feel free to submit issues and enhancement requests!

#
