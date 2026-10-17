/// <reference types="@workadventure/iframe-api-typings" />
//
// Pip, the court jester, standing in front of the whiteboard in the meeting room (top right of the office). Walk up to him and press space (or tap the hint on a phone):
// his dialogue box opens at the bottom of the screen (pip/index.html, code in src/pip/dialog.ts) and closes
// when you walk away.
//
// Map side (office.tmj): the animated tile on layer "furniture/npc" and the area "pip" around him.

const AREA = "pip";
/** Set to false by the dialogue box when it closes itself (Esc, ✕, "Bye"). */
const OPEN_FLAG = "pipDialogOpen";

let action: { remove(): void } | undefined;
let dialog: { close(): void } | undefined;
let inArea = false;
let opening = false;

const de = () => (WA.player.language ?? "de").toLowerCase().startsWith("de");
/** Phones and tablets: tap instead of space, and a box as wide as the screen. */
const touch = () => window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
const small = () => Math.min(screen.width, screen.height) < 700;

/** The dialogue page, next to the built script (dist/assets/… → dist/pip/index.html). */
const dialogUrl = () => new URL("../pip/index.html", window.location.href).toString();

function showHint(): void {
    action?.remove();
    action = WA.ui.displayActionMessage({
        message: touch()
            ? de() ? "Hier tippen, um mit Pip zu sprechen" : "Tap here to talk to Pip"
            : de() ? "Drücke LEERTASTE, um mit Pip zu sprechen" : "Press SPACE to talk to Pip",
        callback: () => void openDialog(),
    });
}

function hideHint(): void {
    action?.remove();
    action = undefined;
}

async function openDialog(): Promise<void> {
    if (opening) return;
    opening = true;
    hideHint();
    closeDialog();
    try {
        const phone = small();
        await WA.player.state.saveVariable(OPEN_FLAG, true);
        dialog = await WA.ui.website.open({
            url: dialogUrl(),
            position: { vertical: "bottom", horizontal: "middle" },
            size: phone ? { width: "96vw", height: "280px" } : { width: "640px", height: "240px" },
            margin: { bottom: phone ? "110px" : "96px" },
            allowApi: true,
            visible: true,
        });
    } finally {
        opening = false;
    }
}

function closeDialog(): void {
    dialog?.close();
    dialog = undefined;
}

export function initPip(): void {
    WA.room.area.onEnter(AREA).subscribe(() => {
        inArea = true;
        showHint();
    });
    WA.room.area.onLeave(AREA).subscribe(() => {
        inArea = false;
        hideHint();
        closeDialog();
    });
    // Pip closed his box himself: offer to talk again while standing next to him.
    WA.player.state.onVariableChange(OPEN_FLAG).subscribe((open) => {
        if (open !== false) return;
        dialog = undefined;
        if (inArea) showHint();
    });
}
