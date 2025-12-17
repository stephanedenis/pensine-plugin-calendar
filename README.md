# Pensine Plugin - Calendar

Plugin de calendrier linéaire pour Pensine - le 3e hémisphère du cerveau.

## Vue d'ensemble

Ce plugin fournit une vue calendaire interactive avec :
- Vue linéaire (mois consécutifs)
- Navigation par mois/semaine/jour
- Affichage des événements et journaux
- Intégration avec le système d'événements Pensine

## Installation

Ce plugin est un submodule du projet principal [pensine-web](https://github.com/stephanedenis/pensine-web).

```bash
cd pensine-web
git submodule update --init plugins/pensine-plugin-calendar
```

## Structure

```
pensine-plugin-calendar/
├── calendar-plugin.js      # Fichier principal du plugin
├── plugin.json             # Manifeste du plugin
├── views/                  # Vues React/HTML
│   └── linear-view.js
├── components/             # Composants réutilisables
├── adapters/              # Adaptateurs de données
├── styles/                # Styles CSS
│   └── calendar.css
└── README.md
```

## Développement

Voir [ARCHITECTURE_TEMPS.md](https://github.com/stephanedenis/pensine-web/blob/main/docs/ARCHITECTURE_TEMPS.md) pour les spécifications complètes.

## License

MIT © 2025 Stéphane Denis
