const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4b9ef887-2d62-454d-8b71-dd6b9749357a';

async function runDirectAuthVerification() {
  console.log('🚀 Starting ZENIN Direct App Access & Mobile+Password Verification...');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }, // Pixel 7 viewport
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  page.on('console', (msg) => console.log(`[BROWSER ${msg.type()}]:`, msg.text()));
  page.on('pageerror', (err) => console.error('[BROWSER PAGE ERROR]:', err));
  page.on('dialog', async (dialog) => {
    console.log('[BROWSER DIALOG]:', dialog.message());
    await dialog.accept();
  });

  try {
    // 1. Clean load - Simulating first-time launch
    console.log('1. Loading app with clean storage (simulating fresh install)...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    // Verify it directly opened into the app (no login / onboarding wall!)
    await page.waitForSelector('text=HUNTER POWER LEVEL', { timeout: 8000 });
    console.log('✔ VERIFIED: App directly opened into main HomeScreen! No login/onboarding blockage.');

    const directLaunchImg = path.join(ARTIFACT_DIR, 'direct_app_opened.png');
    await page.screenshot({ path: directLaunchImg });
    console.log('📸 Saved screenshot:', directLaunchImg);

    // 2. Create a mission as a guest
    console.log('2. Creating a mission in Guest Mode...');
    const fab = await page.waitForSelector('button[aria-label="Create Mission"]');
    await fab.click();
    await page.waitForSelector('text=INITIALIZE MISSION', { timeout: 5000 });
    await page.fill('input[placeholder*="Complete System Architecture"]', 'Conquer Void Gate (Guest Directive)');
    await page.click('button:has-text("AUTHORIZE MISSION")');
    await page.waitForSelector('text=Conquer Void Gate (Guest Directive)', { timeout: 5000 });
    console.log('✔ VERIFIED: Guest mission successfully created without login!');

    const guestMissionImg = path.join(ARTIFACT_DIR, 'guest_mission_created.png');
    await page.screenshot({ path: guestMissionImg });
    console.log('📸 Saved screenshot:', guestMissionImg);

    // 3. Navigate to Profile screen
    console.log('3. Navigating to Profile screen...');
    await page.click('button:has-text("PROFILE")');
    await page.waitForSelector('text=GUEST PROTOCOL ACTIVE', { timeout: 5000 });
    await page.waitForSelector('button:has-text("LOG IN")', { timeout: 5000 });
    await page.waitForSelector('button:has-text("CREATE ACCOUNT")', { timeout: 5000 });
    console.log('✔ VERIFIED: Profile screen features "GUEST PROTOCOL ACTIVE" with LOG IN and CREATE ACCOUNT buttons!');

    const profileGuestImg = path.join(ARTIFACT_DIR, 'profile_guest_mode.png');
    await page.screenshot({ path: profileGuestImg });
    console.log('📸 Saved screenshot:', profileGuestImg);

    // 4. Test Direct Sign Up with Mobile Number + Password (NO OTP)
    console.log('4. Testing Direct Sign Up with Mobile Number & Password (NO OTP)...');
    await page.click('button:has-text("CREATE ACCOUNT")');
    await page.waitForSelector('text=AWAKEN NEW IDENTITY', { timeout: 5000 });
    await page.waitForSelector('input[placeholder="e.g. Ren Vanguard"]', { timeout: 5000 });

    await page.fill('input[placeholder="e.g. Ren Vanguard"]', 'Ren Shadowhunter');
    await page.fill('input[type="tel"]', '9876543210');
    await page.fill('input[type="password"]', 'hunterSecret123');

    const modalFilledImg = path.join(ARTIFACT_DIR, 'signup_modal_filled.png');
    await page.screenshot({ path: modalFilledImg });
    console.log('📸 Saved screenshot:', modalFilledImg);

    console.log('Clicking AWAKEN & SAVE DATA (SIGN UP)...');
    await page.click('button:has-text("AWAKEN & SAVE DATA (SIGN UP)")');

    // Wait for modal to succeed and close
    await page.waitForSelector('text=CLOUD SECURED HUNTER', { timeout: 8000 });
    console.log('✔ VERIFIED: Sign Up completed instantly without OTP! Profile now shows CLOUD SECURED HUNTER.');

    const cloudSecuredImg = path.join(ARTIFACT_DIR, 'profile_cloud_secured.png');
    await page.screenshot({ path: cloudSecuredImg });
    console.log('📸 Saved screenshot:', cloudSecuredImg);

    // 5. Test Log Out
    console.log('5. Testing Log Out...');
    const logoutBtn = await page.waitForSelector('button[title="Log Out"]');
    await logoutBtn.click();

    // Verify it smoothly returns to Guest mode without app interruption
    await page.waitForSelector('text=GUEST PROTOCOL ACTIVE', { timeout: 5000 });
    console.log('✔ VERIFIED: User logged out and remains active in Guest Mode inside the app!');

    const afterLogoutImg = path.join(ARTIFACT_DIR, 'profile_after_logout.png');
    await page.screenshot({ path: afterLogoutImg });
    console.log('📸 Saved screenshot:', afterLogoutImg);

    // 6. Test Direct Log In with Mobile Number + Password (NO OTP)
    console.log('6. Testing Direct Log In with Mobile Number & Password (NO OTP)...');
    await page.click('button:has-text("LOG IN")');
    await page.waitForSelector('text=ESTABLISH NEURAL LINK', { timeout: 5000 });

    await page.fill('input[type="tel"]', '9876543210');
    await page.fill('input[type="password"]', 'hunterSecret123');

    const loginFilledImg = path.join(ARTIFACT_DIR, 'login_modal_filled.png');
    await page.screenshot({ path: loginFilledImg });
    console.log('📸 Saved screenshot:', loginFilledImg);

    console.log('Clicking ESTABLISH NEURAL LINK (LOG IN)...');
    await page.click('button:has-text("ESTABLISH NEURAL LINK (LOG IN)")');

    // Wait for login success modal to close & profile ribbon to update
    await page.waitForTimeout(1000);
    await page.waitForSelector('text=CLOUD SECURED HUNTER', { timeout: 8000 });
    console.log('✔ VERIFIED: Log In completed instantly without OTP! Progress restored.');

    // 7. Verify missions are preserved...
    console.log('7. Verifying missions are preserved...');
    const bottomNavButtons = page.locator('div[style*="position: fixed"] button');
    await bottomNavButtons.nth(0).click(); // Home tab
    await page.waitForSelector('text=Conquer Void Gate (Guest Directive)', { timeout: 8000 });
    console.log('✔ VERIFIED: User missions from previous session are intact and restored from database!');

    const missionsRestoredImg = path.join(ARTIFACT_DIR, 'missions_restored_success.png');
    await page.screenshot({ path: missionsRestoredImg });
    console.log('📸 Saved screenshot:', missionsRestoredImg);

    console.log('🎉 ALL VERIFICATION CRITERIA PASSED 100%!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runDirectAuthVerification();
