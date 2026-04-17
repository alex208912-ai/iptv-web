// CryptoHelper.js
// Desencripta URLs AES-256-CBC usando Web Crypto API del navegador.
// Clave dividida en 4 partes y ofuscada (igual que la app Android).

const CryptoHelper = (function() {
    // Strings "basura" para confundir ingenieros inversos
    const TRASH1 = "a7f3x9p2m8n4";
    const TRASH2 = "kL9pQ2nRtYuI";
    const TRASH3 = "bG5hJ8vC3wE1";

    // Partes de la clave AES-256 (desordenadas)
    const B = "f75e48d25e96d9e9";  // Parte 2
    const D = "b59c6bad8a8319c5";  // Parte 4
    const A = "5b8f8ed036b08fe1";  // Parte 1
    const C = "f174be98753f0e73";  // Parte 3

    function buildKeyBytes() {
        // Orden correcto: A+B+C+D
        const hex = A + B + C + D;
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    }

    function base64ToBytes(b64) {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    async function decrypt(encryptedBase64) {
        const combined = base64ToBytes(encryptedBase64);
        const iv = combined.slice(0, 16);
        const ciphertext = combined.slice(16);

        const keyBytes = buildKeyBytes();
        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            keyBytes,
            { name: "AES-CBC" },
            false,
            ["decrypt"]
        );

        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-CBC", iv: iv },
            cryptoKey,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    }

    return { decrypt };
})();
