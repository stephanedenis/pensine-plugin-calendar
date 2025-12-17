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
  }

  /**
   * Hook appelé lors de l'activation du plugin
   */
  async enable() {
    console.log('[Calendar] Plugin enabled');
    
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
    // Clic sur un jour
    this.context.events.on('calendar:day-click', (data) => {
      this.handleDayClick(data);
    }, this.id);

    // Création d'événement
    this.context.events.on('calendar:event-create', (data) => {
      this.handleEventCreate(data);
    }, this.id);
  }

  /**
   * Render la vue calendrier principale
   */
  async renderCalendarView() {
    // TODO: Implémenter le rendu du calendrier linéaire
    return '<div id="calendar-view">Calendar View - À implémenter</div>';
  }

  /**
   * Render la vue d'un jour spécifique
   */
  async renderDayView(date) {
    // TODO: Implémenter le rendu de la vue jour
    return `<div id="day-view">Day View - ${date} - À implémenter</div>`;
  }

  /**
   * Gérer le clic sur un jour
   */
  handleDayClick(data) {
    console.log('[Calendar] Day clicked:', data);
    this.context.router.navigate(`/calendar/${data.date}`);
  }

  /**
   * Gérer la création d'un événement
   */
  async handleEventCreate(data) {
    console.log('[Calendar] Event create:', data);
    
    // Sauvegarder l'événement
    await this.context.storage.writeJSON(
      `calendar/events/${data.date}/${data.id}.json`,
      data
    );
    
    // Émettre confirmation
    this.context.events.emit('calendar:event-created', data);
  }
}
