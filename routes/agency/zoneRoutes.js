import express from 'express';
import {
  createZone,
  getZonesByAgency,
  getZoneById,
  updateZone,
  deleteZone,
  assignCollectorsToZone
} from '../../controllers/agency/zoneController.js';

import auth from '../../middlewares/authMiddleware.js';
import { authorizeRoles } from '../../middlewares/agency/roleMiddleware.js';

const router = express.Router();

router.post('/', auth, authorizeRoles('admin-agency'), createZone);
router.get('/agency/:agencyId', auth, authorizeRoles('admin-agency'), getZonesByAgency);
router.get('/:id', auth, authorizeRoles('admin-agency'), getZoneById);
router.put('/:id', auth, authorizeRoles('admin-agency'), updateZone);
router.delete('/:id', auth, authorizeRoles('admin-agency'), deleteZone);
router.put('/:id/assign-collectors', auth, authorizeRoles('admin-agency'), assignCollectorsToZone);

export default router;
