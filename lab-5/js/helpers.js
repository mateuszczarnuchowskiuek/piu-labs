export function randomHsl() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 75%)`;
}

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function darkenHsl(hslColor, amount = 15) {
    const parts = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!parts) return hslColor;

    const h = parts[1];
    const s = parts[2];
    let l = parseInt(parts[3]);

    l = Math.max(0, l - amount);

    return `hsl(${h}, ${s}%, ${l}%)`;
}
