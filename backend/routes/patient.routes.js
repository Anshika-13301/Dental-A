const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  bulkImportPatients,
  triggerReactivationSMS,
  updatePatient
} = require('../controllers/patient.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(protect);

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', authorize('PRACTICE_ADMIN', 'STAFF_USER', 'SUPER_ADMIN'), createPatient);
router.post('/bulk-import', authorize('PRACTICE_ADMIN', 'SUPER_ADMIN'), bulkImportPatients);
router.post('/trigger-reactivation', authorize('PRACTICE_ADMIN', 'STAFF_USER', 'SUPER_ADMIN'), triggerReactivationSMS);
router.put('/:id', authorize('PRACTICE_ADMIN', 'STAFF_USER', 'SUPER_ADMIN'), updatePatient);

module.exports = router;
