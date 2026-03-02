/**
 * Hotel Validator
 * Purpose: Validation schemas for hotel-related operations
 * Author: RSV 360 Integration
 * Date: 2025-01-30
 */

const Joi = require("joi");

const validateHotel = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(255),
    description: Joi.string().optional().max(1000),
    address: Joi.string().required().max(500),
    city: Joi.string().required().max(100),
    state: Joi.string().required().max(100),
    country: Joi.string().required().max(100),
    rating: Joi.number().min(1).max(5).optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    contact_info: Joi.object().optional(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
  }

  req.validatedData = value;
  next();
};

const validateBooking = (req, res, next) => {
  const schema = Joi.object({
    hotel_id: Joi.number().integer().positive().required(),
    customer_id: Joi.number().integer().positive().required(),
    check_in: Joi.date().iso().required(),
    check_out: Joi.date().iso().greater(Joi.ref("check_in")).required(),
    guests: Joi.number().integer().min(1).max(20).required(),
    room_type: Joi.string().required(),
    special_requests: Joi.string().optional().max(1000),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
  }

  req.validatedData = value;
  next();
};

module.exports = {
  validateHotel,
  validateBooking,
};
