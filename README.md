# Sales Order Monitor

A simple web-based dashboard developed for the Harrisons Sabah IT Executive Assessment. It allows users to monitor overall sales order figures and browse orders using search, site, and status filters.

The dashboard retrieves data from the assessment's fictional, read-only REST API. It does not store, create, or modify any order data.

**Live Demo:** [Sales Order Monitor](https://brandonvalentine23.github.io/IT-Executive-Assessment-Sales-Order-Monitoring/)

## Features

- **Dashboard Summary:** Displays total, open, completed, and cancelled orders, along with total order value.
- **Order Listing:** Shows order details with pagination (25 orders per page).
- **Search and Filtering:** Search by order number and filter by site or status.
- **Error Handling:** Loading indicators, no-results messages, and a retry option for failed requests.
- **Responsive Design:** Adapts the order table into cards for smaller screens.

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- REST API
- Node.js (local development only)
- GitHub Pages (deployment)

## Getting Started

**Requirements:** Node.js 18 or newer.

1. Clone or download the repository.
2. Open a terminal in the project directory.
3. Run the local server:

   ```bash
   node server.js
   ```

4. Open `http://localhost:4173` in your browser.

No additional dependencies or installation steps are required.

The `server.js` file is only used to serve the application locally. The deployed version runs directly on GitHub Pages.

## Architecture and API Integration

The application uses a frontend-only architecture built with HTML, CSS, and JavaScript. A separate backend or database is not required because all order information is retrieved from the provided read-only REST API.

The main files are:

- `index.html` — Page structure and dashboard components.
- `styles.css` — Styling and responsive layouts.
- `app.js` — API integration, user interactions, and data rendering.
- `server.js` — Lightweight local development server.

The application communicates with two API endpoints:

- `/meta` — Retrieves available sites and order statuses.
- `/sales-orders` — Retrieves order records, pagination information, and summary figures.

Search, filtering, and pagination are handled through API requests rather than storing the entire dataset locally. Orders are requested newest first.

To improve the user experience, search requests use a 300 ms debounce, and previous requests are cancelled when newer ones are initiated.

## Technical Decisions

- **Simple Architecture:** Vanilla JavaScript was chosen to keep the application lightweight and easy to deploy without a build process.
- **Dashboard Totals:** Summary figures represent all orders, while the order list count reflects active search and filters.

## Limitations

The API does not provide a separate order-date field, so I used `CreatedDateTime1` for the date displayed in the order list.

The app requires an internet connection to retrieve orders from the API and does not support offline use.

Since the app is hosted on GitHub Pages, the assessment API key is visible in browser requests. For a production application requiring a private API key, I would use a backend to handle API requests securely.

Testing was mainly performed manually, and automated tests were not implemented.

## Testing

The application was tested locally and on GitHub Pages. Testing included:

- Verifying dashboard figures against API responses.
- Searching for specific order numbers.
- Testing site and status filters.
- Checking pagination and empty-result handling.
- Reviewing error handling and retry functionality.
- Checking responsiveness on smaller screens.
- Confirming successful API data loading after deployment.

JavaScript syntax was also checked using `node --check`.

## AI Assistance

OpenAI Codex was used to assist with planning, generating the initial implementation, reviewing code, debugging, and improving the layout.

I provided instructions, reviewed the generated results, made styling adjustments, and used Codex to assist with functional testing and understanding the application's structure and API integration.
