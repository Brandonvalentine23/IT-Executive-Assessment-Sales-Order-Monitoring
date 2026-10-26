// This file runs in the browser. It gets orders from the assessment API and updates the page.
const API = 'https://hiring.harrisons.my/api/mock/sales-orders';
// The assessment explicitly provides this shared, read-only mock key for browser use.
const HEADERS = { 'x-assessment-key': 'hssb-assessment-mock-2026' };
const PAGE_SIZE = 25;

// Keep the current filters and page together so every request uses the same settings.
const state = { page: 1, q: '', site: '', status: '', totalPages: 1, total: 0, controller: null, requestId: 0 };
// $('search') is shorthand for document.getElementById('search').
const $ = (id) => document.getElementById(id);
// Format numbers, ringgit amounts, and dates for people reading the dashboard.
const number = new Intl.NumberFormat('en-MY');
const money = new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' });
const date = new Intl.DateTimeFormat('en-MY', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' });

// Show a loading, empty-result, or error message below the table.
// An error message can include a button that tries the request again.
function showMessage(message, retry = false) {
  $('message').replaceChildren(document.createTextNode(message));
  if (retry) {
    const button = document.createElement('button');
    button.className = 'retry-btn';
    button.textContent = 'Try again';
    button.addEventListener('click', loadOrders);
    $('message').append(button);
  }
  $('message').hidden = false;
}

// The API's summary contains totals for all orders, regardless of table filters.
function renderSummary(summary) {
  $('total-value').textContent = money.format(summary.total_order_value);
  $('total-orders').textContent = number.format(summary.total_orders);
  $('open-orders').textContent = number.format(summary.open_orders);
  $('completed-orders').textContent = number.format(summary.invoiced_orders + summary.delivered_orders);
  $('cancelled-orders').textContent = number.format(summary.cancelled_orders);
  document.querySelector('.metric-featured .metric-foot').textContent = `Across all ${number.format(summary.total_orders)} assessment orders`;
}

// Build one table row for each order returned by the API.
// data-label tells the mobile layout what heading to show above each cell.
function renderRows(orders) {
  const body = $('order-rows');
  body.replaceChildren();
  const fragment = document.createDocumentFragment();
  for (const order of orders) {
    const row = document.createElement('tr');
    const cells = [order.SalesId, order.SalesName, order.InventSiteId, date.format(new Date(order.CreatedDateTime1)), order.SalesStatus, money.format(order.HAR_TotalSOAmount)];
    cells.forEach((value, index) => {
      const cell = document.createElement('td');
      cell.dataset.label = ['Order', 'Customer', 'Site', 'Order date', 'Status', 'Amount'][index];
      if (index === 0) cell.className = 'order-id';
      if (index === 1) cell.className = 'customer';
      if (index === 5) cell.className = 'amount-col';
      if (index === 4) {
        const pill = document.createElement('span');
        pill.className = `status-pill ${String(value).toLowerCase().split(' ')[0]}`;
        pill.textContent = value;
        cell.append(pill);
      } else cell.textContent = value;
      row.append(cell);
    });
    fragment.append(row);
  }
  body.append(fragment);
}

// Update the result count and Previous/Next buttons after each request.
function updateControls() {
  $('result-count').textContent = number.format(state.total);
  const start = state.total ? (state.page - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(state.page * PAGE_SIZE, state.total);
  $('range-label').textContent = state.total ? `Showing ${number.format(start)}–${number.format(end)} of ${number.format(state.total)} orders` : 'No matching orders';
  $('page-label').textContent = `Page ${state.page} of ${state.totalPages}`;
  $('prev-page').disabled = state.page <= 1;
  $('next-page').disabled = state.page >= state.totalPages;
  $('clear-filters').hidden = !(state.q || state.site || state.status);
}

// Request one page of orders using the current search, site, and status settings.
async function loadOrders() {
  // Stop an older request if the user changed a filter before it finished.
  state.controller?.abort();
  const controller = new AbortController();
  state.controller = controller;
  const requestId = ++state.requestId;
  showMessage('Loading orders…');
  $('order-rows').replaceChildren();
  // URLSearchParams safely builds the query string after the ? in the API URL.
  const params = new URLSearchParams({ page: String(state.page), pageSize: String(PAGE_SIZE), sort: 'CreatedDateTime1', order: 'desc' });
  if (state.q) params.set('q', state.q);
  if (state.site) params.set('site', state.site);
  if (state.status) params.set('status', state.status);
  try {
    // fetch sends the HTTP request; the assessment key goes in its headers.
    const response = await fetch(`${API}?${params}`, { headers: HEADERS, signal: controller.signal });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    // Convert the JSON response into a JavaScript object we can read.
    const payload = await response.json();
    // Ignore a response if a newer request has already started.
    if (requestId !== state.requestId) return;
    renderSummary(payload.summary);
    state.total = payload.total;
    state.totalPages = Math.max(1, payload.totalPages);
    renderRows(payload.data);
    updateControls();
    $('message').hidden = payload.data.length > 0;
    if (!payload.data.length) showMessage('No orders match your search. Try changing the filters.');
    $('updated').textContent = `Updated ${new Intl.DateTimeFormat('en-MY', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kuala_Lumpur' }).format(new Date())} MYT`;
  } catch (error) {
    // A cancelled request is expected when a newer search or filter takes over.
    if (error.name === 'AbortError' || requestId !== state.requestId) return;
    showMessage('Orders could not be loaded. Check your connection and try again.', true);
    $('updated').textContent = 'Connection unavailable';
  }
}

// Request metadata for the site and status dropdowns.
async function loadFacets() {
  try {
    const response = await fetch(`${API}/meta`, { headers: HEADERS });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const meta = await response.json();
    // Add each API value as an <option> in the matching dropdown.
    for (const [id, facets] of [['site', meta.facets.sites], ['status', meta.facets.statuses]]) {
      const select = $(id);
      for (const facet of facets) select.add(new Option(`${facet.value} (${facet.count})`, facet.value));
    }
  } catch {
    // Orders remain usable through search and the All filters when metadata fails.
  }
}

// Connect the controls in index.html to new API requests.
let searchTimer;
$('search').addEventListener('input', (event) => {
  // Wait 300 ms after typing stops so we do not request on every keystroke.
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.q = event.target.value.trim(); state.page = 1; loadOrders(); }, 300);
});
for (const id of ['site', 'status']) $(id).addEventListener('change', (event) => { state[id] = event.target.value; state.page = 1; loadOrders(); });
$('filters').addEventListener('submit', (event) => { event.preventDefault(); clearTimeout(searchTimer); state.q = $('search').value.trim(); state.page = 1; loadOrders(); });
$('clear-filters').addEventListener('click', () => { clearTimeout(searchTimer); $('search').value = ''; $('site').value = ''; $('status').value = ''; Object.assign(state, { q: '', site: '', status: '', page: 1 }); loadOrders(); });
$('prev-page').addEventListener('click', () => { if (state.page > 1) { state.page--; loadOrders(); } });
$('next-page').addEventListener('click', () => { if (state.page < state.totalPages) { state.page++; loadOrders(); } });
// Start both requests when the page loads: filters first, then orders.
loadFacets();
loadOrders();
