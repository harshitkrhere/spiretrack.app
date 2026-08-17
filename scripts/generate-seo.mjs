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
  const content = `
    <div class="hero">
      <div class="container">
        <div class="badge">Alternative</div>
        <h1>The <span class="gradient-text">${competitor.name} alternative</span><br>built for modern teams</h1>
        <p>Looking for a ${competitor.name} alternative? Discover why fast-moving teams choose SpireTrack for async standups, clear reporting, and better team visibility.</p>
      </div>
    </div>
    
    <div class="container">
      <div class="content-section">
        <h2>Why look for a ${competitor.name} alternative?</h2>
        <p>While ${competitor.name} is a popular tool for team updates, many teams outgrow it as they scale. Common challenges include complex pricing, cluttered interfaces, or a lack of deeper analytics.</p>
        <p>SpireTrack was built from the ground up to solve these exact pain points. We provide a clean, focused experience that makes async communication seamless for engineering, product, and remote teams.</p>
        
        <h3>Why teams switch to SpireTrack:</h3>
        <ul>
          <li><strong>Simpler Interface:</strong> No more fighting with clunky bots. Our web dashboard and Slack/Teams integrations are intuitive and fast.</li>
          <li><strong>Transparent Pricing:</strong> Simple, predictable pricing without hidden fees for essential features.</li>
          <li><strong>Better Analytics:</strong> Track team blockers and sentiment over time with robust reporting.</li>
          <li><strong>Customizable Templates:</strong> Go beyond standard standups with versatile templates for 1-on-1s, retro, and project check-ins.</li>
        </ul>
      </div>
      
      <div class="content-section">
        <h2>SpireTrack vs ${competitor.name} Comparison</h2>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>SpireTrack</th>
              <th>${competitor.name}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Asynchronous Standups</td>
              <td>✅ Yes</td>
              <td>✅ Yes</td>
            </tr>
            <tr>
              <td>Blocker Tracking & Analytics</td>
              <td>✅ Advanced</td>
              <td>⚠️ Basic</td>
            </tr>
            <tr>
              <td>Custom Workflows</td>
              <td>✅ Unlimited</td>
              <td>⚠️ Limited by tier</td>
            </tr>
            <tr>
              <td>Interface</td>
              <td>Modern, Clean Web & App</td>
              <td>Chat-focused</td>
            </tr>
            <tr>
              <td>Pricing</td>
              <td>Flat-rate, predictable</td>
              <td>Per-user, complex</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="content-section">
        <h2>Effortless Migration</h2>
        <p>Switching from ${competitor.name} to SpireTrack takes less than 5 minutes. Import your existing team roster, set up your preferred schedules, and start running better standups today.</p>
      </div>

      <div class="content-section">
        <h2>Frequently Asked Questions</h2>
        <div itemscope itemtype="https://schema.org/FAQPage">
          <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 itemprop="name">Is SpireTrack cheaper than ${competitor.name}?</h3>
            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <p itemprop="text">Yes, for most teams, SpireTrack offers a more cost-effective solution with transparent, flat-rate pricing plans.</p>
            </div>
          </div>
          <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 itemprop="name">Can I use SpireTrack with Slack?</h3>
            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <p itemprop="text">Absolutely. SpireTrack integrates deeply with Slack, Microsoft Teams, and email to ensure your team can post updates where they already work.</p>
            </div>
          </div>
          <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 itemprop="name">How long does it take to switch from ${competitor.name}?</h3>
            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <p itemprop="text">Most teams are fully set up in under 5 minutes. Import your team, customize your check-in template, and you're ready to go.</p>
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
        <p>An in-depth comparison to help you pick the right tool for your team's standups and async reporting.</p>
      </div>
    </div>
    
    <div class="container">
      <div class="content-section">
        <h2>Overview: ${toolA.name} vs ${toolB.name}</h2>
        <p>Choosing the right tool for asynchronous team updates is crucial for productivity. Both ${toolA.name} and ${toolB.name} offer robust features, but they cater to slightly different workflows.</p>
        
        <table>
          <thead>
            <tr>
              <th>Feature Area</th>
              <th>${toolA.name}</th>
              <th>${toolB.name}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ease of Use</td>
              <td>High</td>
              <td>Moderate</td>
            </tr>
            <tr>
              <td>Integrations</td>
              <td>Extensive</td>
              <td>Focused</td>
            </tr>
            <tr>
              <td>Pricing Model</td>
              <td>Per User</td>
              <td>Tiered</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="content-section">
        <h2>Detailed Feature Breakdown</h2>
        <h3>Standup Formats</h3>
        <p>When comparing ${toolA.name} and ${toolB.name}, consider how flexible their reporting formats are. ${toolA.name} tends to focus on rapid check-ins, while ${toolB.name} provides more structured survey options.</p>
        
        <h3>Reporting and Analytics</h3>
        <p>Understanding team health is vital. ${toolA.name} provides solid basic reporting, whereas ${toolB.name} might offer more granular data exports depending on your pricing tier.</p>
      </div>

      <div class="content-section" style="background: var(--gray-100); border-color: var(--gray-300);">
        <h2>Consider a Third Option: SpireTrack</h2>
        <p>Still undecided between ${toolA.name} and ${toolB.name}? <strong>SpireTrack</strong> combines the best of both worlds with an intuitive interface, powerful analytics, and transparent pricing.</p>
        <ul>
          <li>Setup in minutes</li>
          <li>Deeper insights into team blockers</li>
          <li>Cost-effective for scaling teams</li>
        </ul>
        <br>
        <a href="/signup" class="btn btn-primary">Try SpireTrack Free</a>
      </div>
    </div>
  `;
  return content;
}

function generateTemplatePage(template, variant = null) {
  const pageTitle = variant ? `${template.name} for ${variant.name}` : `${template.name} Template`;
  const contextText = variant ? `Tailored specifically for ${variant.name}s, this template helps` : `This versatile template helps`;
  
  const content = `
    <div class="hero">
      <div class="container">
        <div class="badge">Template</div>
        <h1><span class="gradient-text">${pageTitle}</span></h1>
        <p>Streamline your workflow with our battle-tested ${template.name.toLowerCase()} format. Ready to use in SpireTrack.</p>
      </div>
    </div>
    
    <div class="container">
      <div class="content-section">
        <h2>About this template</h2>
        <p>${contextText} teams capture essential updates asynchronously without interrupting deep work. By standardizing the questions asked, you ensure consistent, actionable reporting.</p>
        
        <h3>Template Preview:</h3>
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 2rem; border-radius: 1rem; border: 1px solid #334155; margin: 1.5rem 0;">
          <ul style="list-style: none; margin: 0; padding: 0;">
            ${(template.questions || ['What did you do yesterday?', 'What will you do today?', 'Any blockers?']).map(q => `
              <li style="margin-bottom: 1rem; font-weight: 400; color: #e2e8f0; padding: 0.75rem 1rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border-left: 3px solid #10b981;">
                <span style="color: var(--gray-500); margin-right: 0.5rem;">Q:</span> ${q}
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
      
      <div class="content-section">
        <h2>When to use this template</h2>
        <p>Use the ${template.name} template when you need clear visibility into progress without scheduling a meeting. It is ideal for distributed teams spanning multiple time zones, or hybrid teams balancing office and remote work.</p>
        
        <h3>Best Practices</h3>
        <ul>
          <li><strong>Keep it concise:</strong> Encourage brief, bulleted answers.</li>
          <li><strong>Highlight blockers early:</strong> Ensure the team reviews blockers immediately.</li>
          <li><strong>Be consistent:</strong> Schedule this update at the same time regularly.</li>
        </ul>
        
        <br>
        <a href="/signup?template=${template.slug}" class="btn btn-primary">Use this template in SpireTrack</a>
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

async function main() {
  console.log('Starting SEO pages generation...');
  
  await fs.mkdir(OUT_DIR, { recursive: true });
  
  const competitors = await readData('competitors.json', MOCK_COMPETITORS);
  const templates = await readData('templates.json', MOCK_TEMPLATES);
  const industries = await readData('industries.json', MOCK_INDUSTRIES);
  const roles = await readData('roles.json', MOCK_ROLES);

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

  await generateSitemap();
  console.log('SEO Generation complete!');
}

main().catch(err => {
  console.error('Failed to generate SEO pages:', err);
  process.exit(1);
});
