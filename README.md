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
```
git clone https://github.com/ameni-selmi/shortener-url-server.git
cd url-shortener-server
```
# Install dependencies
```
yarn install
```

## Configuration

Create a `.env` file in the root directory with the following variables:


MONGODB_URI=mongodb://localhost:27017/url_shortener


## Running the app


# Development
```
yarn start
```
# Watch mode
```
yarn start:dev
```
# Production mode
```
yarn start:prod
```

## Docker Setup


# Build and run with Docker Compose
docker-compose up -d


## API Documentation

Once the application is running, visit `http://localhost:5000/api-docs` to access the Swagger documentation.

### Main Endpoints

- `POST /shorten` - Create a shortened URL
- `GET /:shortenedId` - Redirect to original URL

## Testing

# Unit tests
```
yarn test
```

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
