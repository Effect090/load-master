# CasaFoot – Copy Glossary & Voice Rules

## Purpose
This file defines the canonical spelling, usage rules, and tone for all user-facing
text in CasaFoot. Follow these rules every time you add or modify copy.

---

## Preferred Darija spellings (Latin script)

| Concept           | Use this       | Avoid                    |
|-------------------|----------------|--------------------------|
| Good morning      | Sba7 l5ir      | Sba7 el khir / sebah     |
| Good evening      | Msak 5ir       | Msa lkhir / masa lkhir   |
| No / nothing      | Makainch       | Ma kaynch / mkaynch      |
| Enter / join      | Dkhol          | Dkhel / Dkhoul           |
| Found it          | L9ina          | Lgina / lgit             |
| Still / remaining | Mazal          | Mazal / Mzal             |
| Spot / place      | Blassa         | Blasa / place            |
| You're in it      | Dkholt f match | T3ah fih / dakhel        |
| With us           | M3ana          | Ma3ana / m3k             |
| Your              | Dyalk / Dyalek | Btek / ntaek             |
| Team              | Team           | Fariq (too formal)       |
| First / leading   | L9addam        | L qaddam / lkaddam       |

---

## Tone rules

### DO
- Use French for: navigation, forms, labels, errors, settings
- Use Darija for: empty states, greetings, success confirmations, social energy
- Mix French structure with Darija microcopy (e.g. "Ma kaynch match daba 🌙")
- Keep copy SHORT — every word must earn its place
- Sound like a friend, not a product manager

### DON'T
- Don't use Darija in: auth flows, error messages, legal/account text
- Don't use Arabic script (users expect Latin script)
- Don't over-translate (keep "Team", "Match", "Fair Play" in French/English — they're understood)
- Don't use cringe expressions ("Habibi", "wallah bro", etc.)
- Don't use formal French ("Veuillez", "Merci d'avoir", "Cordialement")

---

## Product terminology (canonical)

| English           | Use in app (fr-darija)    | Pure French             |
|-------------------|---------------------------|-------------------------|
| Match             | Match                     | Match                   |
| Join              | Rejoindre                 | Rejoindre               |
| Create match      | Créer un match            | Créer un match          |
| Open              | Ouvert                    | Ouvert                  |
| Full              | Complet                   | Complet                 |
| Completed         | Terminé                   | Terminé                 |
| Cancelled         | Annulé                    | Annulé                  |
| Rating / Score    | Note                      | Note                    |
| Evaluation        | Éval / Évals              | Évaluation              |
| Neighborhood      | Quartier                  | Quartier                |
| Profile           | Profil                    | Profil                  |
| Skill level       | Niveau                    | Niveau                  |
| Fair play         | Fair Play (keep English)  | Fair Play               |
| Spots left        | X place(s)                | X place(s) restante(s)  |
| Organizer         | Organisateur              | Organisateur            |
| Player card       | Carte joueur              | Carte joueur            |
| Overall rating    | Note globale              | Note globale            |

---

## Emoji usage

Use emoji sparingly and only where it adds energy:
- ✓ Empty states — one emoji at the top
- ✓ Success messages — one emoji at the end
- ✓ CTA buttons — max one, at the end (e.g. "C'est parti ! 🎉")
- ✗ Do NOT put emoji in form labels, error messages, or settings

---

## Adding new copy

1. Add the key to `src/lib/i18n/types.ts`
2. Add the fr-darija string to `translations/fr-darija.ts`
3. Add the pure French equivalent to `translations/fr.ts`
4. Reference this glossary for spelling and tone

---

## Language mode summary

| Mode        | Key        | When to use                            |
|-------------|------------|----------------------------------------|
| FR · Darija | fr-darija  | Default. Young Casablanca users.       |
| Français    | fr         | Users who prefer standard French only  |

Persisted in `localStorage` under key: `casafoot_locale`
