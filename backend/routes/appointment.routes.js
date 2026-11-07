const express = require('express');
const router = express.Router();
const {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  getHygieneMetrics
} = require('../controllers/appointment.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(protect);

router.get('/', getAppointments);
router.post('/', authorize('PRACTICE_ADMIN', 'STAFF_USER', 'SUPER_ADMIN'), createAppointment);
router.put('/:id/status', authorize('PRACTICE_ADMIN', 'STAFF_USER', 'SUPER_ADMIN'), updateAppointmentStatus);
router.get('/metrics', getHygieneMetrics);

module.exports = router;
