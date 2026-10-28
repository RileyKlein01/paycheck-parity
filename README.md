# Paycheck Parity

A cost of living calculator that shows the salary you need in a new U.S. city to keep the same lifestyle, after local prices and income taxes.

## Data

- **Prices:** U.S. Bureau of Economic Analysis Regional Price Parities, 2023 (latest metro release). Ellensburg, WA uses Washington's nonmetro figure.
- **Taxes:** 2026 federal brackets and standard deduction, Social Security (wage base $184,500) and Medicare, 2026 state brackets from the Tax Foundation, Oregon's federal tax subtraction, and city income taxes for New York City, Philadelphia, Detroit, Kansas City, St. Louis, Cincinnati, Cleveland, and Portland (Metro SHS and Multnomah PFA).

Assumes a single filer with wage income and the standard deduction.

## Updating each year

1. Federal brackets, standard deduction, and Social Security wage base: update `FED`, the `16100` deduction, and `184500` in `index.html`.
2. State rules: update the `STATE` object from the Tax Foundation's annual table.
3. Prices: update the second value in each `CITIES` row if BEA publishes new metro figures.
4. Run `node build.js` to rebuild the city pages in `move-to/` and `sitemap.xml`, then upload the changed files.
