import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { Browser } from "../../templates/base/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs";

const [suite, id] = process.argv.slice(2);
const routes = {
  transfer: "/",
  phone: "/phone/",
  branch: "/quiz/",
  review: "/cards/",
  family: "/brands/",
  research: "/",
};
if (!suite || !Object.hasOwn(routes, id))
  throw new Error("Usage: node verify.mjs <suite> <rendered case>");
const root = resolve(suite, "lr-" + id, "dist");
const results = resolve(suite, "results", id);
await mkdir(results, { recursive: true });
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const file = resolve(
      root,
      "." + path,
      path.endsWith("/") ? "index.html" : "",
    );
    if (!file.startsWith(root + sep)) throw new Error("Invalid path");
    const body = await readFile(file);
    res
      .writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
      })
      .end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
let browser;
try {
  browser = await Browser.launch();
  const url = "http://127.0.0.1:" + server.address().port;
  for (const width of [390, 1440]) {
    const page = await browser.newPage({
      width,
      height: width === 390 ? 844 : 900,
    });
    await page.goto(url + routes[id], { timeoutMs: 5000, settleMs: 200 });
    assert.equal(
      await page.eval(() => document.querySelectorAll("#hop-landing").length),
      1,
    );
    await page.screenshot({
      path: join(results, width + ".png"),
      format: "png",
      fullPage: true,
    });
    if (id === "transfer") {
      const headings = await page.eval(() =>
        [...document.querySelectorAll("#hop-landing section")].map((s) =>
          s.querySelector("h1,h2")?.textContent.trim(),
        ),
      );
      assert.deepEqual(headings, [
        "Ремонт телевизоров в мастерской «Контур»",
        "Симптомы",
        "Стоимость",
        "Порядок работ",
        "Гарантии",
      ]);
      for (let tab = 0; tab < 10; tab++) {
        if (
          await page.eval(() =>
            document.activeElement.matches('a[href="#cost"]'),
          )
        )
          break;
        await key("Tab", 9);
      }
      assert.ok(
        await page.eval(() =>
          document.activeElement.matches('a[href="#cost"]:focus-visible'),
        ),
      );
      await key("Enter", 13);
      assert.ok(
        await page.eval(
          () => location.hash === "#cost" && document.getElementById("cost"),
        ),
      );
    }
    if (id === "phone") {
      await page.eval(() => document.querySelector('[name="phone"]').focus());
      const number = "+7 (921) 555-01-23";
      const insert = await page.eval((text) => {
        const clipboardData = new DataTransfer();
        clipboardData.setData("text/plain", text);
        return document.activeElement.dispatchEvent(
          new ClipboardEvent("paste", {
            clipboardData,
            bubbles: true,
            cancelable: true,
          }),
        );
      }, number);
      // Apply the native edit when the application leaves paste to the browser.
      if (insert) await page.send("Input.insertText", { text: number });
      const digits = () =>
        page.eval(() =>
          document.querySelector('[name="phone"]').value.replace(/\D/g, ""),
        );
      assert.equal(await digits(), "79215550123");
      await page.eval(() => {
        const field = document.querySelector('[name="phone"]');
        const position = field.value.indexOf("9");
        field.setSelectionRange(position, position + 1);
      });
      await page.send("Input.insertText", { text: "8" });
      assert.equal(await digits(), "78215550123");
      await page.eval(() => document.querySelector('[name="phone"]').select());
      await key("Backspace", 8);
      assert.equal(await digits(), "");
    }
    if (id === "branch") {
      const observed = await page.eval(() => {
        const q = (s) => document.querySelector(s);
        const click = (s) =>
          [...document.querySelectorAll(s)]
            .find((el) => el.getClientRects().length)
            .click();
        const select = q("select");
        click("[data-lr-next]");
        const symptom = q("[data-lr-symptom]");
        symptom.value = "Полосы";
        symptom.dispatchEvent(new Event("input", { bubbles: true }));
        click("[data-lr-back]");
        click("[data-lr-next]");
        const kept = symptom.value;
        click("[data-lr-back]");
        select.value = "Питание";
        for (const type of ["input", "change"])
          select.dispatchEvent(new Event(type, { bubbles: true }));
        click("[data-lr-next]");
        if (q("form").hidden) click("[data-lr-next]");
        const data = new FormData(q("form"));
        return [kept, data.get("service"), data.has("screen_symptom")];
      });
      assert.deepEqual(observed, ["Полосы", "Питание", false]);
    }
    if (id === "family") {
      for (const [slug, expected, other] of [
        ["vektor", "В-24", "Л-40"],
        ["liniya", "Л-40", "В-24"],
      ]) {
        await page.goto(url + "/brands/", { timeoutMs: 5000, settleMs: 50 });
        const path = "/brands/" + slug + "/";
        assert.ok(
          await page.eval(
            (path) =>
              [...document.links].some(
                (a) => a.pathname.replace(/\/$/, "") === path.slice(0, -1),
              ),
            path,
          ),
        );
        await page.goto(url + path, { timeoutMs: 5000, settleMs: 50 });
        const text = await page.eval(
          () => document.querySelector("#hop-landing").textContent,
        );
        assert.ok(text.includes(expected) && !text.includes(other));
      }
    }
    assert.deepEqual(page.consoleErrors, []);
    async function key(key, code) {
      for (const type of ["rawKeyDown", "keyUp"])
        await page.send("Input.dispatchKeyEvent", {
          type,
          key,
          code: key,
          windowsVirtualKeyCode: code,
        });
    }
    await page.close();
  }
  console.log("Rendered checks passed:", id);
} finally {
  try {
    await browser?.close();
  } finally {
    server.close();
  }
}
