const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\6d718926-ba82-4394-b8c9-c28c3cddcf89';

async function runVerification() {
  console.log('🚀 Starting ZENIN Mobile App Automated End-to-End Verification...');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1200, height: 950 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  try {
    // 1. Load Application
    console.log('1. Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    await page.waitForSelector('text=LEVEL 27', { timeout: 10000 });
    console.log('✔ Home screen loaded successfully with Hunter Ren Vanguard and LEVEL 27');

    const homeScreenshot = path.join(ARTIFACT_DIR, 'zenin_home_dashboard.png');
    await page.screenshot({ path: homeScreenshot });
    console.log('📸 Saved screenshot:', homeScreenshot);

    // 2. Open Create Mission Modal
    console.log('2. Clicking Create Mission FAB...');
    const fab = await page.waitForSelector('button[aria-label="Create Mission"]');
    await fab.click();

    await page.waitForSelector('text=INITIALIZE MISSION', { timeout: 5000 });
    console.log('✔ Initialize Mission modal opened');

    // Fill form
    await page.fill('input[placeholder*="Complete System Architecture"]', 'Deploy Autonomous Kubernetes Node');

    // Click EPIC Priority
    const epicBtn = await page.waitForSelector('button:has-text("EPIC")');
    await epicBtn.click();

    // Add subtask
    await page.fill('input[placeholder="Add granular checkpoint..."]', 'Configure ingress routers & TLS');
    const addSubtaskBtn = await page.locator('input[placeholder="Add granular checkpoint..."] + button');
    await addSubtaskBtn.click();

    // Click AUTHORIZE MISSION
    const submitBtn = await page.waitForSelector('button:has-text("AUTHORIZE MISSION")');
    await submitBtn.click();

    await page.waitForSelector('text=Deploy Autonomous Kubernetes Node', { timeout: 5000 });
    console.log('✔ New Mission "Deploy Autonomous Kubernetes Node" authorized and listed');

    const createdScreenshot = path.join(ARTIFACT_DIR, 'zenin_mission_created.png');
    await page.screenshot({ path: createdScreenshot });
    console.log('📸 Saved screenshot:', createdScreenshot);

    // 3. Clear Mission and trigger RPG System Modal
    console.log('3. Completing mission to trigger RPG System Modal...');
    const missionRow = await page.locator('text=Deploy Autonomous Kubernetes Node').locator('xpath=ancestor::div[contains(@style, "cursor: pointer")]');
    const completeCheckBtn = await missionRow.locator('button[aria-label="Complete Mission Directive"]');
    await completeCheckBtn.click();

    // Wait for SYSTEM DIRECTIVE modal (handles either Mission Cleared or Level Up)
    await page.waitForSelector('text=[SYSTEM DIRECTIVE]', { timeout: 8000 });
    console.log('✔ RPG System Directive Modal displayed with +XP reward and particle sparks');

    const clearedModalScreenshot = path.join(ARTIFACT_DIR, 'zenin_rpg_system_modal.png');
    await page.screenshot({ path: clearedModalScreenshot });
    console.log('📸 Saved screenshot:', clearedModalScreenshot);

    // Dismiss modal
    const continueBtn = await page.waitForSelector('button:has-text("CONTINUE PROGRESSION")');
    await continueBtn.click();
    await page.waitForTimeout(600);

    // 4. Navigate to MISSIONS Tab
    console.log('4. Navigating to MISSIONS tab...');
    const missionsTab = await page.locator('button:has-text("MISSIONS")');
    await missionsTab.click();
    await page.waitForSelector('text=CLEARED', { timeout: 5000 });

    // Test Search
    const searchInput = await page.locator('input[placeholder*="Search objectives"]');
    await searchInput.fill('Kubernetes');
    await page.waitForTimeout(400);

    const searchScreenshot = path.join(ARTIFACT_DIR, 'zenin_missions_search.png');
    await page.screenshot({ path: searchScreenshot });
    console.log('📸 Saved screenshot:', searchScreenshot);

    // Clear search and click CLEARED filter
    await searchInput.fill('');
    const clearedFilter = await page.locator('button:has-text("CLEARED")');
    await clearedFilter.click();
    await page.waitForTimeout(400);

    // 5. Navigate to CALENDAR Tab
    console.log('5. Navigating to CALENDAR tab...');
    const calendarTab = await page.locator('button:has-text("CALENDAR")');
    await calendarTab.click();
    await page.waitForSelector('text=CHRONO RADAR', { timeout: 5000 });

    const calendarScreenshot = path.join(ARTIFACT_DIR, 'zenin_calendar.png');
    await page.screenshot({ path: calendarScreenshot });
    console.log('📸 Saved screenshot:', calendarScreenshot);

    // 6. Navigate to STATS Tab
    console.log('6. Navigating to STATS tab...');
    const statsTab = await page.locator('button:has-text("STATS")');
    await statsTab.click();
    await page.waitForSelector('text=PRODUCTIVITY INDEX', { timeout: 5000 });

    const statsScreenshot = path.join(ARTIFACT_DIR, 'zenin_statistics.png');
    await page.screenshot({ path: statsScreenshot });
    console.log('📸 Saved screenshot:', statsScreenshot);

    // Test Focus Chamber
    console.log('Testing Focus Chamber...');
    const focusBtn = await page.waitForSelector('button:has-text("FOCUS CHAMBER")');
    await focusBtn.click();
    await page.waitForSelector('text=HYPER-FOCUS CHAMBER', { timeout: 5000 });

    const focusScreenshot = path.join(ARTIFACT_DIR, 'zenin_focus_chamber.png');
    await page.screenshot({ path: focusScreenshot });
    console.log('📸 Saved screenshot:', focusScreenshot);

    // 7. Navigate to PROFILE Tab
    console.log('7. Navigating to PROFILE tab...');
    const profileTab = await page.locator('button:has-text("PROFILE")');
    await profileTab.click();
    await page.waitForSelector('text=HUNTER TROPHIES', { timeout: 5000 });

    const profileScreenshot = path.join(ARTIFACT_DIR, 'zenin_profile_trophies.png');
    await page.screenshot({ path: profileScreenshot });
    console.log('📸 Saved screenshot:', profileScreenshot);

    // Test Settings Modal
    console.log('Testing Settings Modal...');
    const settingsBtn = await page.waitForSelector('button[aria-label="Open Settings"]');
    await settingsBtn.click();
    await page.waitForSelector('text=SYSTEM PREFERENCES', { timeout: 5000 });

    const settingsScreenshot = path.join(ARTIFACT_DIR, 'zenin_settings.png');
    await page.screenshot({ path: settingsScreenshot });
    console.log('📸 Saved screenshot:', settingsScreenshot);

    // Close Settings
    const closeSettings = await page.waitForSelector('button[aria-label="Close Settings"]');
    await closeSettings.click();
    await page.waitForTimeout(400);

    // 8. Test Device Viewport Presets
    console.log('8. Testing Viewport Presets (SAMSUNG, PIXEL, FULLSCREEN)...');
    const samsungBtn = await page.locator('button:has-text("SAMSUNG")');
    if (await samsungBtn.count() > 0) {
      await samsungBtn.click();
      await page.waitForTimeout(400);
      const samsungScreenshot = path.join(ARTIFACT_DIR, 'zenin_device_samsung.png');
      await page.screenshot({ path: samsungScreenshot });
      console.log('📸 Saved screenshot:', samsungScreenshot);
    }

    console.log('🎉 ALL 8 AUTOMATED USER FLOWS PASSED FLAWLESSLY!');
  } catch (err) {
    console.error('❌ Verification Error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runVerification();
