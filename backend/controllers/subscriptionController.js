const db = require('../config/database');

// Calculate monthly cost based on frequency
const calculateMonthlyCost = (cost, frequency) => {
  switch (frequency) {
    case 'Monthly':
      return cost;
    case 'Yearly':
      return cost / 12;
    case 'Weekly':
      return (cost * 52) / 12;
    case 'Quarterly':
      return (cost * 4) / 12;
    default:
      return cost;
  }
};

// Calculate yearly cost based on frequency
const calculateYearlyCost = (cost, frequency) => {
  switch (frequency) {
    case 'Monthly':
      return cost * 12;
    case 'Yearly':
      return cost;
    case 'Weekly':
      return cost * 52;
    case 'Quarterly':
      return cost * 4;
    default:
      return cost * 12;
  }
};

// Get all subscriptions for user
exports.getSubscriptions = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT 
        s.id, s.name, s.cost, s.currency, s.frequency, 
        s.next_billing_date, s.notes, s.is_active,
        s.created_at, s.updated_at,
        c.id as category_id, c.name as category_name
      FROM subscriptions s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.user_id = $1
    `;

    const params = [userId];
    let paramCounter = 2;

    // Filter by category if provided
    if (category) {
      query += ` AND c.name = $${paramCounter}`;
      params.push(category);
      paramCounter++;
    }

    // Filter by active status if provided
    if (isActive !== undefined) {
      query += ` AND s.is_active = $${paramCounter}`;
      params.push(isActive === 'true');
      paramCounter++;
    }

    query += ' ORDER BY s.next_billing_date ASC';

    const result = await db.query(query, params);

    const subscriptions = result.rows.map(sub => ({
      id: sub.id,
      name: sub.name,
      cost: parseFloat(sub.cost),
      currency: sub.currency,
      frequency: sub.frequency,
      nextBillingDate: sub.next_billing_date,
      notes: sub.notes,
      isActive: sub.is_active,
      category: sub.category_id ? {
        id: sub.category_id,
        name: sub.category_name
      } : null,
      createdAt: sub.created_at,
      updatedAt: sub.updated_at
    }));

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subscriptions'
    });
  }
};

// Get single subscription
exports.getSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `SELECT 
        s.id, s.name, s.cost, s.currency, s.frequency, 
        s.next_billing_date, s.notes, s.is_active,
        s.created_at, s.updated_at,
        c.id as category_id, c.name as category_name
      FROM subscriptions s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.id = $1 AND s.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const sub = result.rows[0];

    res.json({
      success: true,
      data: {
        id: sub.id,
        name: sub.name,
        cost: parseFloat(sub.cost),
        currency: sub.currency,
        frequency: sub.frequency,
        nextBillingDate: sub.next_billing_date,
        notes: sub.notes,
        isActive: sub.is_active,
        category: sub.category_id ? {
          id: sub.category_id,
          name: sub.category_name
        } : null,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at
      }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subscription'
    });
  }
};

// Create subscription
exports.createSubscription = async (req, res) => {
  try {
    const { name, cost, currency, frequency, categoryId, nextBillingDate, notes } = req.body;
    const userId = req.user.id;

    const result = await db.query(
      `INSERT INTO subscriptions 
        (user_id, name, cost, currency, frequency, category_id, next_billing_date, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [userId, name, cost, currency || 'USD', frequency, categoryId || null, nextBillingDate, notes || null]
    );

    const subscription = result.rows[0];

    // Fetch category name if exists
    let categoryData = null;
    if (subscription.category_id) {
      const catResult = await db.query(
        'SELECT id, name FROM categories WHERE id = $1',
        [subscription.category_id]
      );
      if (catResult.rows.length > 0) {
        categoryData = catResult.rows[0];
      }
    }

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        id: subscription.id,
        name: subscription.name,
        cost: parseFloat(subscription.cost),
        currency: subscription.currency,
        frequency: subscription.frequency,
        nextBillingDate: subscription.next_billing_date,
        notes: subscription.notes,
        isActive: subscription.is_active,
        category: categoryData,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    
    if (error.constraint === 'subscriptions_cost_check') {
      return res.status(400).json({
        success: false,
        message: 'Cost must be a positive number'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error creating subscription'
    });
  }
};

// Update subscription
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cost, currency, frequency, categoryId, nextBillingDate, notes, isActive } = req.body;
    const userId = req.user.id;

    // Check if subscription exists and belongs to user
    const checkResult = await db.query(
      'SELECT id FROM subscriptions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const result = await db.query(
      `UPDATE subscriptions 
       SET name = $1, cost = $2, currency = $3, frequency = $4, 
           category_id = $5, next_billing_date = $6, notes = $7, is_active = $8
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [name, cost, currency, frequency, categoryId || null, nextBillingDate, notes || null, isActive, id, userId]
    );

    const subscription = result.rows[0];

    // Fetch category name if exists
    let categoryData = null;
    if (subscription.category_id) {
      const catResult = await db.query(
        'SELECT id, name FROM categories WHERE id = $1',
        [subscription.category_id]
      );
      if (catResult.rows.length > 0) {
        categoryData = catResult.rows[0];
      }
    }

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        id: subscription.id,
        name: subscription.name,
        cost: parseFloat(subscription.cost),
        currency: subscription.currency,
        frequency: subscription.frequency,
        nextBillingDate: subscription.next_billing_date,
        notes: subscription.notes,
        isActive: subscription.is_active,
        category: categoryData,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at
      }
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    
    if (error.constraint === 'subscriptions_cost_check') {
      return res.status(400).json({
        success: false,
        message: 'Cost must be a positive number'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error updating subscription'
    });
  }
};

// Delete subscription
exports.deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'DELETE FROM subscriptions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting subscription'
    });
  }
};

// Get dashboard analytics
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all active subscriptions
    const subsResult = await db.query(
      `SELECT cost, frequency, currency 
       FROM subscriptions 
       WHERE user_id = $1 AND is_active = TRUE`,
      [userId]
    );

    let totalMonthly = 0;
    let totalYearly = 0;
    const currencyBreakdown = {};

    subsResult.rows.forEach(sub => {
      const monthly = calculateMonthlyCost(parseFloat(sub.cost), sub.frequency);
      const yearly = calculateYearlyCost(parseFloat(sub.cost), sub.frequency);

      totalMonthly += monthly;
      totalYearly += yearly;

      // Track by currency
      if (!currencyBreakdown[sub.currency]) {
        currencyBreakdown[sub.currency] = { monthly: 0, yearly: 0 };
      }
      currencyBreakdown[sub.currency].monthly += monthly;
      currencyBreakdown[sub.currency].yearly += yearly;
    });

    // Get subscriptions by category
    const categoryResult = await db.query(
      `SELECT 
        c.name as category_name,
        COUNT(s.id) as count,
        SUM(CASE 
          WHEN s.frequency = 'Monthly' THEN s.cost 
          WHEN s.frequency = 'Yearly' THEN s.cost / 12
          WHEN s.frequency = 'Weekly' THEN s.cost * 52 / 12
          WHEN s.frequency = 'Quarterly' THEN s.cost * 4 / 12
        END) as monthly_cost
      FROM subscriptions s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.user_id = $1 AND s.is_active = TRUE
      GROUP BY c.name`,
      [userId]
    );

    // Get upcoming renewals (next 30 days)
    const upcomingResult = await db.query(
      `SELECT 
        s.id, s.name, s.cost, s.currency, s.next_billing_date,
        c.name as category_name
      FROM subscriptions s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.user_id = $1 
        AND s.is_active = TRUE 
        AND s.next_billing_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
      ORDER BY s.next_billing_date ASC
      LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        totalMonthly: Math.round(totalMonthly * 100) / 100,
        totalYearly: Math.round(totalYearly * 100) / 100,
        totalSubscriptions: subsResult.rows.length,
        currencyBreakdown,
        categoryBreakdown: categoryResult.rows.map(cat => ({
          category: cat.category_name || 'Uncategorized',
          count: parseInt(cat.count),
          monthlyCost: Math.round(parseFloat(cat.monthly_cost || 0) * 100) / 100
        })),
        upcomingRenewals: upcomingResult.rows.map(sub => ({
          id: sub.id,
          name: sub.name,
          cost: parseFloat(sub.cost),
          currency: sub.currency,
          nextBillingDate: sub.next_billing_date,
          category: sub.category_name
        }))
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data'
    });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name FROM categories ORDER BY name ASC');

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories'
    });
  }
};