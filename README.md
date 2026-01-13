# Quote Racer

A React application that fetches quotes from multiple APIs, racing for the fastest response.

**Live Demo**: [https://kiryl-kotau-sigli.github.io/quote-racer/](https://kiryl-kotau-sigli.github.io/quote-racer/)

## About

The main screen of the application displays a random quote retrieved from a web API and provides a button to display the next random quote. The application is able to handle a lack of network connectivity gracefully by showing cached quotes and hardcoded fallback quotes.

This application implements a race condition pattern to fetch content from multiple APIs concurrently and displays the first successful response. Due to limitations with available quote APIs (some require API keys, others have CORS restrictions, or are simply unavailable), the application uses a combination of different content sources:

- **Quote API**: [dummyjson.com](https://dummyjson.com/quotes/random) - Provides random quotes with authors
- **Cat Facts API**: [catfact.ninja](https://catfact.ninja/fact) - Provides random cat facts (displayed as quotes with "Random Cat Facts" as the author)
- **Random User API**: [randomuser.me](https://randomuser.me/api/) - Provides random user data (name displayed as quote, city and country as author)

The application races all three APIs simultaneously and displays whichever responds first, providing a fast and reliable user experience.

## Features

### User Stories

- **Fetch quotes from multiple APIs, racing for the fastest response** - The application concurrently requests quotes from multiple sources and displays the first successful response, ensuring optimal performance.

- **Handle offline gracefully** - When network connectivity is unavailable, the application falls back on a set of cached quotes and local hardcoded quotes, ensuring users always have content to view.

- **Rate quotes locally** - Users can rate quotes using a star rating system. Ratings are stored locally in the browser without requiring a backend, allowing for a personalized experience.

- **Native sharing for quotes** - The application supports native sharing functionality when available. If native sharing is not supported, the quote is automatically copied to the clipboard as a fallback, ensuring users can always share quotes easily.

- **Slideshow of random quotes** - Users can enable an automatic slideshow feature that displays random quotes at configurable intervals. This can be configured via the Settings button, allowing users to customize the interval between quote changes.

- **Keyboard navigation** - Users can navigate to the next quote by pressing Enter or Space, providing quick and convenient access to new quotes without using the mouse.

### Testing

The application includes comprehensive unit tests for important functionality, covering:

- Feature hooks (quote fetching, rating, sharing, slideshow control)
- Widgets (quote display, slideshow settings)
- Shared utilities (formatting, storage functions)

## Getting Started

### Prerequisites

- yarn (or npm)

### Installation

```bash
yarn install
```

### Development

To start the development server:

```bash
yarn dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).

### Testing

To run all tests:

```bash
yarn test
```

To run tests once (without watch mode):

```bash
yarn test --run
```

To run tests with UI:

```bash
yarn test:ui
```

### Building

To build the application for production:

```bash
yarn build
```

The built files will be in the `dist` directory.

### Preview

To preview the production build locally:

```bash
yarn preview
```

### Linting

To check code quality:

```bash
yarn lint
```

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Vitest
- React Testing Library

## CI/CD

The project uses GitHub Actions for continuous integration and deployment. The workflow is configured to:

- **Automatically build and test** the application on every push to the `main` branch
- **Run all tests** to ensure code quality before deployment
- **Deploy to GitHub Pages** automatically after successful build and tests

The deployment workflow:

1. Checks out the code
2. Sets up Node.js and installs dependencies using yarn
3. Runs the test suite
4. Builds the production bundle
5. Deploys to GitHub Pages

The application is available at [https://kiryl-kotau-sigli.github.io/quote-racer/](https://kiryl-kotau-sigli.github.io/quote-racer/).
