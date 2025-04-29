window.addEventListener('DOMContentLoaded', () => {
    // Load saved settings or default to light
    const cfg = JSON.parse(localStorage.getItem('settings') || '{}');
    const themeSelect = document.getElementById('setting-theme');

    // Set dropdown to saved value
    if (cfg.theme) themeSelect.value = cfg.theme;

    // Apply at startup
    applyTheme(cfg.theme || 'light-theme');

    document.getElementById('save-settings').onclick = () => {
        const newCfg = {
            currency: document.getElementById('setting-currency').value,
            theme:    themeSelect.value
        };
        // Persist
        localStorage.setItem('settings', JSON.stringify(newCfg));
        // Apply immediately
        applyTheme(newCfg.theme);
        alert('Settings saved!');
    };
});

function applyTheme(themeClass) {
    // Remove any existing theme classes
    document.body.classList.remove('light-theme', 'dark-theme');
    // Add the selected theme class
    document.body.classList.add(themeClass);
}
