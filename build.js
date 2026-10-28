// Builds one page per destination city (move-to/<slug>/index.html), the city links on every page,
// and sitemap.xml from index.html. Run after editing index.html:  node build.js
const fs = require("fs");
const BASE = "https://rileyklein01.github.io/paycheck-parity/";
const SAMPLE = 60000;

let src = fs.readFileSync("index.html", "utf8");
const code = src.slice(src.indexOf("const CITIES"), src.indexOf("// ---- UI"));
const { CITIES, takeHome, solve } = new Function(code + ";return {CITIES,takeHome,solve};")();

const slug = n => n.toLowerCase().replace(/\./g, "").replace(/,/g, "").replace(/\s+/g, "-");
const money = n => "$" + Math.round(n).toLocaleString("en-US");
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const cityName = n => n.split(",")[0];

const links = current => `<!--cities--><ul class="cities">${CITIES.map(([n]) =>
  `<li><a href="/paycheck-parity/move-to/${slug(n)}/"${n === current ? ' aria-current="page"' : ""}>${n}</a></li>`).join("")}</ul><!--/cities-->`;
const withLinks = (html, current) => html.replace(/<!--cities-->[\s\S]*?<!--\/cities-->/, links(current));

// home page keeps its own content, just gets the links
src = withLinks(src, null);
fs.writeFileSync("index.html", src);

fs.rmSync("move-to", { recursive: true, force: true });
for (const B of CITIES) {
  const name = B[0], short = cityName(name), url = `${BASE}move-to/${slug(name)}/`;
  const rows = CITIES.filter(A => A !== B).map(A => {
    const need = solve(takeHome(SAMPLE, A) * 100 / A[1], B);
    return [A[0], need];
  }).sort((x, y) => x[1] - y[1]);
  const cheapest = rows[0], priciest = rows[rows.length - 1];
  const desc = `What salary do you need to live in ${name}? Compare ${CITIES.length - 1} cities after local prices and 2026 federal, state, and city income taxes.`;

  const table = `
  <section>
    <h2>Moving to ${esc(short)} on ${money(SAMPLE)}</h2>
    <p class="sub">Salary you'd need in ${esc(name)} to match a ${money(SAMPLE)} lifestyle in each city. Coming from ${esc(cheapest[0])}, you'd need ${money(cheapest[1])}; from ${esc(priciest[0])}, ${money(priciest[1])}.</p>
    <div class="tablewrap"><table>
      <thead><tr><th>Moving from</th><th>Salary needed in ${esc(short)}</th></tr></thead>
      <tbody>${rows.map(([n, v]) => `<tr><td>${esc(n)}</td><td>${money(v)}</td></tr>`).join("")}</tbody>
    </table></div>
  </section>
`;

  let page = src
    .replace(/<title>[^<]*<\/title>/, `<title>Salary Needed to Live in ${esc(name)} (2026, After Taxes) | Paycheck Parity</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="Salary needed to live in ${esc(name)}">`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/, "")
    .replace(/<h1>[\s\S]*?<\/h1>/, `<h1>What salary do you need in <span class="glow">${esc(short)}</span>?</h1>`)
    .replace(/<p class="lede">[^<]*<\/p>/, `<p class="lede">Enter your salary and current city to see what it takes to keep the same lifestyle in ${esc(name)}, after local prices and income taxes. <a href="/paycheck-parity/" style="color:var(--accent)">Compare any two cities</a>.</p>`)
    .replace(/const DEFAULT_FROM="[^"]*", DEFAULT_TO="[^"]*";/,
      `const DEFAULT_FROM="${name === "Seattle, WA" ? "Portland, OR" : "Seattle, WA"}", DEFAULT_TO="${name}";`)
    .replace(`  <section>\n    <h2>Salary needed by city</h2>`, table + `  <section>\n    <h2>Salary needed by city</h2>`);
  page = withLinks(page, name);
  fs.mkdirSync(`move-to/${slug(name)}`, { recursive: true });
  fs.writeFileSync(`move-to/${slug(name)}/index.html`, page);
}

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE}</loc><lastmod>${today}</lastmod></url>
${CITIES.map(([n]) => `  <url><loc>${BASE}move-to/${slug(n)}/</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
console.log(`Built ${CITIES.length} city pages and sitemap.xml`);
