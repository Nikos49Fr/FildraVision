# Supabase + Twitch Setup

Document de suivi pour l'integration de Supabase et de l'authentification Twitch dans FildraVision.

## Ordre des etapes

1. Creer le projet Supabase
2. Configurer les URLs d'authentification dans Supabase
3. Recuperer la callback Twitch fournie par Supabase
4. Creer l'application Twitch Dev
5. Brancher le Client ID et le Client Secret Twitch dans Supabase
6. Ajouter `.env.local`
7. Tester en local
8. Tester sur GitHub Pages

## Etape 1 - Creation du projet Supabase

Statut : valide

Ecran "Create a new project"

- Organization : `Nikos49Fr's Org`
- Project name : `FildraVision`
- Database password : generer un mot de passe fort et le conserver dans un gestionnaire de mots de passe
- Region : `Europe`

### Security

- Enable Data API : active
- Automatically expose new tables and functions : desactive
- Enable automatic RLS : active

### Pourquoi

- `Enable Data API` : necessaire et standard avec `supabase-js`
- `Automatically expose new tables and functions` : a eviter pour garder le controle explicite sur ce qui devient accessible
- `Enable automatic RLS` : bon filet de securite pour eviter d'oublier RLS sur une nouvelle table

## Etape 2 - URLs d'auth Supabase

Statut : valide

A remplir plus tard dans `Authentication > URL Configuration`.

- Site URL : `https://<github-user>.github.io/FildraVision/`
- Redirect URLs :
  - `http://localhost:5173/`
  - `https://<github-user>.github.io/FildraVision/`

Valeurs utilisees :

- Site URL : `https://nikos49fr.github.io/FildraVision/`
- Redirect URLs :
  - `http://localhost:5173/`
  - `https://nikos49fr.github.io/FildraVision/`

## Etape 3 - Callback Twitch

Statut : valide

A recuperer plus tard dans `Authentication > Sign In / Providers > Twitch`.

Format attendu :

`https://<project-ref>.supabase.co/auth/v1/callback`

Valeur utilisee :

`https://eysibjdezhjdujnwfsce.supabase.co/auth/v1/callback`

## Etape 4 - Application Twitch Dev

Statut : valide

Champs attendus :

- Name : `FildraVision` ou une variante unique si deja pris
- OAuth Redirect URL : la callback Supabase exacte
- Category : application web classique
- Client type : `Confidentiel`

Configuration retenue :

- Category : `Website Integration`
- Client type : `Confidentiel`
- Allow users without an email : active

## Etape 5 - Variables locales

Statut : valide

Fichier a creer plus tard : `.env.local`

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<cle-publique-supabase>
```

## Etat actuel

Valide :

- projet Supabase cree
- URLs d'auth configurees
- provider Twitch configure
- application Twitch Dev creee
- connexion Twitch fonctionnelle
- deconnexion fonctionnelle
- retour utilisateur vers l'accueil apres login/logout

Point observe :

- en local, le retour OAuth peut apparaitre sous la forme `http://localhost:5173/FildraVision/#` au lieu de `http://localhost:5173/`
- cause probable : interaction entre la base Vite `/FildraVision/` et la resolution de l'URL apres redirection complete

## Note de debug locale

Sujet en cours :

- le hot reload Vite ne reflète plus certains changements locaux
- le symptome principal est que les changements SCSS ne deviennent visibles qu'apres relance de `npm run dev`
- la piste actuelle est un probleme de detection de changement fichier ou d'invalidation de cache du serveur Vite
- probleme HMR local identifie puis resolu : import avec mauvaise casse `Components` au lieu de `components`

## Note profiles

Probleme rencontre :

- message `permission denied for table profiles`
- aucune ligne creee dans `profiles` apres connexion Twitch

Cause probable :

- l'option Supabase "Automatically expose new tables and functions" a ete desactivee volontairement a la creation du projet
- il faut donc ajouter explicitement les grants Data API sur `public.profiles`

## Prochaine etape recommandee

- commencer par `profiles`
- reporter `user_rankings` juste apres

Pourquoi :

- `profiles` est la base minimale pour rattacher proprement un utilisateur Twitch authentifie a des donnees applicatives
- `user_rankings` depend logiquement de l'existence d'un utilisateur/profil identifiable
