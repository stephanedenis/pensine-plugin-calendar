/**
 * CalendarView - Vue principale du plugin calendar
 * Wrapper autour du composant LinearCalendar pour l'intégration avec Pensine
 * @version 0.1.0
 */

class CalendarView {
  constructor(context) {
    this.context = context;
    this.calendar = null;
    this.container = null;
  }

  /**
   * Render la vue et retourne l'élément DOM
   */
  async render() {
    // Créer le container
    this.container = document.createElement('div');
    this.container.id = 'calendar-view';
    this.container.className = 'pensine-calendar-view';

    // Charger la configuration du plugin
    const config = await this.context.config.get('calendar') || {};

    // Configuration par défaut
    const calendarConfig = {
      weekStartDay: config.startWeekOn === 'sunday' ? 0 : 1,
      monthFormat: 'short',
      weeksToLoad: config.monthsToDisplay ? config.monthsToDisplay * 4 : 52,
      locale: 'fr-CA',
      markedDates: await this.loadMarkedDates(),
      onDayClick: (date, events, mouseEvent) => this.handleDayClick(date, events, mouseEvent),
      onWeekLoad: (direction, weekStart) => this.handleWeekLoad(direction, weekStart),
      autoScroll: true,
      showWeekdays: true,
      infiniteScroll: true,
      monthColors: true,
      weekendOpacity: 0.15,
      markedDateOpacity: 0.25,
      showWeekNumbers: config.showWeekNumbers !== false,
      dayHeight: 28
    };

    // Importer et instancier LinearCalendar
    // Note: LinearCalendar est chargé depuis components/linear-calendar.js
    if (typeof LinearCalendar === 'undefined') {
      console.error('[CalendarView] LinearCalendar not loaded');
      this.container.innerHTML = '<div class="error">Erreur: Composant calendrier non chargé</div>';
      return this.container;
    }

    // Créer l'instance du calendrier
    this.calendar = new LinearCalendar(this.container, calendarConfig);

    return this.container;
  }

  /**
   * Charger les dates marquées depuis le storage
   */
  async loadMarkedDates() {
    try {
      // Charger les événements du calendrier
      const eventsPath = 'calendar/events/';
      const eventFiles = await this.context.storage.list(eventsPath);

      const markedDates = [];
      for (const eventFile of eventFiles) {
        const event = await this.context.storage.readJSON(eventFile);
        if (event && event.date) {
          markedDates.push(event.date);
        }
      }

      // Charger les jours avec journal
      const journalPath = 'journal/entries/';
      const journalFiles = await this.context.storage.list(journalPath);

      for (const journalFile of journalFiles) {
        // Extraire la date du nom de fichier (format: YYYY-MM-DD.json)
        const match = journalFile.match(/(\d{4}-\d{2}-\d{2})\.json$/);
        if (match && !markedDates.includes(match[1])) {
          markedDates.push(match[1]);
        }
      }

      return markedDates;
    } catch (error) {
      console.error('[CalendarView] Error loading marked dates:', error);
      return [];
    }
  }

  /**
   * Gérer le clic sur un jour
   */
  handleDayClick(date, events, mouseEvent) {
    console.log('[CalendarView] Day click:', date);

    // Émettre événement pour les autres plugins
    this.context.events.emit('calendar:day-click', {
      date,
      events,
      mouseEvent
    });

    // Naviguer vers le journal de ce jour
    this.context.router.navigate(`/journal/${date}`);
  }

  /**
   * Gérer le chargement d'une nouvelle semaine (infinite scroll)
   */
  handleWeekLoad(direction, weekStart) {
    console.log('[CalendarView] Week load:', direction, weekStart);

    // Émettre événement
    this.context.events.emit('calendar:week-load', {
      direction,
      weekStart
    });
  }

  /**
   * Mettre à jour les dates marquées
   */
  async updateMarkedDates() {
    if (!this.calendar) return;

    const markedDates = await this.loadMarkedDates();
    this.calendar.setMarkedDates(markedDates);
  }

  /**
   * Marquer une date spécifique
   */
  markDate(date) {
    if (!this.calendar) return;
    this.calendar.markDate(date);
  }

  /**
   * Naviguer à une date spécifique
   */
  navigateToDate(date) {
    if (!this.calendar) return;
    this.calendar.scrollToDate(date);
  }

  /**
   * Cleanup lors de la destruction de la vue
   */
  destroy() {
    if (this.calendar && typeof this.calendar.destroy === 'function') {
      this.calendar.destroy();
    }
    this.calendar = null;
    this.container = null;
  }
}

// Export pour usage par le plugin
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalendarView;
}
