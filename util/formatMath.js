const subScript = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "a": "ₐ", "b": "b", "c": "c", "d": "d", "e": "ₑ", "f": "f", "g": "g", "h": "ₕ", "i": "ᵢ", "j": "ⱼ",
    "k": "ₖ", "l": "ₗ", "m": "ₘ", "n": "ₙ", "o": "ₒ", "p": "ₚ", "q": "q", "r": "ᵣ", "s": "ₛ", "t": "ₜ",
    "u": "ᵤ", "v": "ᵥ", "w": "w", "x": "ₓ", "y": "y", "z": "z",
    "(": "₍", ")": "₎", "+": "₊", "-": "₋", "/": "⸝", "=": "₌", "∞": " ͚​",
    "α": "ₐ", "β": "ᵦ", "γ": "ᵧ", "φ": "ᵩ", "ϕ": "ᵩ", "χ": "ᵪ", "θ": "ᵿ"
};


const superScript = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "A": "ᴬ", "B": "ᴮ", "C": "ꟲ", "D": "ᴰ", "E": "ᴱ", "F": "ꟳ", "G": "ᴳ", "H": "ᴴ", "I": "ᴵ", "J": "ᴶ",
    "K": "ᴷ", "L": "ᴸ", "M": "ᴹ", "N": "ᴺ", "O": "ᴼ", "P": "ᴾ", "Q": "ꟴ", "R": "ᴿ", "S": "ˢ", "T": "ᵀ",
    "U": "ᵁ", "V": "ⱽ", "W": "ᵂ", "X": "ˣ", "Y": "𐞲", "Z": "ᶻ",
    "a": "ᵃ", "b": "ᵇ", "c": "ᶜ", "d": "ᵈ", "e": "ᵉ", "f": "ᶠ", "g": "ᵍ", "h": "ʰ", "i": "ⁱ", "j": "ʲ",
    "k": "ᵏ", "l": "ˡ", "m": "ᵐ", "n": "ⁿ", "o": "ᵒ", "p": "ᵖ", "q": "𐞥", "r": "ʳ", "s": "ˢ", "t": "ᵗ",
    "u": "ᵘ", "v": "ᵛ", "w": "ʷ", "x": "ˣ", "y": "ʸ", "z": "ᶻ",
    "(": "⁽", ")": "⁾", "+": "⁺", "-": "⁻", "/": "ᐟ",  "=": "⁼", ".": "·", ",": "’",
    "α": "ᵅ", "β": "ᵝ", "γ": "ᵞ", "δ": "ᵟ", "φ": "ᶲ", "ϕ": "ᵠ", "χ": "ᵡ", "ε": "ᵋ", "θ": "ᶿ", "π": " ⷫ"
};


function formatMath(s) {
    if (!s) return "";
    s = s.replace(/\{inf\}/gi, "∞");
    extractGroups(s, "subscr#?", "?#").forEach(g=>{s = s.replace(g.fullMatch, formatSubscript(g.captured?.toLowerCase()))});
    extractGroups(s, "superscr#?", "?#").forEach(g=>{s = s.replace(g.fullMatch, formatSuperscript(g.captured))});
    s = formatRoot(s);
    return s;
}

function formatSubscript(s) {
    if(!s) return "";
    s = nullifySubSuper(s);
    for (let c in subScript) {
        s = s.replaceAll(c, subScript[c]);
    }
    return s;
}

function formatSuperscript(s) {
    if(!s) return "";
    s = nullifySubSuper(s);
    for (let c in superScript) {
        s = s.replaceAll(c, superScript[c]);
    }
    return s;
}

function formatRoot(s) {
    s = s.replaceAll("sqrt(", "√(");
    s = s.replaceAll("cbrt(", "∛(");
    s = s.replaceAll("ftrt(", "∜(");
    s = s.replace(/root\((.+?)\)\(/g, (_, g) => `${formatSuperscript(g)}√(`);
    return s;
}

function nullifySubSuper(s) {
    s = s.replaceAll("subscr#?", "_(");
    s = s.replaceAll("superscr#?", "^(");
    s = s.replaceAll("?#", ")")
    return s;
}

function extractGroups(input, startTag, endTag) {
    const results = [];

    let i = 0;
    while (i < input.length) {
        const start = input.indexOf(startTag, i);
        if (start === -1) break;

        let depth = 1;
        let contentStart = start + startTag.length;
        let j = contentStart;

        while (j < input.length && depth > 0) {
            if (input.startsWith(startTag, j)) {
                depth++;
                j += startTag.length;
            } else if (input.startsWith(endTag, j)) {
                depth--;
                j += endTag.length;
            } else {
                j++;
            }
        }

        if (depth === 0) {
            const fullMatch = input.slice(start, j);
            const captured = input.slice(contentStart, j - endTag.length);
            results.push({ fullMatch, captured });
            i = j;
        } else {
            break;
        }
    }

    return results;
}

module.exports = { formatMath, formatSubscript, formatSuperscript, formatRoot }