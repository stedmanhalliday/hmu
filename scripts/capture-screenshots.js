#!/usr/bin/env node

/**
 * Capture promotional screenshots for the PWA manifest.
 *
 * Usage:
 *   1. Start the dev server: yarn dev
 *   2. Run: yarn screenshots
 *
 * Produces 5 screenshots at 412×915 @2x in public/screenshots/
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'public', 'screenshots');
const VIEWPORT = { width: 412, height: 915, deviceScaleFactor: 2 };

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const ALL_LINK_KEYS = [
    'instagram', 'tiktok', 'twitter', 'snapchat', 'facebook',
    'whatsapp', 'signal', 'telegram', 'discord',
    'youtube', 'twitch',
    'spotify', 'soundcloud', 'applemusic',
    'linkedin', 'github',
    'calendly', 'cal',
    'venmo', 'cashapp', 'paypal', 'stripe',
    'magicmessage',
    'custom',
];

const EMPTY_LINKS = Object.fromEntries(ALL_LINK_KEYS.map(k => [k, '']));

const HOT_VIBE = JSON.stringify({
    label: 'Hot', emoji: '🔥', group: ['#f9d423', '#ff4e50'],
});
const UNIQUE_VIBE = JSON.stringify({
    label: 'Unique', emoji: '🦄', group: ['#21d4fd', '#b721ff'],
});

const JORDAN = {
    id: 'contact-jordan',
    formValues: {
        name: 'Jordan',
        phone: '+16789998212',
        email: 'jordan@hmu.world',
        url: 'hmu.world',
        vibe: HOT_VIBE,
        photo: '',
    },
    linkValues: {
        ...EMPTY_LINKS,
        instagram: 'jordanflow',
        twitter: 'jordanflow',
        spotify: '4xRYI6VqpkE3UwrDrAZL8L',
        linkedin: 'jordanflow',
        venmo: 'jordanflow',
        youtube: 'jordanflow',
        github: 'jordanflow',
    },
};

const JORDAN_PRO = {
    id: 'contact-jordan-pro',
    formValues: {
        name: 'J. Parker',
        phone: '+16789998212',
        email: 'jordan@hmu.world',
        url: 'hmu.world',
        vibe: UNIQUE_VIBE,
        photo: '',
    },
    linkValues: { ...EMPTY_LINKS },
};

const EMPTY_LINKS_CONTACT = {
    id: 'contact-empty',
    formValues: { ...JORDAN.formValues },
    linkValues: { ...EMPTY_LINKS },
};

// Put Jordan's 7 active link types first for a clean speed-dial layout
const ACTIVE_LINK_TYPES = ['instagram', 'twitter', 'spotify', 'linkedin', 'venmo', 'youtube', 'github'];
const PREVIEW_LINK_ORDER = [
    ...ACTIVE_LINK_TYPES,
    ...ALL_LINK_KEYS.filter(k => !ACTIVE_LINK_TYPES.includes(k)),
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function buildStorage(contacts, extras) {
    const base = {
        contacts: JSON.stringify(contacts),
        CONTACTS_MIGRATION_COMPLETE: JSON.stringify(true),
        MIGRATION_COMPLETE: JSON.stringify(true),
        donatePrompt1Seen: JSON.stringify(true),
        donatePrompt2Seen: JSON.stringify(true),
    };
    if (extras) Object.assign(base, extras);
    return base;
}

async function openPage(browser, storageData, standalone) {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    // Stub analytics and seed localStorage before page scripts run
    await page.evaluateOnNewDocument((data) => {
        window.gtag = () => {};
        for (const [key, value] of Object.entries(data)) {
            localStorage.setItem(key, value);
        }
    }, storageData);

    if (standalone) {
        await page.evaluateOnNewDocument(() => {
            const original = window.matchMedia.bind(window);
            window.matchMedia = (query) => {
                if (query === '(display-mode: standalone)') {
                    return {
                        matches: true,
                        media: query,
                        addEventListener: () => {},
                        removeEventListener: () => {},
                        addListener: () => {},
                        removeListener: () => {},
                        onchange: null,
                        dispatchEvent: () => false,
                    };
                }
                return original(query);
            };
        });
    }

    return page;
}

async function capture(page, name) {
    const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
    await page.screenshot({ path: filePath, type: 'png' });
    console.log(`  ✓ ${name}.png`);
}

// Runs in browser context via page.evaluate()
function clickButtonByText(text, exact) {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
        const match = exact
            ? btn.textContent.trim() === text
            : btn.textContent.includes(text);
        if (match) { btn.click(); return true; }
    }
    return false;
}

// ---------------------------------------------------------------------------
// Screenshot routines
// ---------------------------------------------------------------------------

async function captureHomepage(browser) {
    console.log('screen-00: Homepage with 2 contacts');
    const storage = buildStorage([JORDAN, JORDAN_PRO]);
    const page = await openPage(browser, storage, true);

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 10000 });
    await page.waitForSelector('[class*="miniCard"]', { timeout: 15000 });

    // Ensure the typed.js headline has settled
    await page.evaluate(() => {
        const el = document.getElementById('shuffle');
        if (el && !el.textContent.trim()) el.textContent = 'tactfully';
    });
    await delay(1500);

    await capture(page, 'screen-00');
    await page.close();
}

async function capturePreview(browser) {
    console.log('screen-01: Preview with speed dial');
    const storage = buildStorage([JORDAN], {
        linkOrder: JSON.stringify(PREVIEW_LINK_ORDER),
    });
    const page = await openPage(browser, storage, false);

    await page.goto(`${BASE_URL}/preview?id=contact-jordan`, { waitUntil: 'networkidle2', timeout: 10000 });
    await page.waitForFunction(() => {
        const img = document.querySelector('img[alt*="QR code"]');
        return img && img.src && img.src.startsWith('data:');
    }, { timeout: 15000 });
    await page.waitForSelector('.socialLink', { timeout: 10000 });
    await delay(2000);

    await capture(page, 'screen-01');
    await page.close();
}

async function captureEditContact(browser) {
    console.log('screen-02: Edit contact form');
    const storage = buildStorage([JORDAN]);
    const page = await openPage(browser, storage, false);

    await page.goto(`${BASE_URL}/create?id=contact-jordan&editing=true`, { waitUntil: 'networkidle2', timeout: 10000 });
    await page.waitForFunction(() => {
        const h1 = document.querySelector('h1');
        return h1 && h1.textContent.includes('Edit your contact');
    }, { timeout: 15000 });
    await delay(1500);

    await capture(page, 'screen-02');
    await page.close();
}

async function captureEditLinks(browser) {
    console.log('screen-03: Edit links with Instagram');
    const storage = buildStorage([EMPTY_LINKS_CONTACT]);
    const page = await openPage(browser, storage, false);

    await page.goto(`${BASE_URL}/links?id=contact-empty`, { waitUntil: 'networkidle2', timeout: 10000 });
    await page.waitForSelector('button[aria-label="Add Instagram"]', { timeout: 15000 });
    await delay(500);

    await page.click('button[aria-label="Add Instagram"]');
    await page.waitForSelector('input[aria-label="Instagram"]', { timeout: 5000 });
    await delay(1000);

    await capture(page, 'screen-03');
    await page.close();
}

async function captureMagicMessage(browser) {
    console.log('screen-04: Magic Message (SMS)');
    const storage = buildStorage([EMPTY_LINKS_CONTACT]);
    const page = await openPage(browser, storage, false);

    await page.goto(`${BASE_URL}/links?id=contact-empty`, { waitUntil: 'networkidle2', timeout: 10000 });
    await delay(500);

    // Open the Magic Message form
    const openedMagic = await page.evaluate(clickButtonByText, 'Magic Message', false);
    if (!openedMagic) throw new Error('Could not find Magic Message button');
    await page.waitForFunction(() => {
        const btns = document.querySelectorAll('button');
        return [...btns].some(b => b.textContent.trim() === 'Email');
    }, { timeout: 5000 });
    await delay(300);

    // Switch to SMS mode
    const clickedSMS = await page.evaluate(clickButtonByText, 'SMS', true);
    if (!clickedSMS) throw new Error('Could not find SMS toggle button');
    await delay(1000);

    await capture(page, 'screen-04');
    await page.close();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    console.log(`\nCapturing screenshots from ${BASE_URL}\n`);

    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

    // Clean up stale screenshots from previous runs
    for (const stale of ['screen-05.png', 'screen-06.png']) {
        const stalePath = path.join(SCREENSHOT_DIR, stale);
        if (fs.existsSync(stalePath)) {
            fs.unlinkSync(stalePath);
            console.log(`  ✗ Removed stale ${stale}`);
        }
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        await captureHomepage(browser);
        await capturePreview(browser);
        await captureEditContact(browser);
        await captureEditLinks(browser);
        await captureMagicMessage(browser);
        console.log(`\nDone! Screenshots saved to public/screenshots/\n`);
    } finally {
        await browser.close();
    }
}

main().catch((err) => {
    console.error('\nScreenshot capture failed:', err.message || err);
    console.error('\nMake sure the dev server is running: yarn dev\n');
    process.exit(1);
});
