// app.js - Logica principal de la webapp IPTV

let channels = [];
let currentHls = null;
let installPromptEvent = null;
let headerHideTimer = null;

// Cargar lista de canales
async function loadChannels() {
    try {
        const res = await fetch('channels.json');
        channels = await res.json();
        renderChannels();
    } catch (err) {
        document.getElementById('channels-container').innerHTML =
            '<div style="text-align:center;padding:40px;color:#ff6b6b">Error cargando canales</div>';
    }
}

// Renderizar lista de canales agrupados por categoria
function renderChannels() {
    const container = document.getElementById('channels-container');
    document.getElementById('header-title').textContent = `Canales (${channels.length})`;

    // Agrupar por categoria
    const groups = {};
    channels.forEach(ch => {
        const g = ch.group || 'Sin categoría';
        if (!groups[g]) groups[g] = [];
        groups[g].push(ch);
    });

    // Orden deseado de categorias
    const orderPreference = ['TV Nacional', 'Deportes', 'Religiosos', 'Otros', 'Gobierno'];
    const orderedKeys = [
        ...orderPreference.filter(k => groups[k]),
        ...Object.keys(groups).filter(k => !orderPreference.includes(k))
    ];

    let html = '';
    for (const groupName of orderedKeys) {
        html += `<div class="category-header">${groupName}</div>`;
        for (const ch of groups[groupName]) {
            const safeName = ch.name.replace(/"/g, '&quot;');
            html += `
                <div class="channel-item" tabindex="0" data-url="${ch.url}" data-name="${safeName}">
                    <div class="channel-name">${ch.name}</div>
                    <div class="channel-group">${ch.group || 'Sin categoría'}</div>
                </div>
            `;
        }
    }
    container.innerHTML = html;

    // Asignar listener a cada canal
    document.querySelectorAll('.channel-item').forEach(item => {
        item.addEventListener('click', () => {
            const url = item.dataset.url;
            const name = item.dataset.name;
            openPlayer(url, name);
        });

        // Para navegacion con teclado / control remoto
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
    });
}

// Abrir el reproductor
async function openPlayer(encryptedUrl, name) {
    const playerScreen = document.getElementById('player-screen');
    const listScreen = document.getElementById('list-screen');
    const video = document.getElementById('video-player');
    const loadingMsg = document.getElementById('loading-msg');
    const errorMsg = document.getElementById('error-msg');

    playerScreen.classList.add('active');
    listScreen.style.display = 'none';
    loadingMsg.style.display = 'block';
    errorMsg.style.display = 'none';
    document.getElementById('player-title').textContent = name;

    try {
        // Desencriptar la URL
        const realUrl = await CryptoHelper.decrypt(encryptedUrl);

        // Reproducir con HLS.js o nativo (iOS Safari soporta HLS nativo)
        if (realUrl.includes('.m3u8') && Hls.isSupported()) {
            currentHls = new Hls({
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
            });
            currentHls.loadSource(realUrl);
            currentHls.attachMedia(video);
            currentHls.on(Hls.Events.MANIFEST_PARSED, () => {
                loadingMsg.style.display = 'none';
                video.play().catch(e => console.log('autoplay:', e));
            });
            currentHls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    showError('No se pudo cargar el canal. Puede estar fuera de línea.');
                }
            });
        } else {
            // Safari iOS y otros: reproductor nativo
            video.src = realUrl;
            video.addEventListener('loadedmetadata', () => {
                loadingMsg.style.display = 'none';
            }, { once: true });
            video.addEventListener('error', () => {
                showError('No se pudo cargar el canal. Puede estar fuera de línea.');
            }, { once: true });
            video.play().catch(e => console.log('autoplay:', e));
        }

        // Ocultar header tras unos segundos
        scheduleHeaderHide();
    } catch (err) {
        showError('Error al abrir el canal.');
        console.error(err);
    }
}

function showError(msg) {
    document.getElementById('loading-msg').style.display = 'none';
    const err = document.getElementById('error-msg');
    err.textContent = msg;
    err.style.display = 'block';
}

function scheduleHeaderHide() {
    clearTimeout(headerHideTimer);
    const header = document.getElementById('player-header');
    header.classList.remove('hidden');
    headerHideTimer = setTimeout(() => {
        header.classList.add('hidden');
    }, 3000);
}

// Cerrar reproductor
function closePlayer() {
    const playerScreen = document.getElementById('player-screen');
    const listScreen = document.getElementById('list-screen');
    const video = document.getElementById('video-player');

    if (currentHls) {
        currentHls.destroy();
        currentHls = null;
    }
    video.pause();
    video.src = '';
    video.removeAttribute('src');
    video.load();

    playerScreen.classList.remove('active');
    listScreen.style.display = '';
    clearTimeout(headerHideTimer);
}

// Event listeners
document.getElementById('back-btn').addEventListener('click', closePlayer);

// Mostrar header al tocar el video
document.getElementById('video-player').addEventListener('click', scheduleHeaderHide);
document.getElementById('player-screen').addEventListener('mousemove', scheduleHeaderHide);

// Botón Atrás del celular cierra el reproductor
window.addEventListener('popstate', () => {
    if (document.getElementById('player-screen').classList.contains('active')) {
        closePlayer();
    }
});

// Manejo del evento de instalación de PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installPromptEvent = e;
    // Mostrar banner solo si no se ha dismissed antes
    if (!localStorage.getItem('installDismissed')) {
        document.getElementById('install-banner').style.display = 'block';
    }
});

document.getElementById('install-btn')?.addEventListener('click', async () => {
    if (installPromptEvent) {
        installPromptEvent.prompt();
        const { outcome } = await installPromptEvent.userChoice;
        installPromptEvent = null;
        document.getElementById('install-banner').style.display = 'none';
    }
});

document.getElementById('close-banner')?.addEventListener('click', () => {
    document.getElementById('install-banner').style.display = 'none';
    localStorage.setItem('installDismissed', '1');
});

// Cargar canales al inicio
loadChannels();
