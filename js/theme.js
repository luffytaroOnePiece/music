// Theme Management

const themes = {
    default: {
        '--bg-color': '#000000',
        '--accent-color': '#8a2be2',
        '--accent-glow': 'rgba(138, 43, 226, 0.4)',
        '--blob-1': '#6a00ff',
        '--blob-2': '#ff0055',
        '--blob-3': '#00e5ff'
    },
    ocean: {
        '--bg-color': '#001a1a',
        '--accent-color': '#00bfff',
        '--accent-glow': 'rgba(0, 191, 255, 0.4)',
        '--blob-1': '#00ced1', // Dark Turquoise
        '--blob-2': '#1e90ff', // Dodger Blue
        '--blob-3': '#00008b'  // Dark Blue
    },
    sunset: {
        '--bg-color': '#1a0500',
        '--accent-color': '#ff4500',
        '--accent-glow': 'rgba(255, 69, 0, 0.4)',
        '--blob-1': '#ff8c00', // Dark Orange
        '--blob-2': '#dc143c', // Crimson
        '--blob-3': '#800080'  // Purple
    },
    forest: {
        '--bg-color': '#051a05',
        '--accent-color': '#32cd32',
        '--accent-glow': 'rgba(50, 205, 50, 0.4)',
        '--blob-1': '#228b22', // Forest Green
        '--blob-2': '#00fa9a', // Medium Spring Green
        '--blob-3': '#556b2f'  // Dark Olive Green
    },
    gold: {
        '--bg-color': '#1a1a00',
        '--accent-color': '#ffd700',
        '--accent-glow': 'rgba(255, 215, 0, 0.4)',
        '--blob-1': '#daa520', // Goldenrod
        '--blob-2': '#b8860b', // Dark Goldenrod
        '--blob-3': '#ffd700'  // Gold
    }
};

export function applyTheme(themeName) {
    const theme = themes[themeName] || themes.default;
    const root = document.documentElement;

    Object.keys(theme).forEach(key => {
        root.style.setProperty(key, theme[key]);
    });
}
