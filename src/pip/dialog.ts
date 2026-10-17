/// <reference types="@workadventure/iframe-api-typings" />
/// <reference types="vite/client" />
//
// Pip's dialogue box: a small page that WorkAdventure shows at the bottom of the screen (see src/pip.ts).
// Portrait, typed text and answer buttons (also keys 1–9; Space/Enter skips the typing, Esc closes).
// What Pip knows about a player (met before, riddles solved, coin streak and record) is kept per player
// across all rooms in a WorkAdventure player variable.

import { JOKES, ORACLE, RIDDLES, type Lang, type Riddle } from "./texts";
import faceUrl from "../../tilesets/npc-pip.png?url";

interface Option {
    label: string;
    primary?: boolean;
    run: () => void;
}

interface Memory {
    met: boolean;
    riddles: string[];
    streak: number;
    best: number;
}

const textEl = document.getElementById("text")!;
const optionsEl = document.getElementById("options")!;
const boxEl = document.getElementById("box")!;
(document.getElementById("face") as HTMLElement).style.backgroundImage = `url("${faceUrl}")`;

let lang: Lang = "de";
let name = "";
let memory: Memory = { met: false, riddles: [], streak: 0, best: 0 };
let typing: number | undefined;
let finishTyping: (() => void) | undefined;
let current: Option[] = [];

const t = (de: string, en: string) => (lang === "de" ? de : en);
const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)]!;

// ---------- WorkAdventure ----------

async function remember(change: Partial<Memory>): Promise<void> {
    memory = { ...memory, ...change };
    try {
        await WA.player.state.saveVariable("pip", memory, { public: false, persist: true, scope: "world" });
    } catch (e) {
        console.warn("Pip could not remember", e);
    }
}

async function closeDialog(): Promise<void> {
    try {
        await WA.player.state.saveVariable("pipDialogOpen", false); // lets the map script show "talk to Pip" again
        for (const w of await WA.ui.website.getAll()) if (w.url.includes("/pip/")) w.close();
    } catch (e) {
        console.warn(e);
    }
}

// ---------- rendering ----------

/** Shows a line of text, typed out, then the answer buttons. */
function say(text: string, options: Option[]): void {
    if (typing) clearInterval(typing);
    current = options;
    optionsEl.innerHTML = "";
    textEl.textContent = "";
    boxEl.classList.add("talking");
    const caret = document.createElement("span");
    caret.className = "caret";
    caret.textContent = "▌";
    let i = 0;
    const done = () => {
        if (typing) clearInterval(typing);
        typing = undefined;
        finishTyping = undefined;
        textEl.textContent = text;
        boxEl.classList.remove("talking");
        renderOptions();
    };
    finishTyping = done;
    typing = window.setInterval(() => {
        i += text[i] === " " ? 2 : 1;
        if (i >= text.length) return done();
        textEl.textContent = text.slice(0, i);
        textEl.appendChild(caret);
    }, 22);
}

function renderOptions(): void {
    optionsEl.innerHTML = "";
    current.forEach((o, n) => {
        const b = document.createElement("button");
        b.type = "button";
        if (o.primary) b.className = "primary";
        b.innerHTML = `<kbd>${n + 1}</kbd><span></span>`;
        b.querySelector("span")!.textContent = o.label;
        b.title = o.label;
        b.addEventListener("click", () => o.run());
        optionsEl.appendChild(b);
    });
}

textEl.addEventListener("click", () => finishTyping?.());
document.getElementById("close")!.addEventListener("click", () => void closeDialog());
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") return void closeDialog();
    if ((e.key === " " || e.key === "Enter") && finishTyping) {
        e.preventDefault();
        return finishTyping();
    }
    const n = Number(e.key);
    if (!finishTyping && n >= 1 && n <= current.length) current[n - 1]!.run();
});

// ---------- conversation ----------

const back = (): Option => ({ label: t("↩ Zurück", "↩ Back"), run: menu });
const bye = (): Option => ({ label: t("👋 Tschüss", "👋 Bye"), run: farewell });

function greeting(): string {
    const h = new Date().getHours();
    if (!memory.met) {
        return t(
            `Hoho! Ein neues Gesicht! Ich bin Pip, Hofnarr des Grafen. Und du musst ${name} sein. Was darf es sein?`,
            `Hoho! A new face! I'm Pip, the count's jester. And you must be ${name}. What'll it be?`,
        );
    }
    if (h < 6) return t(`${name}! Um diese Uhrzeit? Selbst Narren schlafen manchmal.`, `${name}! At this hour? Even jesters sleep sometimes.`);
    if (h < 11) return t(`Guten Morgen, ${name}! Der Kaffee ist noch warm, meine Witze nicht.`, `Good morning, ${name}! The coffee is still warm, my jokes aren't.`);
    if (h < 17) return t(`Ah, ${name}! Flucht aus dem nächsten Meeting?`, `Ah, ${name}! Escaping the next meeting?`);
    return t(`Guten Abend, ${name}! Feierabend ist, wenn der Narr es sagt.`, `Good evening, ${name}! Work is over when the jester says so.`);
}

function menu(): void {
    const solved = memory.riddles.length;
    say(greeting(), [
        { label: t("🎭 Erzähl einen Witz", "🎭 Tell a joke"), run: joke, primary: true },
        { label: t("🔮 Orakel des Tages", "🔮 Oracle of the day"), run: oracle },
        { label: t(`🧩 Rätsel (${solved}/${RIDDLES.length})`, `🧩 Riddle (${solved}/${RIDDLES.length})`), run: riddle },
        { label: t("🪙 Münzwurf", "🪙 Coin toss"), run: coin },
        bye(),
    ]);
    if (!memory.met) void remember({ met: true });
}

function joke(): void {
    say(pick(JOKES[lang]), [{ label: t("😂 Noch einer!", "😂 Another one!"), run: joke, primary: true }, back()]);
}

/** Same prophecy all day for the same player. */
function oracle(): void {
    const day = new Date().toISOString().slice(0, 10);
    let h = 0;
    for (const ch of `${name}|${day}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const list = ORACLE[lang];
    say(t(`🔮 Pip schließt die Augen und murmelt …\n„${list[h % list.length]}“`, `🔮 Pip closes his eyes and mumbles …\n"${list[h % list.length]}"`), [back(), bye()]);
}

function riddle(): void {
    const open = RIDDLES.filter((r) => !memory.riddles.includes(r.id));
    if (!open.length) {
        say(
            t(
                "Du hast alle meine Rätsel gelöst! Hiermit ernenne ich dich zum Hofgelehrten. Der Titel bringt nichts, klingt aber gut.",
                "You've solved all my riddles! I hereby name you court scholar. The title is worthless, but it sounds nice.",
            ),
            [{ label: t("🔁 Nochmal von vorn", "🔁 Start over"), run: () => void remember({ riddles: [] }).then(riddle) }, back()],
        );
        return;
    }
    const r = pick(open);
    const right = r.answers[lang][0]!;
    const shuffled = [...r.answers[lang]].sort(() => Math.random() - 0.5);
    say(`🧩 ${r.q[lang]}`, [...shuffled.map((a) => ({ label: a, run: () => answer(r, a === right) })), back()]);
}

function answer(r: Riddle, right: boolean): void {
    if (!right) {
        say(pick([t("Falsch! Aber mit Stil.", "Wrong! But with style."), t("Nein, nein, nein. Das Glöckchen hat geklingelt, aber nicht für dich.", "No, no, no. The bell rang, but not for you.")]), [
            { label: t("🤔 Nochmal versuchen", "🤔 Try again"), run: riddle, primary: true },
            back(),
        ]);
        return;
    }
    void remember({ riddles: [...memory.riddles, r.id] });
    const left = RIDDLES.length - memory.riddles.length;
    say(t(`Richtig! ${left ? `Noch ${left} Rätsel, und du bist Hofgelehrter.` : "Das war das letzte!"}`, `Correct! ${left ? `${left} riddles to go before you're court scholar.` : "That was the last one!"}`), [
        { label: t("🧩 Nächstes", "🧩 Next one"), run: riddle, primary: true },
        back(),
    ]);
}

function coin(): void {
    say(
        t(`Ich werfe eine Münze. Rate richtig und deine Serie wächst!\nSerie: ${memory.streak} · Rekord: ${memory.best}`, `I'll toss a coin. Guess right and your streak grows!\nStreak: ${memory.streak} · Best: ${memory.best}`),
        [
            { label: t("👑 Kopf", "👑 Heads"), run: () => toss(true), primary: true },
            { label: t("🔢 Zahl", "🔢 Tails"), run: () => toss(false), primary: true },
            back(),
        ],
    );
}

function toss(heads: boolean): void {
    const result = Math.random() < 0.5;
    const side = result ? t("Kopf", "heads") : t("Zahl", "tails");
    if (result === heads) {
        const streak = memory.streak + 1;
        const record = streak > memory.best;
        void remember({ streak, best: Math.max(memory.best, streak) });
        say(t(`Es ist … ${side}! Serie: ${streak}${record ? " 🎉 Neuer Rekord!" : ""}`, `It's … ${side}! Streak: ${streak}${record ? " 🎉 New record!" : ""}`), [
            { label: t("🪙 Weiter!", "🪙 Again!"), run: coin, primary: true },
            back(),
        ]);
    } else {
        const lost = memory.streak;
        void remember({ streak: 0 });
        say(
            t(`Es ist … ${side}. ${lost > 2 ? `Autsch, eine ${lost}er-Serie dahin!` : "Pech gehabt!"} Der Narr gewinnt immer.`, `It's … ${side}. ${lost > 2 ? `Ouch, a streak of ${lost} gone!` : "Bad luck!"} The jester always wins.`),
            [{ label: t("🪙 Revanche!", "🪙 Rematch!"), run: coin, primary: true }, back()],
        );
    }
}

function farewell(): void {
    say(pick([t("Bis bald! Und lach mal wieder.", "See you! And laugh more often."), t("Adieu! Grüß den Grafen von mir.", "Farewell! Say hi to the count.")]), []);
    setTimeout(() => void closeDialog(), 2200);
}

// ---------- start ----------

WA.onInit()
    .then(() => {
        lang = (WA.player.language ?? "de").toLowerCase().startsWith("de") ? "de" : "en";
        document.documentElement.lang = lang;
        name = WA.player.name;
        const saved = WA.player.state.pip as Partial<Memory> | undefined;
        if (saved && typeof saved === "object") memory = { ...memory, ...saved, riddles: Array.isArray(saved.riddles) ? saved.riddles : [] };
        menu();
        window.focus();
    })
    .catch((e) => console.error(e));
