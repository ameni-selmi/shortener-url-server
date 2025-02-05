# URL Shortener Backend Server  

This is the backend server for the URL Shortener project [sshorty](https://sshorty.netlify.app). It is built with **NestJS** and provides endpoints to shorten URLs, redirect users to the original URLs, and efficiently handle requests with caching and security features.

---

## **Features**  

- **URL Shortening**: Shortens long URLs into unique, concise identifiers.  
- **Redirection Logic**: Redirects users to the original URL when they access the shortened link.  
- **Caching**: Implements caching using `CacheManager` to enhance performance by storing frequently accessed data.  
- **Security**:  
  - CORS enabled for safe cross-origin resource sharing.  
  - XSS filtering to prevent cross-site scripting attacks.
  - Rate Limiting to restricted requests per IP using.

---

## **Endpoints**  

### **1. POST /api/shorten**  
Shortens a given URL.  

#### Request  
```json
{
  "originalURL": "https://example.com/some/long/url"
}
```

#### Response  
```json
{
  "shortenedUrl": "http://localhost:3000/<shortCode>"
}
```

---

### **2. GET /:shortenedId**  
Redirects to the original URL based on the shortened ID.  

#### Behavior  
- First, checks the cache for the original URL.  
- If not found in the cache, fetches from the database and caches the result.  

---

## **Caching Implementation**  

- **Technology**: Uses NestJS `CacheManager` for in-memory caching.  
- **Flow**:  
  1. When a `shortenedId` is provided, the server checks if the original URL exists in the cache.  
  2. If found, it redirects the user immediately.  
  3. If not, it fetches from the database, caches the result, and redirects the user.  
- **TTL (Time-to-Live)**: Cached URLs are stored for **1 hour**.

---

## **Security**  

1. **CORS**: Configured to allow requests only from trusted origins.  
2. **XSS Protection**: Enabled to sanitize input and prevent malicious scripts.
3. **Rate Limiting**: Implemented using `ThrottlerModule` to restrict users to a maximum number of requests per minute per TTL.


---

## **How to Run**  

1. Clone the repository:  
   ```bash
   git clone https://github.com/ameni-selmi/shortener-url-server.git
   cd url-shortener-server
   ```

2. Install dependencies:  
   ```bash
   yarn install
   ```

3. Set up environment variables in a `.env` file:  
   ```plaintext
    MONGO_URI= The MongoDB connection string.
    BACKEND_URL= The base URL for the backend server.
    FRONTEND_URL= The base URL for the frontend application.
    PORT= The port on which the backend server runs.
   ```

4. Start the server:  
   ```bash
   yarn start:dev
   ```

---

## **Testing**  

```bash
yarn test
```
