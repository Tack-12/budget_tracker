window.addEventListener('DOMContentLoaded', () => {
    const cfg = JSON.parse(localStorage.getItem('settings')||'{}');
    if (cfg.currency) document.getElementById('setting-currency').value = cfg.currency;
    if (cfg.theme)    document.getElementById('setting-theme').value  = cfg.theme;
    applyTheme(cfg.theme);

    document.getElementById('save-settings').onclick = () => {
        const newCfg = {
            currency: document.getElementById('setting-currency').value,
            theme:    document.getElementById('setting-theme').value
        };
        localStorage.setItem('settings', JSON.stringify(newCfg));
        applyTheme(newCfg.theme);
        alert('Settings saved!');
    };
});

function applyTheme(themeClass) {
    document.body.classList.remove('light-theme','dark-theme');
    document.body.classList.add(themeClass || 'light-theme');
}
