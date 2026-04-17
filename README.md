# IPTV PWA - Instalación y despliegue

PWA reproductor de canales IPTV con URLs encriptadas AES-256.
Funciona en Android, iOS, PC y Smart TVs con navegador moderno.

## Archivos incluidos

```
IPTV_PWA/
├── index.html          ← Pagina principal
├── app.js              ← Logica de la app
├── crypto.js           ← Desencriptador AES-256
├── channels.json       ← Lista de canales (URLs encriptadas)
├── manifest.json       ← Configuracion PWA
├── sw.js               ← Service Worker (modo offline)
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── icon-maskable-512.png
```

---

## OPCIÓN 1: Desplegar con GitHub Pages (recomendado, gratis)

### Paso 1: Crear un repositorio nuevo en GitHub

Puede ser uno SEPARADO del que ya tienes para la app Android.

1. github.com → botón **+** arriba a la derecha → **New repository**
2. Nombre: `iptv-web` (o el que quieras)
3. Marca **Public** (o Private, ambos funcionan con Pages ahora)
4. NO marques "Add README"
5. **Create repository**

### Paso 2: Subir los archivos

1. En el repo nuevo, click en **uploading an existing file**
2. Arrastra TODOS los archivos de esta carpeta (incluyendo la carpeta `icons`)
3. Mensaje: "Version inicial"
4. **Commit changes**

### Paso 3: Activar GitHub Pages

1. En el repo, click **Settings**
2. Menú izquierdo → **Pages**
3. En **Source** selecciona: **Deploy from a branch**
4. Branch: **main** (o master) → carpeta **/ (root)**
5. Click **Save**
6. Espera 1-2 minutos
7. Te aparecerá una URL tipo: `https://tu-usuario.github.io/iptv-web/`

### Paso 4: Acceder a la PWA

Abre esa URL en cualquier celular o PC. ¡Lista!

Para INSTALAR como app:
- **Android/Chrome**: aparecerá un banner "Instalar" abajo, o en el menú ⋮ → "Instalar aplicación"
- **iPhone/Safari**: botón Compartir → "Añadir a pantalla de inicio"
- **PC/Chrome**: ícono de instalación en la barra de URL

---

## OPCIÓN 2: Netlify (otra alternativa gratuita)

1. netlify.com → registrarse (puede ser con GitHub)
2. Arrastrar la carpeta `IPTV_PWA` completa a su pantalla de deploy
3. Te da una URL instantánea tipo `nombre-aleatorio.netlify.app`
4. Puedes personalizar el subdominio gratis

---

## Para agregar canales nuevos

Las URLs van ENCRIPTADAS. Usa el script Python `encrypt_urls.py`:

1. Ejecuta el script con las URLs nuevas (ver README de la app Android)
2. Abre `channels.json`
3. Agrega los canales al arreglo JSON:
   ```json
   [
     { "name": "Canal Nuevo", "url": "URL_ENCRIPTADA_AQUI", "group": "TV Nacional" }
   ]
   ```
4. Commit en GitHub → la PWA se actualiza automáticamente
5. Los usuarios que ya la tengan instalada recibirán los nuevos canales al abrirla

---

## Notas importantes

1. **HTTPS obligatorio**: La PWA solo funciona sobre HTTPS. GitHub Pages y Netlify lo dan gratis.
2. **Misma clave que la app Android**: Las URLs encriptadas son intercambiables entre ambas.
3. **Streams HTTP**: Los canales que empiezan con `http://` (no https) pueden fallar en navegadores modernos por política de seguridad. Si es un problema, habría que cambiar esos servidores a HTTPS o usar un proxy.
4. **iOS Safari**: La PWA funciona pero tiene algunas limitaciones (no notificaciones push nativas).
