import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Database } from './infrastructure/database/Database';
import { ImportController } from './infrastructure/http/ImportController';
import { ImportDataUseCase } from './application/use-cases/ImportDataUseCase';
import { ExcelParserService } from './infrastructure/services/ExcelParserService';
import { PostgresPersonRepository } from './infrastructure/database/PostgresPersonRepository';
import { PostgresLocationRepository } from './infrastructure/database/PostgresLocationRepository';
import { PostgresAccessPointRepository } from './infrastructure/database/PostgresAccessPointRepository';
import { PostgresEventRepository } from './infrastructure/database/PostgresEventRepository';
import { EventPollingService } from './infrastructure/services/EventPollingService';

import { GetAllPersonsUseCase } from './application/use-cases/GetAllPersonsUseCase';
import { GetAllLocationsUseCase } from './application/use-cases/GetAllLocationsUseCase';
import { GetAllAccessPointsUseCase } from './application/use-cases/GetAllAccessPointsUseCase';
import { GetOccupancyUseCase } from './application/use-cases/GetOccupancyUseCase';
import { GetEventsByDateRangeUseCase } from './application/use-cases/GetEventsByDateRangeUseCase';

import { PersonController } from './infrastructure/http/PersonController';
import { LocationController } from './infrastructure/http/LocationController';
import { AccessPointController } from './infrastructure/http/AccessPointController';
import { ReportController } from './infrastructure/http/ReportController';

import { PostgresUserRepository } from './infrastructure/database/PostgresUserRepository';
import { LoginUseCase } from './application/use-cases/LoginUseCase';
import { AuthController } from './infrastructure/http/AuthController';
import { authenticateJWT, requireRole } from './infrastructure/http/middleware/AuthMiddleware';

const app = express();
app.use(cors());
app.use(express.json());

// Init dependencies
Database.initialize();
const pool = Database.getPool();

const excelParser = new ExcelParserService();
const importUseCase = new ImportDataUseCase(excelParser);
const importController = new ImportController(importUseCase);

const userRepository = new PostgresUserRepository(pool);
const loginUseCase = new LoginUseCase(userRepository);
const authController = new AuthController(loginUseCase);

const personRepository = new PostgresPersonRepository(pool);
const getAllPersonsUseCase = new GetAllPersonsUseCase(personRepository);
const personController = new PersonController(getAllPersonsUseCase);

const locationRepository = new PostgresLocationRepository(pool);
const getAllLocationsUseCase = new GetAllLocationsUseCase(locationRepository);
const locationController = new LocationController(getAllLocationsUseCase);

const accessPointRepository = new PostgresAccessPointRepository(pool);
const getAllAccessPointsUseCase = new GetAllAccessPointsUseCase(accessPointRepository);
const accessPointController = new AccessPointController(getAllAccessPointsUseCase);

const eventRepository = new PostgresEventRepository(pool);
const eventPollingService = new EventPollingService(
  eventRepository,
  accessPointRepository,
  personRepository,
  locationRepository
);
// Start polling every 10 seconds
eventPollingService.startPolling(10000);

const getOccupancyUseCase = new GetOccupancyUseCase(eventRepository);
const getEventsByDateRangeUseCase = new GetEventsByDateRangeUseCase(eventRepository, locationRepository);
const reportController = new ReportController(getOccupancyUseCase, getEventsByDateRangeUseCase);

// Multer setup (in memory)
const upload = multer({ storage: multer.memoryStorage() });



const apiRouter = express.Router();
apiRouter.post('/auth/login', (req, res) => authController.login(req, res));

apiRouter.post('/import', authenticateJWT, requireRole(['ADMIN']), upload.single('file'), (req, res) => importController.importData(req, res));
apiRouter.get('/persons', authenticateJWT, requireRole(['SUPERVISOR', 'ADMIN']), (req, res) => personController.getAllPersons(req, res));
apiRouter.get('/locations', authenticateJWT, requireRole(['SUPERVISOR', 'ADMIN']), (req, res) => locationController.getAllLocations(req, res));
apiRouter.get('/access-points', authenticateJWT, requireRole(['SUPERVISOR', 'ADMIN']), (req, res) => accessPointController.getAllAccessPoints(req, res));
apiRouter.get('/reports/occupancy', authenticateJWT, requireRole(['SUPERVISOR', 'ADMIN']), (req, res) => reportController.getOccupancy(req, res));
apiRouter.get('/reports/events', authenticateJWT, requireRole(['SUPERVISOR', 'ADMIN']), (req, res) => reportController.getEventsByDateRange(req, res));


app.use('/api/v1', apiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Server] Backend corriendo en el puerto ${PORT}`);
});
