/**
 * P13 VoiceOver smoke (macOS runner, `tests/browser/voiceover.config.ts`): VoiceOver runs over headed Playwright WebKit
 * on the keyboard test page. Tab from the button before the gizmo, through macOS (VoiceOver's own key press), must
 * speak the gizmo's name and its role description "view cube"; a digit key must turn the view and VoiceOver must speak
 * the status child's announcement of the face. The whole spoken-phrase log is the transcript, written to
 * `voiceover.json`, printed, and attached.
 */
import { writeFileSync } from "node:fs";
import { voiceOverTest as test } from "@guidepup/playwright";
import { expect } from "@playwright/test";

type Target = { name: string; label: string };
type State = { at: string | null; name: string | null; focused: string | undefined; status: string | null };

test.use({ voiceOverStartOptions: { capture: "initial" } });

test("VoiceOver names the view cube and announces a key turn", async ({ page, voiceOver }, info) => {
  const transcript: { step: string; spoken: string[]; state: State }[] = [];
  const state = () => page.evaluate<State>("T.state()");
  /** Runs one step, then reads what VoiceOver said since the last step and what the page holds. */
  const step = async (name: string, action: () => Promise<unknown>) => {
    await voiceOver.clearSpokenPhraseLog();
    await action();
    // The status child is written 50 ms after the turn ends; give VoiceOver time to queue and speak it.
    await page.waitForTimeout(1_500);
    const entry = { step: name, spoken: [...(await voiceOver.spokenPhraseLog())], state: await state() };
    transcript.push(entry);
    console.log(`[voiceover] ${name}: ${JSON.stringify(entry.spoken)} | page ${JSON.stringify(entry.state)}`);
    return entry;
  };
  const save = () => {
    const json = JSON.stringify(transcript, null, 2);
    writeFileSync(info.outputPath("voiceover.json"), json);
    return info.attach("voiceover.json", { body: json, contentType: "application/json" });
  };

  try {
    await page.goto("/lib/__tests__/browser/keyboard.html?backend=webgl", { waitUntil: "load" });
    await page.waitForFunction("window.READY === true", null, { timeout: 30_000 });
    const targets = await page.evaluate<Target[]>("T.targets");
    const front = targets.find((t) => t.name === "front")!.label;
    await voiceOver.navigateToWebContent();
    await page.focus("#before");

    // macOS key press through VoiceOver, so the key reaches the browser the way a person's does.
    const tab = await step("Tab to the gizmo", () => voiceOver.press("Tab", { capture: true }));
    const heard = tab.spoken.join(" | ").toLowerCase();
    expect(tab.state.focused, "the OS Tab reached the gizmo").toBe("gizmo");
    expect(heard, "VoiceOver speaks the role description").toContain("view cube");
    expect(heard, "VoiceOver speaks the accessible name").toContain(tab.state.name!.toLowerCase());

    const digit = await step("Digit 1 (front)", () => voiceOver.press("1", { capture: true }));
    expect(digit.state).toMatchObject({ at: "front", name: front, status: front });
    expect(digit.spoken.join(" | ").toLowerCase(), "VoiceOver speaks the announcement").toContain(front.toLowerCase());

    const roll = await step("Shift+Right (roll)", () => voiceOver.press("Shift+ArrowRight", { capture: true }));
    expect(roll.spoken.join(" | ").toLowerCase()).toContain("rolled 90° clockwise");
  } finally {
    await save();
  }
});
