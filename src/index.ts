import * as fs from 'fs';
const puppeteer = require('puppeteer');
const url = 'https://www.meritechcapital.com/public-comparables/enterprise#/public-comparables/enterprise/comps-table';

(async () => {
  // Setup puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  while (!(page.url() === url)) {
    await page.goto(url);
  }

  // Wait until the table is ready
  await page.waitForSelector(
    '#app > div > div > div.relative.wrapper > div:nth-child(2) > div.table-wrapper > table > tbody > tr.data-row.border-bottom.border-top > td.data.left.sticky-col.first-col'
  );

  // Get the data's latest update date from header
  const dateHeader = await page.evaluate(() => {
    const dateHdr = document.querySelector(
      '#app > div > div > div.relative.wrapper > div:nth-child(2) > div.table-wrapper > table > thead > tr.header-row > th:nth-child(2)'
    );
    return dateHdr.textContent.trim();
  });

  // Build header data manually (because web page's table header is annoying...)
  const headers: string[] = [
    '($ in millions, except per share)',
    dateHeader,
    '% Price Px. (3-Mo)',
    '% Price Px. (12-Mo)',
    'Equity Value',
    'Enterprise Value',
    'EV / Implied ARR',
    'EV / NTM Revenue',
    'Growth Adj. EV / NTM Revenue',
    'Implied ARR',
    'Net New ARR',
    'LTM Revenue',
    '% YoY Growth (Implied ARR)',
    '% YoY Growth (LTM Revenue)',
    '% YoY Growth (NTM Revenue)',
    '% LTM Margins (GM)',
    '% LTM Margins (S&M)',
    '% LTM Margins (R&D)',
    '% LTM Margins (G&A)',
    '% LTM Margins (OpEx)',
    '% LTM Margins (FCF)',
    'Rule of 40',
    'Magic Number',
    'Payback Period',
    'OpEx Payback Period',
    'Implied Average ACV',
    'Implied ARR / FTE',
    'Annualized OpEx / FTE',
    'Net Dollar Retention',
    'Multiple Return Since IPO',
    'Share Price CAGR Since IPO'
  ];

  // Gather all the table body data from the table
  const tableData: string[] = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll('tbody tr td'));
    return tds.map((td) => td.textContent.trim());
  });
  await browser.close();

  // Create variable for the csv rows
  const tableBody = [];

  // Push headers to the array
  tableBody.push(headers);

  // Slice data to rows and push them to the array (one row contains 31 items)
  for (let i = 0; i < tableData.length; i += 31) {
    tableBody.push(tableData.slice(i, i + 31));
  }

  // Create variable for csv formatted rows
  const csvRows: string[] = [];

  // Push row arrays as strings to a new array (delimiter = ;)
  tableBody.forEach((row) => {
    csvRows.push(row.join(';'));
  });

  // Assign the csv rows to one long string separated by a new line
  const csv: string = csvRows.join('\n');

  // Write csv to disk
  fs.writeFileSync('output.csv', csv);
})();
