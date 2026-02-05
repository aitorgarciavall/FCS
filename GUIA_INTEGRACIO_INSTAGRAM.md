# Guia de Configuració: Publicació Automàtica a Instagram (Instagram Graph API)

Aquest document detalla els passos necessaris per configurar la publicació automàtica de notícies a Instagram des de la web.

## 1. Requisits Previs
Abans de començar amb el codi, cal configurar els comptes a Meta/Facebook:

1.  **Compte d'Instagram Professional:** El compte ha de ser de tipus "Empresa" (Business) o "Creador".
2.  **Pàgina de Facebook:** Has de tenir una Pàgina de Facebook i vincular-hi el compte d'Instagram.
    *   *Configuració:* Pàgina de Facebook -> Configuració -> Comptes vinculats -> Instagram.

## 2. Configurar l'App a Meta for Developers
1.  Registra't a [developers.facebook.com](https://developers.facebook.com/).
2.  Crea una nova App (**"Create App"**) de tipus **"Business"** (Empresa).
3.  Al tauler de l'App, busca **"Instagram Graph API"** i clica **"Set up"**.

## 3. Obtenir el Token d'Accés (Mode Proves)
Per fer proves sense programar l'autenticació completa (OAuth):

1.  Ves a l'eina **Graph API Explorer** (Dins de 'Eines' a Meta Developers).
2.  Selecciona la teva App.
3.  A "User or Page", tria **"Get User Access Token"**.
4.  **Permisos necessaris:** Afegeix els següents permisos:
    *   `instagram_content_publish`
    *   `pages_show_list`
    *   `pages_read_engagement`
    *   `instagram_basic`
5.  Genera el token i accepta els permisos amb el teu compte de Facebook.

## 4. Obtenir l'ID del Compte d'Instagram
Amb el token generat, fes una consulta `GET` al mateix Explorer:

```http
me/accounts?fields=instagram_business_account
```

La resposta serà tipus JSON. Guarda el número que apareix dins de `instagram_business_account` -> `id`. Aquest és el teu **IG_USER_ID**.

Exemple:
```json
{
  "instagram_business_account": {
    "id": "1784140582..."  <-- AQUEST ÉS L'ID
  }
}
```

## 5. Com Publicar (Flux Tècnic)
L'API requereix dos passos: primer puges la foto ("contenidor") i després la publiques.

### Pas A: Crear el Contenidor
Petició `POST`: `https://graph.facebook.com/v22.0/{IG_USER_ID}/media`

**Paràmetres:**
*   `image_url`: URL pública de la imatge (no funciona localhost).
*   `caption`: Text de la notícia.
*   `access_token`: El teu token.

**Resposta:** Et donarà un `{ "id": "12345..." }` (Creation ID).

### Pas B: Publicar
Petició `POST`: `https://graph.facebook.com/v22.0/{IG_USER_ID}/media_publish`

**Paràmetres:**
*   `creation_id`: L'ID obtingut al pas A.
*   `access_token`: El teu token.

## 6. Integració amb Supabase (Futur)
Per automatitzar-ho, la millor opció és crear una **Edge Function** a Supabase que:
1.  S'activi quan s'insereix una notícia a la base de dades (Webhook o Trigger).
2.  Rebi la URL de la imatge i el text.
3.  Executi les peticions HTTP (pas A i pas B) fent servir `fetch`.

> **Nota:** Els tokens generats al Graph API Explorer són temporals. Per a producció, necessitaràs configurar un "System User" a Facebook Business Manager o renovar el token periòdicament (Long-lived User Access Token).
