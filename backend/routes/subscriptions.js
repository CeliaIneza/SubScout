const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const createSubscriptionValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Subscription name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('cost')
    .isFloat({ min: 0.01 })
    .withMessage('Cost must be a positive number greater than 0'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code (e.g., USD, EUR)')
    .matches(/^[A-Z]{3}$/)
    .withMessage('Currency must be uppercase letters only'),
  body('frequency')
    .isIn(['Monthly', 'Yearly', 'Weekly', 'Quarterly'])
    .withMessage('Frequency must be one of: Monthly, Yearly, Weekly, Quarterly'),
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid integer'),
  body('nextBillingDate')
    .isISO8601()
    .withMessage('Next billing date must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Next billing date cannot be in the past');
      }
      return true;
    }),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

const updateSubscriptionValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Subscription ID must be a valid integer'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Subscription name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('cost')
    .isFloat({ min: 0.01 })
    .withMessage('Cost must be a positive number greater than 0'),
  body('currency')
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code (e.g., USD, EUR)')
    .matches(/^[A-Z]{3}$/)
    .withMessage('Currency must be uppercase letters only'),
  body('frequency')
    .isIn(['Monthly', 'Yearly', 'Weekly', 'Quarterly'])
    .withMessage('Frequency must be one of: Monthly, Yearly, Weekly, Quarterly'),
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid integer'),
  body('nextBillingDate')
    .isISO8601()
    .withMessage('Next billing date must be a valid date'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

const deleteSubscriptionValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Subscription ID must be a valid integer'),
];

const getSubscriptionValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Subscription ID must be a valid integer'),
];

const getSubscriptionsQueryValidation = [
  query('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty if provided'),
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive must be either true or false'),
];

// All routes require authentication
router.use(authMiddleware);

// Routes
router.get('/dashboard', subscriptionController.getDashboard);
router.get('/categories', subscriptionController.getCategories);
router.get('/', getSubscriptionsQueryValidation, validate, subscriptionController.getSubscriptions);
router.get('/:id', getSubscriptionValidation, validate, subscriptionController.getSubscription);
router.post('/', createSubscriptionValidation, validate, subscriptionController.createSubscription);
router.put('/:id', updateSubscriptionValidation, validate, subscriptionController.updateSubscription);
router.delete('/:id', deleteSubscriptionValidation, validate, subscriptionController.deleteSubscription);

module.exports = router;