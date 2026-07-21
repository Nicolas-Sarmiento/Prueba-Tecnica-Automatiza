import axios from 'axios';
import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { IAccessPointRepository } from '../../domain/repositories/IAccessPointRepository';
import { IPersonRepository } from '../../domain/repositories/IPersonRepository';
import { ILocationRepository } from '../../domain/repositories/ILocationRepository';
import { Event } from '../../domain/entities/Event';

/**
 * Servicio de infraestructura que actúa como un proceso en segundo plano (Daemon).
 * 
 * Se encarga de consultar periódicamente la API externa (BioStar mock)
 * para sincronizar los nuevos eventos de acceso hacia nuestra base de datos local,
 * calculando además la ocupación en tiempo real.
 */
export class EventPollingService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling = false;
  private bioStarApiUrl = process.env.BIOSTAR_API_URL || 'http://localhost:4000';

  constructor(
    private eventRepository: IEventRepository,
    private accessPointRepository: IAccessPointRepository,
    private personRepository: IPersonRepository,
    private locationRepository: ILocationRepository
  ) {}

  /**
   * Inicia el proceso de polling (consulta periódica).
   * 
   * @param intervalMs - Intervalo en milisegundos entre cada consulta (default: 10000ms)
   */
  public startPolling(intervalMs: number = 10000) {
    if (this.pollingInterval) return;
    
    console.log(`Starting BioStar Event polling every ${intervalMs}ms...`);
    this.pollingInterval = setInterval(() => this.pollEvents(), intervalMs);
    // Execute immediately on start
    this.pollEvents();
  }

  public stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Stopped BioStar Event polling.');
    }
  }

  /**
   * Ejecuta una ronda de sincronización de eventos.
   * Evita superposiciones mediante la bandera \`isPolling\`.
   */
  private async pollEvents() {
    if (this.isPolling) return;
    this.isPolling = true;

    try {
      // Get the last event timestamp we have in DB
      const lastTimestamp = await this.eventRepository.getLatestEventTimestamp();
      
      let url = `${this.bioStarApiUrl}/api/events/search`;
      if (lastTimestamp) {
        // Add 1 millisecond so we don't fetch the exact same event again
        const nextTime = new Date(lastTimestamp.getTime() + 1);
        url += `?start_datetime=${nextTime.toISOString()}`;
      }

      const response = await axios.get(url);
      const eventsData = response.data?.EventCollection?.rows || [];

      if (eventsData.length > 0) {
        console.log(`Fetched ${eventsData.length} new events from BioStar mock.`);
        
        for (const ev of eventsData) {
          // Resolve internal IDs
          const personId = await this.personRepository.getPersonIdByBiostarId(ev.user_id);
          const accessPointId = await this.accessPointRepository.getAccessPointIdByBiostarId(ev.device_id);

          if (!personId) {
            console.warn(`Person not found for biostar_id ${ev.user_id}, skipping event.`);
            continue;
          }
          if (!accessPointId) {
            console.warn(`AccessPoint not found for biostar_id ${ev.device_id}, skipping event.`);
            continue;
          }

          const newEvent: Event = {
            accessPointId,
            personId,
            timestamp: new Date(ev.datetime),
            eventType: ev.type as 'ENTRADA' | 'SALIDA',
            biostar_eventId: ev.id
          };

          // Business Rule: Update occupancy only if the action is valid.
          // i.e., last action at this location was the opposite, or there is no last action and current is ENTRADA.
          let shouldUpdateOccupancy = false;
          const locationId = await this.accessPointRepository.getLocationIdByAccessPointId(accessPointId);
          
          if (locationId) {
            const lastEventType = await this.eventRepository.getLastPersonEventTypeAtLocation(personId, locationId);
            
            if (lastEventType === null && newEvent.eventType === 'ENTRADA') {
              shouldUpdateOccupancy = true;
            } else if (lastEventType === 'ENTRADA' && newEvent.eventType === 'SALIDA') {
              shouldUpdateOccupancy = true;
            } else if (lastEventType === 'SALIDA' && newEvent.eventType === 'ENTRADA') {
              shouldUpdateOccupancy = true;
            } else {
              console.warn(`Occupancy not updated for person ${personId} at location ${locationId}. Invalid transition from ${lastEventType} to ${newEvent.eventType}.`);
            }
          }

          const { isNew } = await this.eventRepository.upsertEvent(newEvent);
          
          if (isNew && shouldUpdateOccupancy) {
            await this.locationRepository.updateOccupancy(accessPointId, newEvent.eventType);
          }
        }
      }

    } catch (error: any) {
      console.error('Error polling events from BioStar:', error.message);
    } finally {
      this.isPolling = false;
    }
  }
}
