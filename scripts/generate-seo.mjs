import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'src', 'seo', 'data');
const OUT_DIR = path.join(ROOT_DIR, 'dist');

const SITE_URL = 'https://spiretrack.app';

const sitemapUrls = [];

function generateHTML({ title, description, canonical, breadcrumbs, content, relatedPages = [] }) {
  const schemaBreadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": b.name,
      "item": `${SITE_URL}${b.url}`
    }))
  };

  const relatedHtml = relatedPages.length > 0 ? `
    <section class="related-pages">
      <div class="container">
        <h2>Related Resources</h2>
        <div class="grid">
          ${relatedPages.map(p => `
            <a href="${p.url}" class="card">
              <h3>${p.title}</h3>
              <p>${p.description}</p>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="SpireTrack">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  
  <script type="application/ld+json">
    ${JSON.stringify(schemaBreadcrumbs)}
  </script>
  
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-W8J492Y52K"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-W8J492Y52K');
  </script>

  <style>
    :root {
      --gray-50: #fafaf9; --gray-100: #f5f5f4; --gray-200: #e7e5e4;
      --gray-300: #d6d3d1; --gray-400: #a8a29e; --gray-500: #78716c;
      --gray-600: #57534e; --gray-700: #44403c; --gray-800: #292524;
      --gray-900: #1c1917;
      --emerald-50: #ecfdf5; --emerald-100: #d1fae5; --emerald-400: #34d399;
      --emerald-500: #10b981; --emerald-600: #059669;
      --teal-500: #14b8a6; --cyan-500: #06b6d4;
      --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-sans); color: var(--gray-800);
      line-height: 1.7; background: white;
      -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
    }
    a { color: var(--emerald-600); text-decoration: none; transition: color 0.2s; }
    a:hover { color: var(--emerald-500); }

    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }

    /* — Header — */
    header {
      background: rgba(255,255,255,0.85); backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--gray-200);
      position: sticky; top: 0; z-index: 100;
    }
    .header-nav {
      display: flex; justify-content: space-between; align-items: center; height: 4rem;
    }
    .logo {
      font-weight: 700; font-size: 1.25rem; color: var(--gray-900);
      letter-spacing: -0.02em;
    }
    .logo:hover { color: var(--gray-900); text-decoration: none; }
    .nav-links { display: flex; gap: 2rem; align-items: center; }
    .nav-links a { color: var(--gray-500); font-weight: 400; font-size: 0.9rem; }
    .nav-links a:hover { color: var(--gray-900); text-decoration: none; }
    .nav-actions { display: flex; gap: 0.75rem; align-items: center; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      font-weight: 500; font-size: 0.9rem; transition: all 0.2s; cursor: pointer;
      text-decoration: none !important; border: none;
    }
    .btn-primary {
      background: var(--gray-900); color: white !important;
      padding: 0.6rem 1.5rem; border-radius: 9999px;
    }
    .btn-primary:hover { background: var(--gray-800); transform: translateY(-1px); }
    .btn-ghost { color: var(--gray-600) !important; padding: 0.6rem 1rem; border-radius: 9999px; }
    .btn-ghost:hover { color: var(--gray-900) !important; background: var(--gray-100); }
    .btn-cta {
      background: var(--gray-900); color: white !important;
      padding: 1rem 2.5rem; border-radius: 9999px; font-size: 1.05rem; font-weight: 500;
    }
    .btn-cta:hover { background: var(--gray-800); transform: translateY(-1px); box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
    .btn-cta-light {
      background: white; color: var(--gray-900) !important;
      padding: 1rem 2.5rem; border-radius: 9999px; font-size: 1.05rem; font-weight: 500;
    }
    .btn-cta-light:hover { background: var(--gray-100); transform: translateY(-1px); }

    /* — Breadcrumbs — */
    .breadcrumbs {
      padding: 1.25rem 0; font-size: 0.8rem; color: var(--gray-400);
      letter-spacing: 0.02em; text-transform: uppercase;
    }
    .breadcrumbs a { color: var(--gray-500); }
    .breadcrumbs a:hover { color: var(--gray-900); }
    .breadcrumbs .sep { margin: 0 0.5rem; color: var(--gray-300); }

    /* — Hero — */
    .hero {
      padding: 5rem 0 4rem; text-align: center; position: relative; overflow: hidden;
    }
    .hero::before {
      content: ''; position: absolute; top: -100px; right: -100px;
      width: 500px; height: 500px; border-radius: 50%;
      background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero::after {
      content: ''; position: absolute; bottom: -80px; left: -80px;
      width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, rgba(20,184,166,0.05) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero .badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.4rem 1rem; border-radius: 9999px; font-size: 0.75rem;
      font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em;
      background: var(--emerald-50); color: var(--emerald-600);
      border: 1px solid var(--emerald-100); margin-bottom: 2rem;
    }
    .hero .badge::before {
      content: ''; width: 6px; height: 6px; border-radius: 50%;
      background: var(--emerald-500); display: inline-block;
    }
    .hero h1 {
      font-size: clamp(2.2rem, 5vw, 3.5rem); font-weight: 300; color: var(--gray-900);
      line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 1.25rem;
      position: relative; z-index: 1;
    }
    .hero .gradient-text {
      background: linear-gradient(135deg, var(--emerald-500), var(--teal-500), var(--cyan-500));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero p {
      font-size: 1.15rem; color: var(--gray-500); max-width: 640px;
      margin: 0 auto 2.5rem; font-weight: 300; line-height: 1.7;
      position: relative; z-index: 1;
    }

    /* — Content — */
    main { min-height: 60vh; padding-bottom: 2rem; }

    .content-section {
      background: white; border-radius: 1rem; padding: 3rem;
      margin-bottom: 1.5rem; border: 1px solid var(--gray-200);
    }
    .content-section h2 {
      font-size: 1.75rem; font-weight: 300; color: var(--gray-900);
      margin-bottom: 1.25rem; letter-spacing: -0.02em;
    }
    .content-section h3 {
      font-size: 1.25rem; font-weight: 500; color: var(--gray-800);
      margin: 1.5rem 0 0.75rem;
    }
    .content-section p { margin-bottom: 1rem; color: var(--gray-600); font-weight: 300; }
    .content-section ul { margin: 0 0 1.5rem 1.5rem; color: var(--gray-600); }
    .content-section li { margin-bottom: 0.5rem; font-weight: 300; }
    .content-section strong { color: var(--gray-800); font-weight: 500; }

    /* — Table — */
    table { width: 100%; border-collapse: collapse; margin: 2rem 0; font-size: 0.95rem; }
    th, td { padding: 1rem 1.25rem; text-align: left; border-bottom: 1px solid var(--gray-100); }
    th { background: var(--gray-50); font-weight: 500; color: var(--gray-900); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; }
    td { color: var(--gray-600); font-weight: 300; }
    .check { color: var(--emerald-500); font-weight: 600; }
    .cross { color: var(--gray-300); }

    /* — CTA Section — */
    .cta-section {
      text-align: center; padding: 5rem 2rem;
      background: var(--gray-900); color: white;
      margin-top: 4rem; border-radius: 1.5rem;
      position: relative; overflow: hidden;
    }
    .cta-section::before {
      content: ''; position: absolute; top: -60px; right: -60px;
      width: 300px; height: 300px; border-radius: 50%;
      background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);
    }
    .cta-section h2 {
      font-size: clamp(1.8rem, 4vw, 2.5rem); font-weight: 300;
      margin-bottom: 1rem; letter-spacing: -0.02em; position: relative; z-index: 1;
    }
    .cta-section p {
      font-size: 1.1rem; color: var(--gray-400); margin-bottom: 2.5rem;
      max-width: 500px; margin-left: auto; margin-right: auto; font-weight: 300;
      position: relative; z-index: 1;
    }

    /* — Related Pages — */
    .related-pages { padding: 3rem 0; }
    .related-pages h2 { font-size: 1.5rem; font-weight: 300; color: var(--gray-900); margin-bottom: 1.5rem; letter-spacing: -0.02em; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
    .card {
      background: white; padding: 1.5rem; border-radius: 0.75rem;
      border: 1px solid var(--gray-200); transition: all 0.25s ease; display: block; color: inherit;
    }
    .card:hover {
      border-color: var(--gray-300); box-shadow: 0 8px 30px rgba(0,0,0,0.06);
      transform: translateY(-3px); text-decoration: none;
    }
    .card h3 { font-size: 1rem; font-weight: 500; color: var(--gray-900); margin-bottom: 0.4rem; }
    .card p { color: var(--gray-500); font-size: 0.875rem; margin: 0; font-weight: 300; line-height: 1.5; }

    /* — FAQ — */
    .faq-item { border-bottom: 1px solid var(--gray-100); padding: 1.5rem 0; }
    .faq-item h3 { font-size: 1.1rem; font-weight: 500; color: var(--gray-900); margin-bottom: 0.5rem; }
    .faq-item p { color: var(--gray-500); font-weight: 300; margin: 0; }

    /* — Footer — */
    footer {
      background: var(--gray-50); padding: 4rem 0 2rem; border-top: 1px solid var(--gray-200);
      margin-top: 0;
    }
    .footer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; margin-bottom: 3rem; }
    .footer-col h4 { font-weight: 500; margin-bottom: 1.25rem; color: var(--gray-900); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.06em; }
    .footer-col ul { list-style: none; margin: 0; padding: 0; }
    .footer-col li { margin-bottom: 0.6rem; }
    .footer-col a { color: var(--gray-500); font-size: 0.9rem; font-weight: 300; }
    .footer-col a:hover { color: var(--gray-900); }
    .footer-bottom { text-align: center; padding-top: 2rem; border-top: 1px solid var(--gray-200); color: var(--gray-400); font-size: 0.8rem; font-weight: 300; }

    @media (max-width: 768px) {
      .nav-links, .nav-actions { display: none; }
      .hero h1 { font-size: 2rem; }
      .content-section { padding: 1.5rem; border-radius: 0.75rem; }
      .footer-grid { grid-template-columns: 1fr 1fr; }
      .cta-section { padding: 3rem 1.5rem; border-radius: 1rem; }
      table { font-size: 0.85rem; }
      th, td { padding: 0.75rem; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container header-nav">
      <a href="/" class="logo">SpireTrack</a>
      <nav class="nav-links">
        <a href="/features">Features</a>
        <a href="/how-it-works">How It Works</a>
        <a href="/pricing">Pricing</a>
        <a href="/templates">Templates</a>
        <a href="/alternatives">Compare</a>
      </nav>
      <div class="nav-actions">
        <a href="/login" class="btn btn-ghost">Log in</a>
        <a href="/signup" class="btn btn-primary">Get Started Free</a>
      </div>
    </div>
  </header>

  <div class="container">
    <nav class="breadcrumbs">
      ${breadcrumbs.map((b, i) => i === breadcrumbs.length - 1 ? 
        `<span>${b.name}</span>` : 
        `<a href="${b.url}">${b.name}</a><span class="sep">›</span>`
      ).join('')}
    </nav>
  </div>

  <main>
    ${content}
  </main>
  
  ${relatedHtml}

  <div class="container">
    <section class="cta-section">
      <h2>Weekly check-ins that take<br>5 minutes, not 50.</h2>
      <p>Replace status meetings with async reviews. Know what your team is working on—without the endless meetings.</p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; position: relative; z-index: 1;">
        <a href="/signup" class="btn-cta-light">Start Free Trial →</a>
      </div>
    </section>
  </div>

  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Product</h4>
          <ul>
            <li><a href="/features">Features</a></li>
            <li><a href="/how-it-works">How It Works</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/for-teams">For Teams</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="/templates">Templates</a></li>
            <li><a href="/best-async-standup-tools">Best Standup Tools</a></li>
            <li><a href="/about">About</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Compare</h4>
          <ul>
            <li><a href="/alternatives/geekbot">vs Geekbot</a></li>
            <li><a href="/alternatives/slack">vs Slack</a></li>
            <li><a href="/alternatives/monday">vs Monday</a></li>
            <li><a href="/alternatives/standuply">vs Standuply</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        &copy; ${new Date().getFullYear()} SpireTrack. All rights reserved.
      </div>
    </div>
  </footer>
</body>
</html>`;
}

function generateAlternativePage(competitor) {
  const cons = (competitor.cons || []).map(c => `<li>${c}</li>`).join('');
  const missing = (competitor.missing_vs_spiretrack || []).map(m => `<li><strong>${m}:</strong> Built into SpireTrack from day one.</li>`).join('');
  
  const content = `
    <div class="hero">
      <div class="container">
        <div class="badge">Alternative</div>
        <h1>The <span class="gradient-text">${competitor.name} alternative</span><br>built for modern teams</h1>
        <p>${competitor.tagline ? `${competitor.name} — "${competitor.tagline}." ` : ''}Looking for something better? Discover why teams switch to SpireTrack for async standups, team chat, and OKR tracking.</p>
      </div>
    </div>
    
    <div class="container">
      <div class="content-section">
        <h2>Why teams look for a ${competitor.name} alternative</h2>
        <p>${competitor.name} is ${competitor.ideal_for ? `ideal for ${competitor.ideal_for.toLowerCase()}` : 'a popular tool'}. But as teams grow, they run into real limitations:</p>
        <ul>
          ${cons}
        </ul>
        <p>${competitor.spiretrack_advantage || `SpireTrack was built to solve these exact pain points with a clean, all-in-one platform.`}</p>
      </div>

      <div class="content-section">
        <h2>What ${competitor.name} is missing</h2>
        <p>Features that SpireTrack includes out of the box, but ${competitor.name} doesn't:</p>
        <ul>
          ${missing}
        </ul>
      </div>
      
      <div class="content-section">
        <h2>SpireTrack vs ${competitor.name} — full comparison</h2>
        <table>
          <thead>
            <tr>
              <th>Capability</th>
              <th>SpireTrack</th>
              <th>${competitor.name}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Async Weekly Standups</td>
              <td><span class="check">✓ Built-in</span></td>
              <td>${competitor.category === 'async-standup' ? '<span class="check">✓ Yes</span>' : '<span class="cross">✗ Not native</span>'}</td>
            </tr>
            <tr>
              <td>Real-time Team Chat</td>
              <td><span class="check">✓ Built-in</span></td>
              <td>${['chat','project-management'].includes(competitor.category) ? '⚠️ Partial' : '<span class="cross">✗ No</span>'}</td>
            </tr>
            <tr>
              <td>OKR / Goal Tracking</td>
              <td><span class="check">✓ Full tree view</span></td>
              <td>${(competitor.features || []).some(f => f.toLowerCase().includes('goal')) ? '⚠️ Basic' : '<span class="cross">✗ No</span>'}</td>
            </tr>
            <tr>
              <td>AI-Powered Insights</td>
              <td><span class="check">✓ SpireAI</span></td>
              <td><span class="cross">✗ No</span></td>
            </tr>
            <tr>
              <td>Pricing</td>
              <td>Free to start</td>
              <td>${competitor.pricing || 'Varies'}</td>
            </tr>
            <tr>
              <td>Standalone (no Slack required)</td>
              <td><span class="check">✓ Yes</span></td>
              <td>${competitor.category === 'async-standup' ? '<span class="cross">✗ Requires Slack/Teams</span>' : '<span class="check">✓ Yes</span>'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="content-section">
        <h2>${competitor.name}'s strengths</h2>
        <p>To be fair, ${competitor.name} does some things well:</p>
        <ul>
          ${(competitor.pros || []).map(p => `<li><strong>${p}</strong></li>`).join('')}
        </ul>
        <p>But if you need async standups, team chat, and OKR tracking in one place — SpireTrack is the better fit.</p>
      </div>

      <div class="content-section">
        <h2>Switching from ${competitor.name} is easy</h2>
        <p>Most teams are fully set up in under 5 minutes:</p>
        <ul>
          <li><strong>Step 1:</strong> Create your SpireTrack workspace (free).</li>
          <li><strong>Step 2:</strong> Invite your team via email or link.</li>
          <li><strong>Step 3:</strong> Pick a standup template and set your schedule.</li>
          <li><strong>Step 4:</strong> Your first async check-in goes out automatically.</li>
        </ul>
      </div>

      <div class="content-section">
        <h2>Frequently Asked Questions</h2>
        <div itemscope itemtype="https://schema.org/FAQPage">
          <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 itemprop="name">How is SpireTrack different from ${competitor.name}?</h3>
            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <p itemprop="text">${competitor.spiretrack_advantage || `SpireTrack combines async standups, real-time team chat, and OKR tracking in a single platform, while ${competitor.name} focuses on ${competitor.category.replace(/-/g, ' ')}.`}</p>
            </div>
          </div>
          <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 itemprop="name">Is SpireTrack cheaper than ${competitor.name}?</h3>
            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <p itemprop="text">SpireTrack is free to start with generous limits. ${competitor.name} starts at ${competitor.pricing || 'a paid tier'}. For most teams, SpireTrack provides more value per dollar.</p>
            </div>
          </div>
          <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 itemprop="name">Can I use SpireTrack alongside ${competitor.name}?</h3>
            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <p itemprop="text">Yes. Many teams start by running SpireTrack in parallel. Once they see the improvement in team visibility, they typically consolidate into SpireTrack full-time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  return content;
}

function generateComparisonPage(toolA, toolB) {
  const content = `
    <div class="hero">
      <div class="container">
        <div class="badge">Comparison</div>
        <h1><span class="gradient-text">${toolA.name}</span> vs <span class="gradient-text">${toolB.name}</span></h1>
        <p>${toolA.tagline ? `${toolA.name}: "${toolA.tagline}." ` : ''}${toolB.tagline ? `${toolB.name}: "${toolB.tagline}." ` : ''}Which one fits your team?</p>
      </div>
    </div>
    
    <div class="container">
      <div class="content-section">
        <h2>Quick comparison</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>${toolA.name}</th>
              <th>${toolB.name}</th>
              <th>SpireTrack</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Category</td>
              <td>${(toolA.category || '').replace(/-/g, ' ')}</td>
              <td>${(toolB.category || '').replace(/-/g, ' ')}</td>
              <td>All-in-one team OS</td>
            </tr>
            <tr>
              <td>Pricing</td>
              <td>${toolA.pricing || 'Varies'}</td>
              <td>${toolB.pricing || 'Varies'}</td>
              <td>Free to start</td>
            </tr>
            <tr>
              <td>Best for</td>
              <td>${toolA.ideal_for || 'General teams'}</td>
              <td>${toolB.ideal_for || 'General teams'}</td>
              <td>Teams wanting everything in one place</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="content-section">
        <h2>${toolA.name} — strengths and weaknesses</h2>
        <h3>What ${toolA.name} does well</h3>
        <ul>
          ${(toolA.pros || []).map(p => `<li><strong>${p}</strong></li>`).join('')}
        </ul>
        <h3>Where ${toolA.name} falls short</h3>
        <ul>
          ${(toolA.cons || []).map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>

      <div class="content-section">
        <h2>${toolB.name} — strengths and weaknesses</h2>
        <h3>What ${toolB.name} does well</h3>
        <ul>
          ${(toolB.pros || []).map(p => `<li><strong>${p}</strong></li>`).join('')}
        </ul>
        <h3>Where ${toolB.name} falls short</h3>
        <ul>
          ${(toolB.cons || []).map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>

      <div class="content-section" style="background: var(--emerald-50); border-color: var(--emerald-100);">
        <h2>Consider SpireTrack instead</h2>
        <p>If neither ${toolA.name} nor ${toolB.name} ticks all the boxes, <strong>SpireTrack</strong> might be what you need. It combines async weekly standups, real-time team chat, OKR tracking, and AI insights in one platform.</p>
        <ul>
          <li><strong>No Slack dependency</strong> — works as a standalone app</li>
          <li><strong>Built-in OKR trees</strong> — align goals from company to individual</li>
          <li><strong>SpireAI</strong> — get automated team health insights</li>
          <li><strong>Free to start</strong> — no credit card required</li>
        </ul>
        <br>
        <a href="/signup" class="btn btn-cta" style="display: inline-flex;">Start Free Trial →</a>
      </div>
    </div>
  `;
  return content;
}

function generateTemplatePage(template, variant = null) {
  const pageTitle = variant ? `${template.name} for ${variant.name}` : `${template.name} Template`;
  const variantPainPoints = variant && variant.pain_points ? 
    `<h3>Why ${variant.name} teams need this</h3><ul>${variant.pain_points.map(p => `<li>${p}</li>`).join('')}</ul><p>${variant.key_benefit || ''}</p>` : '';
  const variantContext = variant ? 
    `Tailored for <strong>${variant.name}</strong> teams. ${variant.description || ''}` : 
    `${template.description || 'A versatile template for async team updates.'}`;
  
  const content = `
    <div class="hero">
      <div class="container">
        <div class="badge">${template.category || 'Template'}</div>
        <h1><span class="gradient-text">${pageTitle}</span></h1>
        <p>${template.best_for ? `Best for: ${template.best_for}.` : ''} ${template.frequency ? `Recommended frequency: ${template.frequency}.` : ''}</p>
      </div>
    </div>
    
    <div class="container">
      <div class="content-section">
        <h2>About this template</h2>
        <p>${variantContext}</p>
        ${variantPainPoints}
        
        <h3>Template Preview</h3>
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 2rem; border-radius: 1rem; border: 1px solid #334155; margin: 1.5rem 0;">
          <ul style="list-style: none; margin: 0; padding: 0;">
            ${(template.questions || ['What did you do?', 'What will you do next?', 'Any blockers?']).map(q => `
              <li style="margin-bottom: 1rem; font-weight: 400; color: #e2e8f0; padding: 0.75rem 1rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border-left: 3px solid #10b981;">
                <span style="color: #94a3b8; margin-right: 0.5rem;">Q:</span> ${q}
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
      
      <div class="content-section">
        <h2>When to use ${template.name.toLowerCase()}</h2>
        <p>Use this template when you need clear visibility into progress without scheduling a meeting. It's ideal for distributed teams spanning multiple time zones.</p>
        
        <h3>Best Practices</h3>
        <ul>
          <li><strong>Keep it concise:</strong> Encourage brief, bulleted answers to keep updates scannable.</li>
          <li><strong>Highlight blockers early:</strong> Make sure the team reviews blockers immediately so nothing stalls.</li>
          <li><strong>Be consistent:</strong> Schedule this at the same cadence${template.frequency ? ` (${template.frequency.toLowerCase()})` : ''} for best results.</li>
          ${variant ? `<li><strong>Customize for ${variant.name}:</strong> Adjust the questions to match your team's specific workflow and terminology.</li>` : ''}
        </ul>
        
        <br>
        <a href="/signup?template=${template.slug}" class="btn btn-cta" style="display: inline-flex;">Use this template free →</a>
      </div>
    </div>
      </div>
    </div>
  `;
  return content;
}

function generateIndustryPage(industry) {
  const content = `
    <div class="hero">
      <div class="container">
        <div class="badge">Industry</div>
        <h1>Async standups for<br><span class="gradient-text">${industry.name}</span></h1>
        <p>Purpose-built asynchronous status updates and standups for ${industry.name.toLowerCase()} teams.</p>
      </div>
    </div>
    
    <div class="container">
      <div class="content-section">
        <h2>Solve ${industry.name} communication challenges</h2>
        <p>Teams in ${industry.name} face unique challenges when it comes to alignment. Rapidly changing priorities, tight deadlines, and distributed workforce models can make traditional meetings a massive time sink.</p>
        <p>SpireTrack replaces disruptive sync meetings with structured, asynchronous updates tailored for your industry.</p>
        
        <h3>Key Benefits:</h3>
        <ul>
          <li><strong>Regain Focus Time:</strong> Eliminate unnecessary status meetings and let your team do deep work.</li>
          <li><strong>Clear Accountability:</strong> Keep a written record of commitments and progress.</li>
          <li><strong>Unblock Faster:</strong> Surface issues early with automated blocker notifications.</li>
        </ul>
      </div>
      
      <div class="content-section">
        <h2>Recommended Workflows</h2>
        <p>Start with our popular templates customized for ${industry.name}:</p>
        <div class="grid">
          <div class="card">
            <h3>Daily Standup</h3>
            <p>The classic async check-in to align on daily goals.</p>
            <br>
            <a href="/templates/daily-standup/${industry.slug}" style="font-weight: 500;">View Template &rarr;</a>
          </div>
          <div class="card">
            <h3>Weekly Review</h3>
            <p>A higher-level summary of the week's achievements.</p>
            <br>
            <a href="/templates/weekly-review/${industry.slug}" style="font-weight: 500;">View Template &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  `;
  return content;
}

function generateRolePage(role) {
  const content = `
    <div class="hero">
      <div class="container">
        <div class="badge">Role</div>
        <h1>Built for<br><span class="gradient-text">${role.name}s</span></h1>
        <p>Equip your ${role.name.toLowerCase()} teams with the best tools for asynchronous communication and project tracking.</p>
      </div>
    </div>
    
    <div class="container">
      <div class="content-section">
        <h2>Empowering ${role.name}s to do their best work</h2>
        <p>As a ${role.name}, your time is best spent on executing high-value tasks, not sitting in status update meetings. SpireTrack helps you provide visibility to stakeholders without breaking your flow state.</p>
        
        <h3>Why ${role.name}s love SpireTrack:</h3>
        <ul>
          <li><strong>Fewer Interruptions:</strong> Update the team on your schedule.</li>
          <li><strong>Better Documentation:</strong> Written updates create an automatic log of your contributions.</li>
          <li><strong>Clearer Blockers:</strong> Easily flag when you need help from management or peers.</li>
        </ul>
      </div>
    </div>
  `;
  return content;
}

function generateGlossaryPage(termData) {
  const content = `
    <div class="hero">
      <div class="container">
        <div class="badge">Glossary</div>
        <h1><span class="gradient-text">${termData.term}</span></h1>
        <p>${termData.definition ? termData.definition.substring(0, 100) + '...' : 'Definition and meaning.'}</p>
      </div>
    </div>
    
    <div class="container">
      <div class="content-section">
        <h2>What is ${termData.term}?</h2>
        <p>${termData.definition || 'A full definition will be provided here.'}</p>
      </div>
      
      <div class="content-section">
        <h2>How SpireTrack helps with ${termData.term}</h2>
        <p>SpireTrack provides the structure and tools needed to implement <strong>${termData.term}</strong> seamlessly into your team's workflow. Replace chaotic meetings with async updates and regain focus time.</p>
      </div>
      
      ${(termData.related_terms && termData.related_terms.length > 0) ? `
      <div class="content-section">
        <h2>Related Terms</h2>
        <ul>
          ${termData.related_terms.map(rt => `<li><a href="/glossary/${rt}">${rt.replace(/-/g, ' ')}</a></li>`).join('')}
        </ul>
      </div>` : ''}

      <div class="content-section">
        <h2>Frequently Asked Questions</h2>
        <div itemscope itemtype="https://schema.org/FAQPage">
          <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 itemprop="name">What does ${termData.term} mean in Agile?</h3>
            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <p itemprop="text">${termData.definition || 'It is a key concept for modern team productivity and alignment.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  return content;
}

function generateIntegrationPage(integration) {
  const content = `
    <div class="hero">
      <div class="container">
        <div class="badge">Integration</div>
        <h1>SpireTrack + <span class="gradient-text">${integration.name}</span></h1>
        <p>${integration.description || `Connect SpireTrack with ${integration.name} to streamline your workflow.`}</p>
      </div>
    </div>
    
    <div class="container">
      <div class="content-section">
        <h2>How it works</h2>
        <p>${integration.how_it_works || `The ${integration.name} integration automatically syncs your data, keeping your team aligned without context switching.`}</p>
      </div>
      
      <div class="content-section">
        <h2>Key Benefits</h2>
        <ul>
          ${(integration.benefits || ['Save time', 'Reduce context switching', 'Stay aligned']).map(b => `<li>${b}</li>`).join('')}
        </ul>
      </div>
      
      <div class="content-section">
        <h2>Setup Instructions</h2>
        <p>Setting up the ${integration.name} integration takes less than 2 minutes:</p>
        <ul>
          <li><strong>Step 1:</strong> Log in to your SpireTrack workspace.</li>
          <li><strong>Step 2:</strong> Navigate to Settings > Integrations.</li>
          <li><strong>Step 3:</strong> Click "Connect" next to ${integration.name} and follow the prompts.</li>
        </ul>
      </div>
      
      <div class="content-section" style="text-align: center; background: var(--emerald-50); border-color: var(--emerald-100);">
        <h2>Ready to connect ${integration.name}?</h2>
        <p>Start your free trial today and integrate your favorite tools.</p>
        <br>
        <a href="/signup" class="btn btn-cta" style="display: inline-flex;">Get Started Free →</a>
      </div>
    </div>
  `;
  return content;
}

function generateUseCasePage(useCase) {
  const content = `
    <div class="hero">
      <div class="container">
        <div class="badge">Solution</div>
        <h1><span class="gradient-text">${useCase.name}</span></h1>
        <p>${useCase.problem ? useCase.problem.substring(0, 100) + '...' : `Solve ${useCase.name.toLowerCase()} with SpireTrack.`}</p>
      </div>
    </div>
    
    <div class="container">
      <div class="content-section">
        <h2>The Problem</h2>
        <p>${useCase.problem || 'Modern teams struggle with maintaining alignment without overwhelming everyone with meetings and pings.'}</p>
      </div>
      
      <div class="content-section">
        <h2>How SpireTrack Solves It</h2>
        <p>${useCase.solution || 'SpireTrack provides async standups, goal tracking, and clear updates so everyone knows what is happening without the noise.'}</p>
      </div>
      
      <div class="content-section" style="background: var(--gray-900); color: white; border: none;">
        <h2 style="color: white; text-align: center; font-size: 2rem;">${useCase.stats || '85% of teams save 4+ hours a week'}</h2>
        <p style="text-align: center; color: var(--gray-400);">reported by SpireTrack users after switching to async updates.</p>
      </div>
      
      <div class="content-section">
        <h2>Who is this for?</h2>
        <ul>
          ${(useCase.audience || ['Engineering Managers', 'Product Teams', 'Remote Workers']).map(a => `<li><strong>${a.replace(/-/g, ' ')}</strong></li>`).join('')}
        </ul>
      </div>
      
      <div class="content-section" style="text-align: center; background: var(--emerald-50); border-color: var(--emerald-100);">
        <h2>Overcome ${useCase.name} today</h2>
        <p>Join thousands of teams working better, together.</p>
        <br>
        <a href="/signup" class="btn btn-cta" style="display: inline-flex;">Start Free Trial →</a>
      </div>
    </div>
  `;
  return content;
}

async function writePage(urlPath, html) {
  const fullPath = path.join(OUT_DIR, urlPath, 'index.html');
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, html, 'utf-8');
  sitemapUrls.push(urlPath);
}

async function generateSitemap() {
  // Include core SPA marketing pages
  const corePages = [
    { url: '/', priority: '1.0', freq: 'weekly' },
    { url: '/features', priority: '0.9', freq: 'monthly' },
    { url: '/how-it-works', priority: '0.9', freq: 'monthly' },
    { url: '/pricing', priority: '0.8', freq: 'monthly' },
    { url: '/for-teams', priority: '0.8', freq: 'monthly' },
    { url: '/for-founders', priority: '0.8', freq: 'monthly' },
    { url: '/for-small-business', priority: '0.8', freq: 'monthly' },
    { url: '/about', priority: '0.7', freq: 'monthly' },
    { url: '/privacy', priority: '0.3', freq: 'yearly' },
    { url: '/terms', priority: '0.3', freq: 'yearly' },
    { url: '/alternatives/geekbot', priority: '0.8', freq: 'monthly' },
    { url: '/best-async-standup-tools', priority: '0.8', freq: 'monthly' },
  ];

  const now = new Date().toISOString();
  const coreXml = corePages.map(p => `
  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

  const seoXml = sitemapUrls.map(url => `
  <url>
    <loc>${SITE_URL}${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${coreXml}
  ${seoXml}
</urlset>`;

  await fs.writeFile(path.join(OUT_DIR, 'sitemap.xml'), xml, 'utf-8');
  console.log(`Sitemap generated with ${corePages.length + sitemapUrls.length} URLs`);
}

async function readData(filename, fallback) {
  try {
    const dataPath = path.join(DATA_DIR, filename);
    const content = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.warn(`Could not read ${filename}, using fallback data.`);
    return fallback;
  }
}

// Fallback Mock Data to guarantee generation even if JSONs don't exist
const MOCK_COMPETITORS = Array.from({length: 60}, (_, i) => ({ slug: `competitor-${i+1}`, name: `Competitor ${i+1}` }));
const MOCK_TEMPLATES = Array.from({length: 50}, (_, i) => ({ slug: `template-${i+1}`, name: `Template ${i+1}` }));
const MOCK_INDUSTRIES = Array.from({length: 30}, (_, i) => ({ slug: `industry-${i+1}`, name: `Industry ${i+1}` }));
const MOCK_ROLES = Array.from({length: 20}, (_, i) => ({ slug: `role-${i+1}`, name: `Role ${i+1}` }));
const MOCK_GLOSSARY = Array.from({length: 10}, (_, i) => ({ slug: `term-${i+1}`, term: `Term ${i+1}` }));
const MOCK_INTEGRATIONS = Array.from({length: 10}, (_, i) => ({ slug: `integration-${i+1}`, name: `Integration ${i+1}` }));
const MOCK_USE_CASES = Array.from({length: 10}, (_, i) => ({ slug: `use-case-${i+1}`, name: `Use Case ${i+1}` }));

async function main() {
  console.log('Starting SEO pages generation...');
  
  await fs.mkdir(OUT_DIR, { recursive: true });
  
  const competitors = await readData('competitors.json', MOCK_COMPETITORS);
  const templates = await readData('templates.json', MOCK_TEMPLATES);
  const industries = await readData('industries.json', MOCK_INDUSTRIES);
  const roles = await readData('roles.json', MOCK_ROLES);
  const glossaries = await readData('glossary.json', MOCK_GLOSSARY);
  const integrations = await readData('integrations.json', MOCK_INTEGRATIONS);
  const useCases = await readData('use-cases.json', MOCK_USE_CASES);

  // 1. Alternatives
  console.log('Generating Alternatives...');
  for (const comp of competitors) {
    const url = `/alternatives/${comp.slug}`;
    const html = generateHTML({
      title: `Best ${comp.name} Alternative | SpireTrack`,
      description: `Looking for a ${comp.name} alternative? Discover why fast-moving teams choose SpireTrack for asynchronous standups.`,
      canonical: `${SITE_URL}${url}`,
      breadcrumbs: [
        {name: 'Home', url: '/'},
        {name: 'Alternatives', url: '/alternatives'},
        {name: comp.name, url}
      ],
      content: generateAlternativePage(comp)
    });
    await writePage(url, html);
  }

  // 2. Compare SpireTrack vs Competitor
  console.log('Generating SpireTrack vs Competitor...');
  for (const comp of competitors) {
    const url = `/compare/spiretrack-vs-${comp.slug}`;
    const html = generateHTML({
      title: `SpireTrack vs ${comp.name}: Which is Better? | SpireTrack`,
      description: `Compare SpireTrack and ${comp.name} to find the best asynchronous standup tool for your team.`,
      canonical: `${SITE_URL}${url}`,
      breadcrumbs: [
        {name: 'Home', url: '/'},
        {name: 'Compare', url: '/compare'},
        {name: `SpireTrack vs ${comp.name}`, url}
      ],
      content: generateComparisonPage({name: 'SpireTrack'}, comp)
    });
    await writePage(url, html);
  }

  // 3. Compare Competitor A vs Competitor B (Top 30 pairs)
  console.log('Generating Competitor A vs B...');
  const topCompetitors = competitors.slice(0, 30);
  for (let i = 0; i < topCompetitors.length; i++) {
    for (let j = i + 1; j < topCompetitors.length; j++) {
      const compA = topCompetitors[i];
      const compB = topCompetitors[j];
      const url = `/compare/${compA.slug}-vs-${compB.slug}`;
      const html = generateHTML({
        title: `${compA.name} vs ${compB.name}: Which is Better? | SpireTrack`,
        description: `In-depth comparison of ${compA.name} vs ${compB.name} for team updates and standups.`,
        canonical: `${SITE_URL}${url}`,
        breadcrumbs: [
          {name: 'Home', url: '/'},
          {name: 'Compare', url: '/compare'},
          {name: `${compA.name} vs ${compB.name}`, url}
        ],
        content: generateComparisonPage(compA, compB)
      });
      await writePage(url, html);
    }
  }

  // 4. Templates
  console.log('Generating Templates...');
  for (const temp of templates) {
    const url = `/templates/${temp.slug}`;
    const html = generateHTML({
      title: `${temp.name} Template | SpireTrack`,
      description: `Free ${temp.name} template for remote and async teams.`,
      canonical: `${SITE_URL}${url}`,
      breadcrumbs: [
        {name: 'Home', url: '/'},
        {name: 'Templates', url: '/templates'},
        {name: temp.name, url}
      ],
      content: generateTemplatePage(temp)
    });
    await writePage(url, html);

    // Template x Industry
    for (const ind of industries) {
      const indUrl = `/templates/${temp.slug}/${ind.slug}`;
      const indHtml = generateHTML({
        title: `${temp.name} Template for ${ind.name} | SpireTrack`,
        description: `${temp.name} template tailored for ${ind.name} teams.`,
        canonical: `${SITE_URL}${indUrl}`,
        breadcrumbs: [
          {name: 'Home', url: '/'},
          {name: 'Templates', url: '/templates'},
          {name: temp.name, url: url},
          {name: ind.name, url: indUrl}
        ],
        content: generateTemplatePage(temp, ind)
      });
      await writePage(indUrl, indHtml);
    }

    // Template x Role
    for (const role of roles) {
      const roleUrl = `/templates/${temp.slug}/${role.slug}`;
      const roleHtml = generateHTML({
        title: `${temp.name} Template for ${role.name}s | SpireTrack`,
        description: `${temp.name} template tailored for ${role.name}s.`,
        canonical: `${SITE_URL}${roleUrl}`,
        breadcrumbs: [
          {name: 'Home', url: '/'},
          {name: 'Templates', url: '/templates'},
          {name: temp.name, url: url},
          {name: role.name, url: roleUrl}
        ],
        content: generateTemplatePage(temp, role)
      });
      await writePage(roleUrl, roleHtml);
    }
  }

  // 5. Industry
  console.log('Generating Industry pages...');
  for (const ind of industries) {
    const url = `/for/${ind.slug}`;
    const html = generateHTML({
      title: `Asynchronous Standups for ${ind.name} | SpireTrack`,
      description: `How ${ind.name} teams use SpireTrack to eliminate meetings and stay aligned.`,
      canonical: `${SITE_URL}${url}`,
      breadcrumbs: [
        {name: 'Home', url: '/'},
        {name: 'For Industries', url: '/for'},
        {name: ind.name, url}
      ],
      content: generateIndustryPage(ind)
    });
    await writePage(url, html);
  }

  // 6. Role
  console.log('Generating Role pages...');
  for (const role of roles) {
    const url = `/for/${role.slug}`;
    const html = generateHTML({
      title: `SpireTrack for ${role.name}s | Async Status Updates`,
      description: `Why ${role.name}s prefer SpireTrack for asynchronous team updates.`,
      canonical: `${SITE_URL}${url}`,
      breadcrumbs: [
        {name: 'Home', url: '/'},
        {name: 'For Roles', url: '/for'},
        {name: role.name, url}
      ],
      content: generateRolePage(role)
    });
    await writePage(url, html);
  }

  // 7. Glossary
  console.log('Generating Glossary pages...');
  for (const term of glossaries) {
    const url = `/glossary/${term.slug}`;
    const html = generateHTML({
      title: `${term.term} | SpireTrack Glossary`,
      description: `Learn about ${term.term} and how it applies to modern team productivity.`,
      canonical: `${SITE_URL}${url}`,
      breadcrumbs: [
        {name: 'Home', url: '/'},
        {name: 'Glossary', url: '/glossary'},
        {name: term.term, url}
      ],
      content: generateGlossaryPage(term)
    });
    await writePage(url, html);
  }

  // 8. Integrations
  console.log('Generating Integration pages...');
  for (const integration of integrations) {
    const url = `/integrations/${integration.slug}`;
    const html = generateHTML({
      title: `${integration.name} Integration | SpireTrack`,
      description: `Connect SpireTrack with ${integration.name} to streamline your async standups and updates.`,
      canonical: `${SITE_URL}${url}`,
      breadcrumbs: [
        {name: 'Home', url: '/'},
        {name: 'Integrations', url: '/integrations'},
        {name: integration.name, url}
      ],
      content: generateIntegrationPage(integration)
    });
    await writePage(url, html);
  }

  // 9. Use Cases / Solutions
  console.log('Generating Use Case pages...');
  for (const useCase of useCases) {
    const url = `/solutions/${useCase.slug}`;
    const html = generateHTML({
      title: `${useCase.name} Solution | SpireTrack`,
      description: `How SpireTrack solves ${useCase.name.toLowerCase()} for your team.`,
      canonical: `${SITE_URL}${url}`,
      breadcrumbs: [
        {name: 'Home', url: '/'},
        {name: 'Solutions', url: '/solutions'},
        {name: useCase.name, url}
      ],
      content: generateUseCasePage(useCase)
    });
    await writePage(url, html);
  }

  await generateSitemap();
  console.log('SEO Generation complete!');
}

main().catch(err => {
  console.error('Failed to generate SEO pages:', err);
  process.exit(1);
});
