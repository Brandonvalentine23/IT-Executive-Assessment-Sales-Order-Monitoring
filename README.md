# Sales Order Monitor

I built this small dashboard for the Harrisons Sabah IT Executive assessment. It gives the sales team one place to see the overall order figures and look through orders by site or status. The orders come from the assessment's fictional, read-only API. The app does not save or change any order data.

## Run it locally

Install Node.js 18 or newer, then run this in the project folder:

```bash
node server.js
```

Open [http://localhost:4173](http://localhost:4173) in your browser. There is no `npm install` step because the project has no package dependencies. Stop the server with `Ctrl+C` in the terminal.

`server.js` only serves the local files. The hosted version can run on GitHub Pages because the browser makes the API requests directly.

## What the app shows

- A summary of total orders, open orders, completed orders, cancelled orders, and total order value.
- A paginated order list with the order number, customer, site, date, status, and amount.
- Search and filters for site and status.
- Loading, empty-result, and connection-error messages, plus a retry button when a request fails.
- A layout that changes the order table into cards on smaller screens.

## How it works

`index.html` is the page structure, `styles.css` controls the layout, and `app.js` fetches and displays the data. When the page opens, `app.js` requests the available sites and statuses from the API's `/meta` endpoint and requests the first page of orders from `/sales-orders`.

The list request includes the current page, page size, newest-first sort order, and any search or filter values. The API response provides both the rows and the summary figures. Search waits 300 ms after typing stops before making a request. If a newer request starts, the older one is cancelled so an old result cannot replace the current view.

The assessment provides the `x-assessment-key` used in `app.js`. It is a shared key for this public, read-only mock API. It should not be treated as a secret or reused for a private API. There is no database or separate order backend in this project.

## Choices and limitations

- I used plain HTML, CSS, and JavaScript to keep the app easy to run and host without a build step.
- The summary cards show totals for all orders, as returned by the API. The count above the list reflects the active filters.
- The API does not have a separate order-date field, so the list displays `CreatedDateTime1` as the date.
- The API and Google Fonts need an internet connection. If the font does not load, the browser uses a fallback font.

## Testing and AI use

OpenAI Codex helped with planning, parts of the code, code review, and layout changes. I used its explanations and comments to work through how the files and API fit together, and I adjusted the styling during that process.

The app was checked locally against the assessment API. Checks included the summary figures, an exact order-number search, site filtering, pagination, no-results handling, and the mobile layout. Both JavaScript files also pass `node --check`.
