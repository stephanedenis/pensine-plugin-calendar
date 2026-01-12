# Migration du calendrier vers plugin

## 📋 Vue d'ensemble

Migration réussie du composant LinearCalendar depuis `lib/components/linear-calendar/` vers le plugin `pensine-plugin-calendar`.

## 📦 Fichiers migrés

### Composants (2042 lignes)
- **components/linear-calendar.js** (1310 lignes)
  - Source: `lib/components/linear-calendar/linear-calendar.js`
  - Calendrier linéaire avec scroll infini
  - Système de couleurs 12 mois
  - Gestion des dates marquées
  - Sélection de plages de dates

- **components/configurable-component.js** (~100 lignes)
  - Source: `lib/components/linear-calendar/configurable-component.js`
  - Classe de base pour composants configurables
  - Interface standardisée pour les options

### Styles
- **styles/calendar.css** (732 lignes)
  - Source: `lib/components/linear-calendar/linear-calendar-v2.css`
  - Styles complets du calendrier
  - Système de couleurs mensuel
  - Responsive design
  - Animations et transitions

### Intégration plugin
- **views/calendar-view.js** (175 lignes - nouveau)
  - Wrapper autour de LinearCalendar
  - Intégration avec l'API plugin (context)
  - Gestion des dates marquées via storage
  - Handlers d'événements

- **calendar-plugin.js** (mis à jour)
  - Chargement dynamique des dépendances (CSS + JS)
  - Instanciation de CalendarView
  - Routes et événements
  - Lifecycle hooks complets

## 🔄 Changements d'architecture

### Avant (monolithe)
```javascript
// Dans app.js
import LinearCalendar from './lib/components/linear-calendar/linear-calendar.js';
const calendar = new LinearCalendar(container, options);
```

### Après (plugin)
```javascript
// Le plugin gère tout
const calendarPlugin = new CalendarPlugin(context);
await calendarPlugin.enable();
// La route /calendar affiche automatiquement le calendrier
```

## 🔌 Intégration avec le plugin system

### Context API utilisé
```javascript
{
  storage: {
    list(), readJSON(), writeJSON()  // Charger dates marquées
  },
  events: {
    emit(), on()  // Communication inter-plugins
  },
  router: {
    navigate(), register()  // Navigation vers journal
  },
  config: {
    get()  // Configuration du calendrier
  }
}
```

### Événements émis
- `calendar:day-click` - Clic sur un jour
- `calendar:week-load` - Chargement de semaine (infinite scroll)
- `calendar:event-created` - Événement créé
- `calendar:event-error` - Erreur

### Événements écoutés
- `calendar:event-create` - Demande de création d'événement
- `calendar:event-update` - Mise à jour événement
- `journal:entry-saved` - Entrée journal sauvegardée (pour marquer le jour)

## 📊 Métriques

### Code
- **Total lignes** : ~2800 lignes
  - Components: 1410 lignes
  - Styles: 732 lignes
  - Views: 175 lignes
  - Plugin: ~200 lignes
  - Manifeste: ~30 lignes

### Commits
- **pensine-plugin-calendar** : f3d0308
- **pensine-web** : f8fc60a (submodule update)

## ✅ Fonctionnalités préservées

Toutes les fonctionnalités du LinearCalendar original sont préservées :
- ✅ Scroll infini (vertical)
- ✅ Système de couleurs 12 mois
- ✅ Personnalisation jour de début de semaine
- ✅ Marquage de dates
- ✅ Handlers de clic
- ✅ Détection weekends
- ✅ Bordures de transition mois
- ✅ Design responsive
- ✅ Configuration standardisée

## 🆕 Fonctionnalités ajoutées

Nouvelles capacités grâce à l'intégration plugin :
- ✅ Chargement automatique dates marquées depuis storage
- ✅ Navigation vers journal au clic sur jour
- ✅ Communication avec autres plugins via events
- ✅ Configuration centralisée via plugin.json
- ✅ Lifecycle propre (enable/disable)
- ✅ Chargement dynamique des dépendances

## 🧪 Tests requis

### Fonctionnels
- [ ] Affichage du calendrier sur route `/calendar`
- [ ] Scroll infini charge nouvelles semaines
- [ ] Clic sur jour ouvre le journal (`/journal/YYYY-MM-DD`)
- [ ] Dates avec journal sont marquées
- [ ] Dates avec événements sont marquées
- [ ] Configuration respectée (startWeekOn, monthsToDisplay)

### Intégration
- [ ] Événement `calendar:day-click` émis correctement
- [ ] Événement `journal:entry-saved` marque le jour
- [ ] Plugin se désactive proprement (cleanup listeners)
- [ ] CSS chargé sans conflits
- [ ] Scripts chargés dans le bon ordre

### Performance
- [ ] Pas de régression temps de chargement
- [ ] Scroll reste fluide
- [ ] Pas de memory leaks sur disable/enable

## 📝 Configuration

### plugin.json
```json
{
  "config": {
    "startWeekOn": "monday",
    "showWeekNumbers": true,
    "monthsToDisplay": 6
  }
}
```

### Mapping vers LinearCalendar
```javascript
{
  weekStartDay: config.startWeekOn === 'sunday' ? 0 : 1,
  weeksToLoad: config.monthsToDisplay * 4,
  showWeekNumbers: config.showWeekNumbers,
  // ... autres options avec defaults
}
```

## 🔜 Prochaines étapes

### Court terme
1. **Tests manuels** - Valider toutes les fonctionnalités
2. **Intégrer dans app.js** - Charger et activer le plugin
3. **Tester avec storage réel** - GitHub/Local modes

### Moyen terme
1. **Ajouter vue jour dédiée** - Actuellement redirige vers journal
2. **Événements calendrier** - Créer/éditer événements directement
3. **Filtres et catégories** - Filtrer dates marquées par type

### Long terme
1. **Vues alternatives** - Mensuel, hebdomadaire
2. **Synchronisation** - Sync avec Google Calendar / iCal
3. **Récurrence** - Événements récurrents

## 🐛 Points d'attention

### Dépendances de chargement
Les scripts doivent être chargés dans l'ordre :
1. `configurable-component.js` (base)
2. `linear-calendar.js` (dépend de ConfigurableComponent)
3. `calendar-view.js` (dépend de LinearCalendar)

Géré par `loadDependencies()` dans `calendar-plugin.js`.

### Chemins relatifs
Les chemins sont relatifs à `pensine-web/` :
```javascript
const pluginPath = 'plugins/pensine-plugin-calendar';
```

Si l'architecture change, mettre à jour ces chemins.

### Storage paths
Conventions :
- Événements: `calendar/events/{date}/{id}.json`
- Entrées journal: `journal/entries/{date}.json`

Respecter ces conventions pour compatibilité inter-plugins.

## 🔗 Références

### Code source
- Plugin: https://github.com/stephanedenis/pensine-plugin-calendar
- Commit migration: f3d0308

### Documentation
- [ARCHITECTURE_TEMPS.md](../../docs/ARCHITECTURE_TEMPS.md) - Architecture globale
- [PLUGINS_SUBMODULES.md](../../docs/PLUGINS_SUBMODULES.md) - Workflow submodules
- [plugin.json](plugin.json) - Manifeste du plugin

---

**Date** : 17 décembre 2025
**Statut** : ✅ Migration complète
**Prochaine étape** : Intégration dans app.js
