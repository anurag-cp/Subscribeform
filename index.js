const rows = document.querySelector('#customer-rows');
const searchInput = document.querySelector('#customer-search');
const emptyState = document.querySelector('#empty-state');
const customerCount = document.querySelector('#customer-count');
const filterMenu = document.querySelector('#filter-menu');
const toast = document.querySelector('#toast');
let activeFilter = 'all';
let toastTimeout;

function applyCustomerFilters() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;
  for (const row of rows.querySelectorAll('tr')) {
    const matchesText = row.textContent.toLowerCase().includes(query);
    const matchesStatus = activeFilter === 'all' || row.querySelector('.status-pill').textContent.trim() === activeFilter;
    row.hidden = !(matchesText && matchesStatus);
    if (!row.hidden) visible += 1;
  }
  emptyState.hidden = visible !== 0;
  customerCount.innerHTML = `Showing <strong>${visible}</strong> of <strong>1,284</strong> customers`;
}

function announce(message) {
  toast.querySelector('p').textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3800);
}

searchInput.addEventListener('input', applyCustomerFilters);

document.querySelector('#filter-button').addEventListener('click', () => {
  filterMenu.hidden = !filterMenu.hidden;
});

filterMenu.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  activeFilter = button.dataset.filter;
  filterMenu.hidden = true;
  applyCustomerFilters();
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('#filter-button') && !event.target.closest('#filter-menu')) filterMenu.hidden = true;
});

const customerDialog = document.querySelector('#customer-dialog');
const customerForm = document.querySelector('#customer-form');
document.querySelector('#add-customer').addEventListener('click', () => customerDialog.showModal());
document.querySelector('#dialog-close').addEventListener('click', () => customerDialog.close());
document.querySelector('#dialog-cancel').addEventListener('click', () => customerDialog.close());
customerDialog.addEventListener('click', (event) => {
  if (event.target === customerDialog) customerDialog.close();
});

customerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!customerForm.reportValidity()) return;
  const data = new FormData(customerForm);
  const name = data.get('name').trim();
  const email = data.get('email').trim();
  const plan = data.get('plan');
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const row = document.createElement('tr');
  const customerCell = document.createElement('div');
  customerCell.className = 'customer-cell';
  const avatar = document.createElement('span');
  avatar.className = 'customer-avatar avatar-lilac';
  avatar.textContent = initials;
  const identity = document.createElement('span');
  const customerName = document.createElement('strong');
  customerName.textContent = name;
  const customerEmail = document.createElement('small');
  customerEmail.textContent = email;
  identity.append(customerName, customerEmail);
  customerCell.append(avatar, identity);
  const planCell = document.createElement('td');
  planCell.className = 'plan-name';
  planCell.textContent = plan;
  const statusCell = document.createElement('td');
  statusCell.innerHTML = '<span class="status-pill active-status"><i></i>Active</span>';
  const dateCell = document.createElement('td');
  dateCell.textContent = 'Nov 21, 2024';
  const amountCell = document.createElement('td');
  amountCell.className = 'amount-cell';
  const prices = { 'Starter Plan': '$12.00', 'Pro Plan': '$29.00', 'Team Plan': '$79.00' };
  amountCell.innerHTML = `${prices[plan]}<span>/mo</span>`;
  const actionCell = document.createElement('td');
  const action = document.createElement('button');
  action.className = 'row-menu';
  action.setAttribute('aria-label', `More actions for ${name}`);
  action.textContent = '···';
  actionCell.append(action);
  const firstCell = document.createElement('td');
  firstCell.append(customerCell);
  row.append(firstCell, planCell, statusCell, dateCell, amountCell, actionCell);
  rows.prepend(row);
  customerForm.reset();
  customerDialog.close();
  activeFilter = 'all';
  searchInput.value = '';
  applyCustomerFilters();
  announce(`${name} added to your workspace.`);
});

document.querySelector('#toast-close').addEventListener('click', () => toast.classList.remove('show'));

const chartData = {
  '7D': { total: '$2,140', labels: ['Oct 15', 'Oct 16', 'Oct 17', 'Oct 18', 'Oct 19', 'Oct 20', 'Oct 21'], path: 'M0 170 C65 155 85 164 132 128 S200 150 250 105 S325 129 370 86 S430 100 488 62 S550 90 605 46 S672 60 720 22', max: '$2.5k', mid: '$1.7k', low: '$850', end: '$0' },
  '30D': { total: '$8,420', labels: ['Sep 22', 'Sep 27', 'Oct 2', 'Oct 7', 'Oct 12', 'Oct 17', 'Oct 21'], path: 'M0 175 C35 163 58 150 90 159 S150 143 180 131 S236 143 270 108 S322 117 360 99 S418 115 455 77 S520 95 552 62 S615 71 648 44 S690 47 720 24', max: '$10k', mid: '$6.7k', low: '$3.3k', end: '$0' },
  '90D': { total: '$24,680', labels: ['Aug 1', 'Aug 15', 'Sep 1', 'Sep 15', 'Oct 1', 'Oct 15', 'Oct 21'], path: 'M0 174 C28 166 41 151 70 157 S112 173 142 138 S184 147 214 124 S258 137 286 108 S327 126 356 98 S397 116 428 84 S469 103 500 74 S541 91 570 57 S613 80 642 46 S686 52 720 24', max: '$30k', mid: '$20k', low: '$10k', end: '$0' },
  '12M': { total: '$24,680', labels: ['Nov ’23', 'Jan ’24', 'Mar ’24', 'May ’24', 'Jul ’24', 'Sep ’24', 'Oct ’24'], path: 'M0 190 C45 184 61 173 102 179 S150 157 196 165 S249 134 294 147 S346 121 392 128 S447 93 493 107 S546 72 592 81 S649 44 678 51 S706 32 720 21', max: '$30k', mid: '$20k', low: '$10k', end: '$0' },
};
document.querySelectorAll('.range-button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.range-button').forEach((item) => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    const data = chartData[button.dataset.range];
    document.querySelector('.line-path').setAttribute('d', data.path);
    document.querySelector('.area-path').setAttribute('d', `${data.path} L720 220 L0 220Z`);
    document.querySelector('#x-axis').innerHTML = data.labels.map((label) => `<span>${label}</span>`).join('');
    document.querySelector('#y-axis').innerHTML = [data.max, data.mid, data.low, data.end].map((label) => `<span>${label}</span>`).join('');
    document.querySelector('#chart-total').innerHTML = `${data.total} <small>+12.8%</small>`;
    document.querySelector('.revenue-chart').setAttribute('aria-label', `Revenue graph for the last ${button.dataset.range}, trending upward`);
  });
});

document.querySelector('#chart-metric').addEventListener('change', (event) => {
  const subscribers = event.target.value === 'subscribers';
  document.querySelector('#chart-total').innerHTML = subscribers ? '1,284 <small>+8.2%</small>' : '$24,680 <small>+12.8%</small>';
  document.querySelector('.revenue-chart').setAttribute('aria-label', `${subscribers ? 'Subscriber' : 'Revenue'} graph trending upward across the selected period`);
  announce(`${subscribers ? 'Subscriber' : 'Revenue'} metric selected.`);
});

document.querySelector('#export-button').addEventListener('click', () => {
  const csv = [['Customer', 'Email', 'Plan', 'Status', 'Next billing', 'Amount'], ...[...rows.querySelectorAll('tr')].map((row) => {
    const cells = row.querySelectorAll('td');
    return [cells[0].querySelector('strong').textContent, cells[0].querySelector('small').textContent, cells[1].textContent.trim(), cells[2].textContent.trim(), cells[3].textContent.trim(), cells[4].textContent.trim()];
  })].map((line) => line.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  link.download = 'orbit-customers.csv';
  link.click();
  URL.revokeObjectURL(link.href);
  announce('Customer report downloaded as CSV.');
});

document.querySelector('#insight-button').addEventListener('click', () => announce('You’re all caught up on your latest AI insights.'));

const menuToggle = document.querySelector('#menu-toggle');
const sidebar = document.querySelector('#sidebar');
menuToggle.addEventListener('click', () => {
  const isOpen = sidebar.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
sidebar.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', () => {
  sidebar.querySelectorAll('.nav-link').forEach((item) => {
    item.classList.toggle('active', item === link);
    if (item === link) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
  sidebar.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));
