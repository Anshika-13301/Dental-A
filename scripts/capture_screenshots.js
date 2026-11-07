const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const puppeteer = require('puppeteer-core');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDirProject = path.join(__dirname, '..', 'docs', 'screenshots');
const outDirArtifact = 'C:\\Users\\rajsh\\.gemini\\antigravity\\brain\\1d6bb60d-5ac3-4509-9d29-f30dfb9c73ff\\screenshots';

fs.mkdirSync(outDirProject, { recursive: true });
fs.mkdirSync(outDirArtifact, { recursive: true });

function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 304 || res.statusCode === 307) {
          resolve();
        } else {
          setTimeout(check, 500);
        }
      }).on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Server start timed out'));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

async function main() {
  console.log('[Capture] Starting Next.js server on port 3000...');
  const nextServer = spawn('npm.cmd', ['run', 'start'], {
    cwd: path.join(__dirname, '..', 'frontend'),
    shell: true,
    stdio: 'ignore'
  });

  try {
    await waitForServer('http://localhost:3000');
    console.log('[Capture] Server is live on http://localhost:3000. Launching Chrome...');

    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      defaultViewport: { width: 1440, height: 900 }
    });

    const page = await browser.newPage();

    const saveScreenshot = async (name) => {
      const p1 = path.join(outDirProject, `${name}.png`);
      const p2 = path.join(outDirArtifact, `${name}.png`);
      await page.screenshot({ path: p1, fullPage: false });
      fs.copyFileSync(p1, p2);
      console.log(`[Captured] ${name}.png`);
    };

    // 1. Landing Page
    console.log('[Capture] 1. Landing Page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));
    await saveScreenshot('01-landing-page');

    // 2. Landing Page ROI Calculator
    console.log('[Capture] 2. Landing Page ROI Calculator...');
    await page.evaluate(() => {
      const el = document.getElementById('calculator');
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 800));
    await saveScreenshot('02-roi-calculator');

    // 3. Login Screen
    console.log('[Capture] 3. Login Screen...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 800));
    await saveScreenshot('03-login-screen');

    // 4. Verify OTP Screen
    console.log('[Capture] 4. Verify OTP Screen...');
    await page.goto('http://localhost:3000/verify-otp?email=dr.chen%40brightsmiledental.com', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 800));
    await saveScreenshot('04-verify-otp');

    // Setup authenticated session for Dr. Sarah Chen
    await page.evaluate(() => {
      localStorage.setItem('dentagent_token', 'mock_jwt_token_dr_chen_2026');
      localStorage.setItem('dentagent_user', JSON.stringify({
        id: 'usr_001',
        name: 'Dr. Sarah Chen, DDS',
        email: 'dr.chen@brightsmiledental.com',
        role: 'PRACTICE_ADMIN',
        isVerified: true,
        practice: {
          _id: 'ten_001',
          practiceName: 'BrightSmile Dental Care',
          phoneNumber: '+1 (555) 234-5678',
          status: 'ACTIVE',
          subscription: { flatFee: 600, perBookingCommission: 20 }
        }
      }));
    });

    // 5. Dashboard Overview
    console.log('[Capture] 5. Dashboard Overview...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));
    await saveScreenshot('05-dashboard-overview');

    // 6. Overdue Patient Registry
    console.log('[Capture] 6. Overdue Patient Registry...');
    await page.goto('http://localhost:3000/patients', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));
    await saveScreenshot('06-patient-registry');

    // 7. Hygiene Chairs Schedule
    console.log('[Capture] 7. Hygiene Chairs Schedule...');
    await page.goto('http://localhost:3000/appointments', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));
    await saveScreenshot('07-hygiene-chairs');

    // 8. SMS Inbox & Two-Way Center
    console.log('[Capture] 8. SMS Inbox...');
    await page.goto('http://localhost:3000/inbox', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));
    await saveScreenshot('08-sms-inbox');

    // 9. Recall Cadence Campaigns
    console.log('[Capture] 9. Recall Cadence Campaigns...');
    await page.goto('http://localhost:3000/campaigns', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));
    await saveScreenshot('09-recall-cadence');

    // 10. Practice Billing & Statements ($600 base + $20/chair)
    console.log('[Capture] 10. Practice Billing Audit...');
    await page.goto('http://localhost:3000/billing', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));
    await saveScreenshot('10-billing-audit');

    // 11. Settings & AI Tuning
    console.log('[Capture] 11. Practice Settings...');
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));
    await saveScreenshot('11-settings-tuning');

    // 12. Super Admin Portfolio
    console.log('[Capture] 12. Super Admin Portfolio...');
    await page.evaluate(() => {
      localStorage.setItem('dentagent_user', JSON.stringify({
        id: 'usr_admin',
        name: 'Alexander Wright',
        email: 'admin@dentagent.ai',
        role: 'SUPER_ADMIN',
        isVerified: true
      }));
    });
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));
    await saveScreenshot('12-admin-portfolio');

    await browser.close();
    console.log('[Capture] All 12 screenshots captured successfully!');
  } finally {
    try {
      process.kill(-nextServer.pid);
    } catch (e) {
      nextServer.kill();
    }
  }
}

main().catch((err) => {
  console.error('[Capture Error]', err);
  process.exit(1);
});
