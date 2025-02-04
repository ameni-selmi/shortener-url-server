# URL Shortener API

A URL shortening service built with NestJS and MongoDB.

## Features

- Shorten long URLs to unique short codes
- Redirect short URLs to original long URLs
- Custom short code support
- URL validation
- Visit tracking and analytics
- Rate limiting
- API documentation with Swagger

## Tech Stack

- NestJS - Node.js framework
- MongoDB - Database
- Mongoose - ODM
- Jest - Testing
- Swagger - API documentation
- Docker - Containerization

## Prerequisites

- Node.js (v14+)
- MongoDB
- Docker (optional)

## Installation


# Clone the repository
git clone https://github.com/yourusername/url-shortener.git

# Install dependencies
npm install


## Configuration

Create a `.env` file in the root directory with the following variables:


MONGODB_URI=mongodb://localhost:27017/url_shortener
JWT_SECRET=your_jwt_secret


## Running the app


# Development
npm run start

# Watch mode
npm run start:dev

# Production mode
npm run start:prod


## Docker Setup


# Build and run with Docker Compose
docker-compose up -d


## API Documentation

Once the application is running, visit `http://localhost:3000/api` to access the Swagger documentation.

### Main Endpoints

- `POST /url` - Create a shortened URL
- `GET /:code` - Redirect to original URL
- `GET /url/:code/stats` - Get URL statistics

## Testing


# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov


## Project Structure


src/
├── filters/        # Filters files
├── shortener/      # Shortener service
├── main.ts         # Application entry point
└── app.module.ts   # Root module


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
