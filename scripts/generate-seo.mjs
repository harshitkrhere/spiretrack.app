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
      --gray-50: #fafafa;
      --gray-100: #f5f5f5;
      --gray-200: #e5e5e5;
      --gray-300: #d4d4d4;
      --gray-400: #a3a3a3;
      --gray-500: #737373;
      --gray-600: #525252;
      --gray-700: #404040;
      --gray-800: #262626;
      --gray-900: #171717;
      --primary: var(--gray-900);
      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: var(--font-sans);
      color: var(--gray-800);
      line-height: 1.6;
      background-color: var(--gray-50);
      -webkit-font-smoothing: antialiased;
    }
    
    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    
    header {
      background: white;
      border-bottom: 1px solid var(--gray-200);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .header-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 4rem;
    }
    
    .logo {
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--gray-900);
    }
    
    .nav-links { display: flex; gap: 2rem; }
    .nav-links a { color: var(--gray-600); font-weight: 500; font-size: 0.95rem; }
    .nav-links a:hover { color: var(--gray-900); text-decoration: none; }
    
    .btn {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      text-align: center;
      transition: all 0.2s;
    }
    .btn-primary { background: var(--gray-900); color: white; }
    .btn-primary:hover { background: var(--gray-800); text-decoration: none; color: white; }
    .btn-outline { border: 1px solid var(--gray-300); color: var(--gray-700); }
    .btn-outline:hover { background: var(--gray-50); text-decoration: none; }
    
    .breadcrumbs {
      padding: 1.5rem 0;
      font-size: 0.875rem;
      color: var(--gray-500);
    }
    .breadcrumbs a { color: var(--gray-600); }
    .breadcrumbs span { margin: 0 0.5rem; }
    
    main { min-height: 60vh; padding-bottom: 4rem; }
    
    .hero {
      padding: 4rem 0;
      text-align: center;
      background: white;
      border-bottom: 1px solid var(--gray-200);
      margin-bottom: 3rem;
    }
    .hero h1 { font-size: 3rem; font-weight: 800; color: var(--gray-900); margin-bottom: 1rem; line-height: 1.2; }
    .hero p { font-size: 1.25rem; color: var(--gray-600); max-width: 800px; margin: 0 auto; }
    
    .content-section {
      background: white;
      border-radius: 0.5rem;
      padding: 3rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid var(--gray-200);
    }
    
    .content-section h2 { font-size: 2rem; margin-bottom: 1.5rem; color: var(--gray-900); }
    .content-section h3 { font-size: 1.5rem; margin: 1.5rem 0 1rem; color: var(--gray-800); }
    .content-section p { margin-bottom: 1rem; }
    .content-section ul { margin: 0 0 1.5rem 2rem; }
    .content-section li { margin-bottom: 0.5rem; }
    
    table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
    th, td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--gray-200); }
    th { background: var(--gray-50); font-weight: 600; color: var(--gray-900); }
    
    .cta-section {
      text-align: center;
      padding: 5rem 0;
      background: var(--gray-900);
      color: white;
      margin-top: 4rem;
    }
    .cta-section h2 { font-size: 2.5rem; margin-bottom: 1rem; color: white; }
    .cta-section p { font-size: 1.25rem; color: var(--gray-300); margin-bottom: 2rem; }
    .cta-section .btn-primary { background: white; color: var(--gray-900); font-size: 1.125rem; padding: 0.75rem 2rem; }
    .cta-section .btn-primary:hover { background: var(--gray-100); }
    
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
    .card {
      background: white; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid var(--gray-200);
      transition: box-shadow 0.2s, transform 0.2s;
      display: block; color: inherit;
    }
    .card:hover { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); transform: translateY(-2px); text-decoration: none; }
    .card h3 { font-size: 1.25rem; color: var(--gray-900); margin-bottom: 0.5rem; }
    .card p { color: var(--gray-600); font-size: 0.95rem; margin: 0; }
    
    footer {
      background: white; padding: 4rem 0 2rem; border-top: 1px solid var(--gray-200); margin-top: 4rem;
    }
    .footer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; margin-bottom: 3rem; }
    .footer-col h4 { font-weight: 600; margin-bottom: 1.5rem; color: var(--gray-900); }
    .footer-col ul { list-style: none; margin: 0; padding: 0; }
    .footer-col li { margin-bottom: 0.75rem; }
    .footer-col a { color: var(--gray-500); }
    .footer-col a:hover { color: var(--gray-900); }
    
    @media (max-width: 768px) {
      .nav-links { display: none; }
      .hero h1 { font-size: 2rem; }
      .footer-grid { grid-template-columns: 1fr 1fr; }
      .content-section { padding: 1.5rem; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container header-nav">
      <a href="/" class="logo">SpireTrack</a>
      <nav class="nav-links">
        <a href="/features">Features</a>
        <a href="/pricing">Pricing</a>
        <a href="/templates">Templates</a>
        <a href="/alternatives">Compare</a>
      </nav>
      <div style="display: flex; gap: 1rem;">
        <a href="/login" class="btn btn-outline">Login</a>
        <a href="/signup" class="btn btn-primary">Sign Up</a>
      </div>
    </div>
  </header>

  <div class="container">
    <nav class="breadcrumbs">
      ${breadcrumbs.map((b, i) => i === breadcrumbs.length - 1 ? 
        `<span>${b.name}</span>` : 
        `<a href="${b.url}">${b.name}</a> <span>/</span>`
      ).join('')}
    </nav>
  </div>

  <main>
    ${content}
  </main>
  
  ${relatedHtml}

  <section class="cta-section">
    <div class="container">
      <h2>Ready to streamline your team updates?</h2>
      <p>Join thousands of teams using SpireTrack for asynchronous standups and status reports.</p>
      <a href="/signup" class="btn btn-primary">Try SpireTrack Free</a>
    </div>
  </section>

  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Product</h4>
          <ul>
            <li><a href="/features">Features</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/integrations">Integrations</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="/templates">Templates</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/help">Help Center</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Compare</h4>
          <ul>
            <li><a href="/alternatives/geekbot">Geekbot Alternative</a></li>
            <li><a href="/alternatives/standuply">Standuply Alternative</a></li>
            <li><a href="/alternatives/status-hero">Status Hero Alternative</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div style="text-align: center; color: var(--gray-500); font-size: 0.875rem;">
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
        <h1>Best ${competitor.name} Alternative for Team Standups</h1>
        <p>Looking for a ${competitor.name} alternative? Discover why fast-moving teams choose SpireTrack for asynchronous standups, clear reporting, and better team visibility.</p>
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
          <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 itemprop="name">Is SpireTrack cheaper than ${competitor.name}?</h3>
            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <p itemprop="text">Yes, for most teams, SpireTrack offers a more cost-effective solution with transparent, flat-rate pricing plans.</p>
            </div>
          </div>
          <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 itemprop="name">Can I use SpireTrack with Slack?</h3>
            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <p itemprop="text">Absolutely. SpireTrack integrates deeply with Slack, Microsoft Teams, and email to ensure your team can post updates where they already work.</p>
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
        <h1>${toolA.name} vs ${toolB.name}: Which Is Better for Your Team?</h1>
        <p>An in-depth comparison of ${toolA.name} and ${toolB.name} for team standups and asynchronous reporting.</p>
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
        <h1>${pageTitle}</h1>
        <p>Streamline your workflow with our battle-tested ${template.name.toLowerCase()} format. Ready to use in SpireTrack.</p>
      </div>
    </div>
    
    <div class="container">
      <div class="content-section">
        <h2>About this template</h2>
        <p>${contextText} teams capture essential updates asynchronously without interrupting deep work. By standardizing the questions asked, you ensure consistent, actionable reporting.</p>
        
        <h3>Template Preview:</h3>
        <div style="background: var(--gray-50); padding: 1.5rem; border-radius: 0.5rem; border: 1px solid var(--gray-200); margin: 1.5rem 0;">
          <ul style="list-style: none; margin: 0; padding: 0;">
            ${(template.questions || ['What did you do yesterday?', 'What will you do today?', 'Any blockers?']).map(q => `
              <li style="margin-bottom: 1rem; font-weight: 500;">
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
        <h1>SpireTrack for ${industry.name}</h1>
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
        <h1>SpireTrack for ${role.name}s</h1>
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
