const express = require('express');
const router = express.Router();
const {
  getBillingOverview,
  getInvoices,
  generateMonthlyInvoice,
  markInvoicePaid
} = require('../controllers/billing.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(protect);

router.get('/overview', getBillingOverview);
router.get('/invoices', getInvoices);
router.post('/generate-invoice', authorize('SUPER_ADMIN', 'PRACTICE_ADMIN'), generateMonthlyInvoice);
router.put('/invoices/:id/pay', authorize('SUPER_ADMIN', 'PRACTICE_ADMIN'), markInvoicePaid);

module.exports = router;
