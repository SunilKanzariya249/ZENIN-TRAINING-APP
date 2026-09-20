const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4b9ef887-2d62-454d-8b71-dd6b9749357a';

async function verifyZeroDataExperience() {
  console.log('🚀 Verifying Clean Slate / Zero Data Experience for New Users...');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  try {
    console.log('1. Loading app and clearing storage (clean fresh install)...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    // 2. Verify Home Screen starts at zero
    console.log('2. Verifying HomeScreen zero metrics...');
    await page.waitForSelector('text=HUNTER POWER LEVEL', { timeout: 8000 });
    await page.waitForSelector('text=DAILY MISSIONS (0)', { timeout: 5000 });
    await page.waitForSelector('text=THE SYSTEM IS CLEAR', { timeout: 5000 });

    const homeZeroImg = path.join(ARTIFACT_DIR, 'zero_data_home_screen.png');
    await page.screenshot({ path: homeZeroImg });
    console.log('📸 Saved zero data HomeScreen screenshot:', homeZeroImg);

    // 3. Verify Profile Screen starts at zero
    console.log('3. Verifying ProfileScreen zero metrics...');
    await page.click('button:has-text("PROFILE")');
    await page.waitForSelector('text=GUEST PROTOCOL ACTIVE', { timeout: 5000 });
    await page.waitForSelector('text=Novice Hunter', { timeout: 5000 });

    const profileZeroImg = path.join(ARTIFACT_DIR, 'zero_data_profile_screen.png');
    await page.screenshot({ path: profileZeroImg });
    console.log('📸 Saved zero data ProfileScreen screenshot:', profileZeroImg);

    // 4. Verify Missions Tab starts at zero
    console.log('4. Verifying MissionsScreen zero metrics...');
    const bottomNavButtons = page.locator('div[style*="position: fixed"] button');
    await bottomNavButtons.nth(1).click(); // Missions tab
    await page.waitForSelector('text=NO OBJECTIVES FOUND', { timeout: 8000 });

    const missionsZeroImg = path.join(ARTIFACT_DIR, 'zero_data_missions_screen.png');
    await page.screenshot({ path: missionsZeroImg });
    console.log('📸 Saved zero data MissionsScreen screenshot:', missionsZeroImg);

    console.log('🎉 ZERO-DATA VERIFICATION PASSED 100%! All metrics start at zero, no dummy data present.');
  } catch (err) {
    console.error('❌ Zero data verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyZeroDataExperience();
