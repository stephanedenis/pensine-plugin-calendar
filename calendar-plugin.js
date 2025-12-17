/**
 * Pensine Calendar Plugin
 * 
 * Plugin de calendrier linéaire pour Pensine
 * @version 0.1.0
 */

export default class CalendarPlugin {
  constructor(context) {
    this.context = context;
    this.id = 'calendar';
    this.name = 'Calendar';
    this.version = '0.1.0';
    this.calendarView = null;
    this.scriptsLoaded = false;
  }

  /**
   * Charger les dépendances du plugin (CSS et JS)
   */
  async loadDependencies() {
    if (this.scriptsLoaded) return;

    const pluginPath = 'plugins/pensine-plugin-calendar';

    // Charger le CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = `${pluginPath}/styles/calendar.css`;
    document.head.appendChild(cssLink);

    // Charger ConfigurableComponent (dépendance de LinearCalendar)
    await this.loadScript(`${pluginPath}/components/configurable-component.js`);
    
    // Charger LinearCalendar
    await this.loadScript(`${pluginPath}/components/linear-calendar.js`);
    
    // Charger CalendarView
    await this.loadScript(`${pluginPath}/views/calendar-view.js`);

    this.scriptsLoaded = true;
    console.log('[Calendar] Dependencies loaded');
  }

  /**
   * Charger un script de manière asynchrone
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Hook appelé lors de l'activation du plugin
   */
  async enable() {
    console.log('[Calendar] Plugin enabled');
    
    // Charger les dépendances (CSS + JS)
    await this.loadDependencies();
    
    // Enregistrer les routes
    this.registerRoutes();
    
    // Écouter les événements
    this.registerEventListeners();
    
    // Charger la configuration
    this.config = await this.context.config.get('calendar') || {};
    
    // Émettre événement d'activation
    this.context.events.emit('plugin:enabled', { pluginId: this.id });
  }

  /**
   * Hook appelé lors de la désactivation du plugin
   */
  async disable() {
    console.log('[Calendar] Plugin disabled');
    
    // Détruire la vue si elle existe
    if (this.calendarView && typeof this.calendarView.destroy === 'function') {
      this.calendarView.destroy();
    }
    this.calendarView = null;
    
    // Nettoyer les listeners
    this.context.events.off('calendar:*', this.id);
    
    // Émettre événement de désactivation
    this.context.events.emit('plugin:disabled', { pluginId: this.id });
  }

  /**
   * Enregistrer les routes du plugin
   */
  registerRoutes() {
    // Route principale du calendrier
    this.context.router.register('/calendar', async () => {
      return this.renderCalendarView();
    });

    // Route pour un jour spécifique
    this.context.router.register('/calendar/:date', async (params) => {
      return this.renderDayView(params.date);
    });
  }

  /**
   * Enregistrer les listeners d'événements
   */
  registerEventListeners() {
    // Création d'événement
    this.context.events.on('calendar:event-create', (data) => {
      this.handleEventCreate(data);
    }, this.id);

    // Mise à jour d'événement
    this.context.events.on('calendar:event-update', (data) => {
      this.handleEventUpdate(data);
    }, this.id);

    // Mise à jour depuis le journal
    this.context.events.on('journal:entry-saved', (data) => {
      this.handleJournalEntrySaved(data);
    }, this.id);
  }

  /**
   * Render la vue calendrier principale
   */
  async renderCalendarView() {
    try {
      // Créer l'instance de CalendarView si nécessaire
      if (!this.calendarView) {
        this.calendarView = new CalendarView(this.context);
      }

      // Render et retourner le container
      const container = await this.calendarView.render();
      return container;
    } catch (error) {
      console.error('[Calendar] Error rendering calendar view:', error);
      return `<div class="error">Erreur lors du chargement du calendrier: ${error.message}</div>`;
    }
  }

  /**
   * Render la vue d'un jour spécifique
   */
  async renderDayView(date) {
    // Pour l'instant, rediriger vers le journal
    // Plus tard, on pourra créer une vue jour dédiée
    this.context.router.navigate(`/journal/${date}`);
    return null;
  }

  /**
   * Gérer la création d'un événement
   */
  async handleEventCreate(data) {
    console.log('[Calendar] Event create:', data);
    
    try {
      // Sauvegarder l'événement
      await this.context.storage.writeJSON(
        `calendar/events/${data.date}/${data.id}.json`,
        data
      );
      
      // Émettre confirmation
      this.context.events.emit('calendar:event-created', data);

      // Mettre à jour la vue si elle existe
      if (this.calendarView) {
        this.calendarView.markDate(data.date);
      }
    } catch (error) {
      console.error('[Calendar] Error creating event:', error);
      this.context.events.emit('calendar:event-error', { error: error.message });
    }
  }

  /**
   * Gérer la mise à jour d'un événement (ex: jour avec journal)
   */
  async handleEventUpdate(data) {
    console.log('[Calendar] Event update:', data);
    
    if (this.calendarView && data.date) {
      this.calendarView.markDate(data.date);
    }
  }

  /**
   * Gérer la sauvegarde d'une entrée de journal
   */
  handleJournalEntrySaved(data) {
    console.log('[Calendar] Journal entry saved:', data.date);
    
    // Marquer ce jour dans le calendrier
    if (this.calendarView && data.date) {
      this.calendarView.markDate(data.date);
    }
  }
}
