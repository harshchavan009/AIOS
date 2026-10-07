import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/Users/harsh/.gemini/antigravity-ide/brain/913cabf9-8fbf-407a-9dc2-b9f359b787f2/screenshots';
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const PAGES = [
  { name: 'dashboard', path: '/dashboard' },
  { name: 'agents', path: '/agents' },
  { name: 'visual_builder', path: '/agent-builder' },
  { name: 'prompt_studio', path: '/prompt-studio' },
  { name: 'playground', path: '/playground' },
  { name: 'graph_rag', path: '/graph-rag' },
  { name: 'second_brain', path: '/second-brain' },
  { name: 'evaluation', path: '/evaluation' },
  { name: 'analytics', path: '/analytics' },
  { name: 'model_gateway', path: '/models' },
  { name: 'settings', path: '/settings' },
  { name: 'landing', path: '/' },
];

async function main() {
  const chromeProc = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
  ]);

  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    const res = await fetch('http://127.0.0.1:9222/json/list');
    const tabs = await res.json();
    const wsUrl = tabs[0]?.webSocketDebuggerUrl;
    if (!wsUrl) throw new Error('No target tab found');

    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        pending.get(data.id)(data);
        pending.delete(data.id);
      }
    };

    await new Promise((r) => (ws.onopen = r));

    const send = (method, params = {}) => {
      return new Promise((resolve) => {
        const id = msgId++;
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await send('Page.enable');
    await send('DOM.enable');

    // 1. Initial navigation to seed localStorage
    await send('Page.navigate', { url: 'http://localhost:5173/dashboard' });
    await new Promise((r) => setTimeout(r, 1000));

    // Seed mock token and enterprise user
    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('aios_access_token', 'dev_token_session_verified');
        localStorage.setItem('aios_refresh_token', 'dev_refresh_token');
        localStorage.setItem('aios_onboarding_completed', 'true');
        localStorage.setItem('aios_theme', 'graphite');
        document.documentElement.classList.add('dark', 'graphite');
      `,
    });

    console.log('Seeded localStorage, starting page captures...');

    for (const p of PAGES) {
      console.log(`Capturing ${p.name}...`);
      await send('Page.navigate', { url: `http://localhost:5173${p.path}` });
      await new Promise((r) => setTimeout(r, 1200));

      // Ensure graphite dark class is present
      await send('Runtime.evaluate', {
        expression: `document.documentElement.classList.add('dark', 'graphite');`,
      });

      // Desktop capture (1440x900)
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await new Promise((r) => setTimeout(r, 400));
      const desktopRes = await send('Page.captureScreenshot', { format: 'png' });
      if (desktopRes.result?.data) {
        fs.writeFileSync(
          path.join(SCREENSHOT_DIR, `${p.name}_desktop.png`),
          Buffer.from(desktopRes.result.data, 'base64')
        );
      }

      // Mobile capture (390x844)
      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true,
      });
      await new Promise((r) => setTimeout(r, 400));
      const mobileRes = await send('Page.captureScreenshot', { format: 'png' });
      if (mobileRes.result?.data) {
        fs.writeFileSync(
          path.join(SCREENSHOT_DIR, `${p.name}_mobile.png`),
          Buffer.from(mobileRes.result.data, 'base64')
        );
      }
    }

    console.log('All screenshots captured successfully!');
    ws.close();
  } catch (err) {
    console.error('Error taking screenshots:', err);
  } finally {
    chromeProc.kill();
  }
}

main();
