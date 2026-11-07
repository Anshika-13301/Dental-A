const express = require('express');
const router = express.Router();
const {
  getPracticeProfile,
  updatePracticeProfile,
  getAllTenants
} = require('../controllers/tenant.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(protect);

router.get('/profile', getPracticeProfile);
router.put('/profile', authorize('PRACTICE_ADMIN', 'SUPER_ADMIN'), updatePracticeProfile);
router.get('/all', authorize('SUPER_ADMIN'), getAllTenants);

module.exports = router;
