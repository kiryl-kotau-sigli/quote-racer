# Quote Racer

A React application that fetches quotes from multiple APIs, racing for the fastest response.

## About

This application implements a race condition pattern to fetch content from multiple APIs concurrently and displays the first successful response. Due to limitations with available quote APIs (some require API keys, others have CORS restrictions, or are simply unavailable), the application uses a combination of different content sources:

- **Quote API**: [dummyjson.com](https://dummyjson.com/quotes/random) - Provides random quotes with authors
- **Cat Facts API**: [catfact.ninja](https://catfact.ninja/fact) - Provides random cat facts (displayed as quotes with "Random Cat Facts" as the author)
- **Random User API**: [randomuser.me](https://randomuser.me/api/) - Provides random user data (name displayed as quote, city and country as author)

The application races all three APIs simultaneously and displays whichever responds first, providing a fast and reliable user experience.

## Tech Stack

- React
- TypeScript
- Vite
