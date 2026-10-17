/// <reference types="@workadventure/iframe-api-typings" />
//
// Pip, the court jester in the office garden. Walk up to him and press space: he tells jokes, reads the
// oracle of the day, asks riddles and bets on coin tosses. What he knows about a player (met before, riddles
// solved, best coin streak) is kept per player across all rooms.
//
// Map side (office.tmj): the animated tile on layer "furniture/npc", the area "pip" around him and the
// rectangle "pipPopup" above him, where his speech bubbles appear.

type Lang = "de" | "en";
type Btn = { label: string; className?: "normal" | "primary" | "success" | "warning" | "error" | "disabled"; callback: () => void };

interface Memory {
    met: boolean;
    riddles: string[];
    streak: number;
    best: number;
}

const AREA = "pip";
const ANCHOR = "pipPopup";

let lang: Lang = "de";
let popup: { close(): void } | undefined;
let action: { remove(): void } | undefined;
let memory: Memory = { met: false, riddles: [], streak: 0, best: 0 };

const t = (de: string, en: string) => (lang === "de" ? de : en);
const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)]!;

// ---------- texts ----------

const JOKES: Record<Lang, string[]> = {
    de: [
        "Warum gehen Pixel nie zum Arzt? Sie haben Angst, dass man sie für unscharf hält.",
        "Mein Chef sagt, ich soll mehr out of the box denken. Ich wohne in einem 32×32-Kästchen!",
        "Was macht ein Woka in der Mittagspause? Er läuft im Kreis, damit es nach Arbeit aussieht.",
        "Treffen sich zwei Hüte. Sagt der eine: „Du bleibst hier, ich geh mal kurz vor.“",
        "Ich wollte einen Witz über Videokonferenzen erzählen, aber ich war die ganze Zeit stummgeschaltet.",
        "Warum hat der Server keine Freunde? Er reagiert nur auf Anfragen.",
        "Wie nennt man einen Narren ohne Glöckchen? Einen Berater.",
        "Der Graf fragte mich, ob ich ernst sein kann. Ich sagte: „Nur nach 18 Uhr, Herr Graf, und dann kostet es extra.“",
        "Was ist grün und klopft an die Tür? Ein Klopfsalat. Ja, der ist alt. Ich auch.",
        "Warum sitzen Programmierer im Dunkeln? Weil Licht ein Feature ist, und das kommt erst im nächsten Sprint.",
    ],
    en: [
        "Why do pixels never see a doctor? They're afraid of being called blurry.",
        "My boss says think outside the box. I live in a 32×32 box!",
        "What does a woka do at lunch? Walk in circles so it looks like work.",
        "I wanted to tell a joke about video calls, but I was muted the whole time.",
        "Why doesn't the server have friends? It only responds to requests.",
        "What do you call a jester without bells? A consultant.",
        "Why do programmers sit in the dark? Light is a feature, scheduled for next sprint.",
    ],
};

const ORACLE: Record<Lang, string[]> = {
    de: [
        "Heute findest du etwas, das du gar nicht gesucht hast. Vermutlich einen Bug.",
        "Ein Kaffee wird dir heute das Leben retten. Oder zumindest den Nachmittag.",
        "Die Sterne sagen: Mach heute früher Feierabend. Die Sterne haften nicht.",
        "Jemand im Büro denkt gerade an dich. Wahrscheinlich, weil du ihm noch was schuldest.",
        "Dein nächster Raumwechsel bringt Glück. Oder zumindest einen neuen Raum.",
        "Ein Hut wird heute eine wichtige Rolle spielen. Trag ihn mit Würde.",
        "Meide heute Meetings ohne Tagesordnung. Und Leute, die „kurze Frage“ sagen.",
        "Du wirst heute jemanden zum Lachen bringen. Notfalls dich selbst.",
        "Das Glück ist mit dir, solange du nicht Zahl sagst.",
        "Heute ist ein guter Tag, um eine Pflanze zu gießen. Sie hat es verdient.",
        "Ein Geheimnis liegt im Garten verborgen. Nein, nicht unter mir.",
        "Wer heute als Erster „Guten Morgen“ sagt, gewinnt nichts, ist aber trotzdem ein guter Mensch.",
    ],
    en: [
        "Today you'll find something you weren't looking for. Probably a bug.",
        "A coffee will save your life today. Or at least your afternoon.",
        "The stars say: finish early today. The stars accept no liability.",
        "Your next room change brings luck. Or at least a new room.",
        "A hat will play an important role today. Wear it with dignity.",
        "Avoid meetings without an agenda today. And people who say \"quick question\".",
        "You'll make someone laugh today. Yourself, if need be.",
        "Today is a good day to water a plant. It deserves it.",
    ],
};

interface Riddle {
    id: string;
    q: Record<Lang, string>;
    answers: Record<Lang, string[]>; // first one is right
}

const RIDDLES: Riddle[] = [
    {
        id: "echo",
        q: { de: "Ich spreche ohne Mund und höre ohne Ohren. Ich habe keinen Körper, aber der Wind weckt mich. Was bin ich?", en: "I speak without a mouth and hear without ears. I have no body, but the wind wakes me. What am I?" },
        answers: { de: ["Ein Echo", "Ein Gespenst", "Ein Mikrofon"], en: ["An echo", "A ghost", "A microphone"] },
    },
    {
        id: "keyboard",
        q: { de: "Ich habe Tasten, aber kein Schloss. Ich habe Platz, aber kein Zimmer. Man kann eingeben, aber nicht hinein. Was bin ich?", en: "I have keys but no locks, space but no room. You can enter, but you can't go inside. What am I?" },
        answers: { de: ["Eine Tastatur", "Ein Klavier", "Ein Hausmeister"], en: ["A keyboard", "A piano", "A janitor"] },
    },
    {
        id: "hole",
        q: { de: "Je mehr du wegnimmst, desto größer werde ich. Was bin ich?", en: "The more you take away, the bigger I get. What am I?" },
        answers: { de: ["Ein Loch", "Ein Schatten", "Ein Kuchen"], en: ["A hole", "A shadow", "A cake"] },
    },
    {
        id: "footsteps",
        q: { de: "Je mehr du von mir machst, desto mehr lässt du zurück. Was bin ich?", en: "The more of me you make, the more you leave behind. What am I?" },
        answers: { de: ["Schritte", "Fehler", "Fotos"], en: ["Footsteps", "Mistakes", "Photos"] },
    },
    {
        id: "map",
        q: { de: "Ich habe Städte ohne Häuser, Wälder ohne Bäume und Wasser ohne Fische. Was bin ich?", en: "I have cities without houses, forests without trees and water without fish. What am I?" },
        answers: { de: ["Eine Landkarte", "Ein Traum", "Ein Aquarium"], en: ["A map", "A dream", "An aquarium"] },
    },
    {
        id: "towel",
        q: { de: "Was wird nasser, je mehr es trocknet?", en: "What gets wetter the more it dries?" },
        answers: { de: ["Ein Handtuch", "Ein Schwamm", "Die Wüste"], en: ["A towel", "A sponge", "The desert"] },
    },
    {
        id: "name",
        q: { de: "Es gehört dir, aber andere benutzen es viel öfter als du. Was ist es?", en: "It belongs to you, but others use it far more than you do. What is it?" },
        answers: { de: ["Dein Name", "Dein Stuhl", "Dein Ladekabel"], en: ["Your name", "Your chair", "Your charger"] },
    },
];

// ---------- memory ----------

async function remember(change: Partial<Memory>): Promise<void> {
    memory = { ...memory, ...change };
    try {
        await WA.player.state.saveVariable("pip", memory, { public: false, persist: true, scope: "world" });
    } catch (e) {
        console.warn("Pip could not remember", e);
    }
}

// ---------- dialog ----------

function close(): void {
    popup?.close();
    popup = undefined;
}

function say(text: string, buttons: Btn[]): void {
    close();
    popup = WA.ui.openPopup(ANCHOR, text, buttons.map((b) => ({ label: b.label, className: b.className ?? "normal", callback: () => b.callback() })));
}

const back = (): Btn => ({ label: t("↩ Zurück", "↩ Back"), callback: menu });
const bye = (): Btn => ({ label: t("👋 Tschüss", "👋 Bye"), callback: farewell });

function greeting(): string {
    const name = WA.player.name;
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
        { label: t("🎭 Erzähl einen Witz", "🎭 Tell a joke"), callback: joke, className: "primary" },
        { label: t("🔮 Orakel des Tages", "🔮 Oracle of the day"), callback: oracle },
        { label: t(`🧩 Rätsel (${solved}/${RIDDLES.length})`, `🧩 Riddle (${solved}/${RIDDLES.length})`), callback: riddle },
        { label: t("🪙 Münzwurf", "🪙 Coin toss"), callback: coin },
        bye(),
    ]);
    if (!memory.met) void remember({ met: true });
}

function joke(): void {
    say(pick(JOKES[lang]), [{ label: t("😂 Noch einer!", "😂 Another one!"), callback: joke, className: "primary" }, back()]);
}

/** Same prophecy all day for the same player. */
function oracle(): void {
    const day = new Date().toISOString().slice(0, 10);
    let h = 0;
    for (const ch of `${WA.player.name}|${day}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const list = ORACLE[lang];
    say(t(`🔮 Pip schließt die Augen und murmelt …\n\n„${list[h % list.length]}“`, `🔮 Pip closes his eyes and mumbles …\n\n"${list[h % list.length]}"`), [back(), bye()]);
}

function riddle(): void {
    const open = RIDDLES.filter((r) => !memory.riddles.includes(r.id));
    if (!open.length) {
        say(
            t(
                "Du hast alle meine Rätsel gelöst! Hiermit ernenne ich dich zum Hofgelehrten. Der Titel bringt nichts, klingt aber gut.",
                "You've solved all my riddles! I hereby name you court scholar. The title is worthless, but it sounds nice.",
            ),
            [{ label: t("🔁 Nochmal von vorn", "🔁 Start over"), callback: () => void remember({ riddles: [] }).then(riddle) }, back()],
        );
        return;
    }
    const r = pick(open);
    const right = r.answers[lang][0]!;
    const shuffled = [...r.answers[lang]].sort(() => Math.random() - 0.5);
    say(`🧩 ${r.q[lang]}`, [
        ...shuffled.map((a) => ({ label: a, callback: () => answer(r, a === right) })),
        back(),
    ]);
}

function answer(r: Riddle, right: boolean): void {
    if (!right) {
        say(pick([t("Falsch! Aber mit Stil.", "Wrong! But with style."), t("Nein, nein, nein. Das Glöckchen hat geklingelt, aber nicht für dich.", "No, no, no. The bell rang, but not for you.")]), [
            { label: t("🤔 Nochmal versuchen", "🤔 Try again"), callback: riddle, className: "primary" },
            back(),
        ]);
        return;
    }
    void remember({ riddles: [...memory.riddles, r.id] });
    const left = RIDDLES.length - memory.riddles.length;
    say(
        t(`Richtig! ${left ? `Noch ${left} Rätsel, und du bist Hofgelehrter.` : "Das war das letzte!"}`, `Correct! ${left ? `${left} riddles to go before you're court scholar.` : "That was the last one!"}`),
        [{ label: t("🧩 Nächstes", "🧩 Next one"), callback: riddle, className: "primary" }, back()],
    );
}

function coin(): void {
    const streak = memory.streak;
    say(
        t(
            `Ich werfe eine Münze. Rate richtig und deine Serie wächst!\nSerie: ${streak} · Rekord: ${memory.best}`,
            `I'll toss a coin. Guess right and your streak grows!\nStreak: ${streak} · Best: ${memory.best}`,
        ),
        [
            { label: t("👑 Kopf", "👑 Heads"), callback: () => toss(true), className: "primary" },
            { label: t("🔢 Zahl", "🔢 Tails"), callback: () => toss(false), className: "primary" },
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
        say(
            t(`Es ist … ${side}! Serie: ${streak}${record ? " 🎉 Neuer Rekord!" : ""}`, `It's … ${side}! Streak: ${streak}${record ? " 🎉 New record!" : ""}`),
            [{ label: t("🪙 Weiter!", "🪙 Again!"), callback: coin, className: "primary" }, back()],
        );
    } else {
        const lost = memory.streak;
        void remember({ streak: 0 });
        say(
            t(`Es ist … ${side}. ${lost > 2 ? `Autsch, eine ${lost}er-Serie dahin!` : "Pech gehabt!"} Der Narr gewinnt immer.`, `It's … ${side}. ${lost > 2 ? `Ouch, a streak of ${lost} gone!` : "Bad luck!"} The jester always wins.`),
            [{ label: t("🪙 Revanche!", "🪙 Rematch!"), callback: coin, className: "primary" }, back()],
        );
    }
}

function farewell(): void {
    say(pick([t("Bis bald! Und lach mal wieder.", "See you! And laugh more often."), t("Adieu! Grüß den Grafen von mir.", "Farewell! Say hi to the count.")]), []);
    setTimeout(close, 2500);
}

// ---------- area ----------

export function initPip(): void {
    lang = (WA.player.language ?? "de").toLowerCase().startsWith("de") ? "de" : "en";
    const saved = WA.player.state.pip as Partial<Memory> | undefined;
    if (saved && typeof saved === "object") memory = { ...memory, ...saved, riddles: Array.isArray(saved.riddles) ? saved.riddles : [] };

    WA.room.area.onEnter(AREA).subscribe(() => {
        action = WA.ui.displayActionMessage({
            message: t("Drücke LEERTASTE, um mit Pip zu sprechen", "Press SPACE to talk to Pip"),
            callback: menu,
        });
    });
    WA.room.area.onLeave(AREA).subscribe(() => {
        action?.remove();
        action = undefined;
        close();
    });
}
