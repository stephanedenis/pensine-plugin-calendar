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
    this.icon = '📅';
    this.calendarView = null;
    this.scriptsLoaded = false;
  }

  /**
   * Schéma de configuration JSON Schema
   */
  static getConfigSchema() {
    return {
      title: 'Calendar Configuration',
      description: 'Configure the linear calendar display and behavior',
      type: 'object',
      properties: {
        startWeekOn: {
          type: 'string',
          title: 'Week starts on',
          description: 'First day of the week',
          enum: ['monday', 'sunday'],
          default: 'monday'
        },
        showWeekNumbers: {
          type: 'boolean',
          title: 'Show week numbers',
          description: 'Display ISO week numbers in calendar',
          default: false
        },
        monthsToDisplay: {
          type: 'number',
          title: 'Months to display',
          description: 'Number of months to load initially',
          minimum: 1,
          maximum: 12,
          default: 6
        },
        highlightToday: {
          type: 'boolean',
          title: 'Highlight today',
          description: 'Visually highlight the current day',
          default: true
        },
        scrollBehavior: {
          type: 'string',
          title: 'Scroll behavior',
          description: 'How calendar scrolls to dates',
          enum: ['smooth', 'instant'],
          default: 'smooth'
        },
        colorScheme: {
          type: 'string',
          title: 'Color scheme',
          description: 'Monthly color rotation system',
          enum: ['default', 'pastel', 'vibrant'],
          default: 'default'
        }
      },
      required: ['startWeekOn', 'monthsToDisplay']
    };
  }

  /**
   * Valeurs par défaut de la configuration
   */
  static getDefaultConfig() {
    return {
      startWeekOn: 'monday',
      showWeekNumbers: false,
      monthsToDisplay: 6,
      highlightToday: true,
      scrollBehavior: 'smooth',
      colorScheme: 'default'
    };
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

    // Enregistrer le schéma de configuration
    if (this.context.config && typeof this.context.config.registerPluginSchema === 'function') {
      this.context.config.registerPluginSchema(
        this.id,
        CalendarPlugin.getConfigSchema(),
        CalendarPlugin.getDefaultConfig()
      );
    }

    // Charger la configuration
    this.config = this.context.config
      ? await this.context.config.getPluginConfig(this.id)
      : CalendarPlugin.getDefaultConfig();

    console.log('[Calendar] Configuration loaded:', this.config);

    // Enregistrer les routes
    this.registerRoutes();

    // Écouter les événements
    this.registerEventListeners();

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
