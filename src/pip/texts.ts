// Everything Pip says: jokes, oracle sayings and riddles. Add your own here.

export type Lang = "de" | "en";

// ---------- texts ----------

export const JOKES: Record<Lang, string[]> = {
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
        "The count asked me if I could be serious. I said: \"Only after 6 pm, my lord, and that costs extra.\"",
        "Why do programmers sit in the dark? Light is a feature, scheduled for next sprint.",
    ],
};

export const ORACLE: Record<Lang, string[]> = {
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

export interface Riddle {
    id: string;
    q: Record<Lang, string>;
    answers: Record<Lang, string[]>; // first one is right
}

export const RIDDLES: Riddle[] = [
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

