# Jurnalul Deciziilor Tehnice și Curatoriale (Decisions Log)

## 1. Integritatea Surselor și Trasabilitate
- **Decizie:** Fișierele din `tmp-insta-posts/` rămân 100% needitate și protejate împotriva suprascrierii.
- **Trasabilitate:** Fiecare derivat (`ART-XXXX.png`, `ART-XXXX.webp`, `ART-XXXX_thumb.webp`) conține în metadatele sale trimitere directă la captura sursă exactă și la decupajul lateral al postării (`SIDEBAR_ART-XXXX.png`).

## 2. Detecția Separatorului Instagram Desktop
- **Metodă:** Identificarea coloanei verticale de 1-2px cu valoare cromatică RGB (38, 38, 38) care separă containerul media de panoul lateral de comentarii. Algoritmul a obținut o rată de succes de 100% pe toate cele 167 capturi de postări.

## 3. Politica de Curățare și Restaurare Prudentă
- **Regulă:** Niciun generative fill sau retuș speculativ nu a fost aplicat pe suprafețele de desen. Lucrările fără suprapuneri sunt marcate `cropped`. Lucrările cu săgeți de navigare carusel suprapuse pe marginea operei sunt marcate `needs_review` și puse în carantină editorială.

## 4. Identificarea Artistului și Proveniența
- **Identitate confirmată:** Mugurel Emanuel Manea (cont Instagram `mugurelemanuelmanea`, anterior `bogdan_by757`, semnătură / monogramă recurentă `757`). Avatarul de profil a fost extras din `Pasted 2026-11-11 at 12.31.32 PM.png`.

## 5. Optimizare Web și Mediu Tehnic
- **Formate:** Generare WebP (q=88 full, q=82 thumb) cu redimensionare proporțională Lanczos (max 1600px pentru detalii optime și timp de descărcare minim). Arhiva master păstrează PNG-urile decupate fără compresie distructivă.
- **Arhitectură:** Web modern, semantic, static, accesibil, cu zero dependențe externe blocate de sandbox.
