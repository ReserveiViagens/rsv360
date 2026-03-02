const Joi = require("joi");

// Schema para validação de conteúdo do website
const websiteContentSchema = Joi.object({
  page_type: Joi.string()
    .valid("hotels", "promotions", "attractions", "tickets", "contact")
    .required()
    .messages({
      "any.only":
        "Tipo de página deve ser: hotels, promotions, attractions, tickets ou contact",
      "any.required": "Tipo de página é obrigatório",
    }),

  title: Joi.string().min(3).max(200).required().messages({
    "string.min": "Título deve ter pelo menos 3 caracteres",
    "string.max": "Título deve ter no máximo 200 caracteres",
    "any.required": "Título é obrigatório",
  }),

  description: Joi.string().min(10).max(2000).required().messages({
    "string.min": "Descrição deve ter pelo menos 10 caracteres",
    "string.max": "Descrição deve ter no máximo 2000 caracteres",
    "any.required": "Descrição é obrigatória",
  }),

  price: Joi.number().positive().allow(null).messages({
    "number.positive": "Preço deve ser um número positivo",
  }),

  original_price: Joi.number().positive().allow(null).messages({
    "number.positive": "Preço original deve ser um número positivo",
  }),

  discount: Joi.number().min(0).max(100).allow(null).messages({
    "number.min": "Desconto deve ser pelo menos 0%",
    "number.max": "Desconto deve ser no máximo 100%",
  }),

  stars: Joi.number().integer().min(1).max(5).allow(null).messages({
    "number.integer": "Estrelas deve ser um número inteiro",
    "number.min": "Estrelas deve ser pelo menos 1",
    "number.max": "Estrelas deve ser no máximo 5",
  }),

  location: Joi.string().min(3).max(100).allow(null).messages({
    "string.min": "Localização deve ter pelo menos 3 caracteres",
    "string.max": "Localização deve ter no máximo 100 caracteres",
  }),

  status: Joi.string().valid("active", "inactive").default("active").messages({
    "any.only": "Status deve ser: active ou inactive",
  }),

  images: Joi.array().items(Joi.string().uri()).default([]).messages({
    "array.base": "Imagens deve ser um array",
    "string.uri": "Cada imagem deve ser uma URL válida",
  }),

  features: Joi.array()
    .items(Joi.string().min(3).max(100))
    .default([])
    .messages({
      "array.base": "Características deve ser um array",
      "string.min": "Cada característica deve ter pelo menos 3 caracteres",
      "string.max": "Cada característica deve ter no máximo 100 caracteres",
    }),

  valid_until: Joi.date().greater("now").allow(null).messages({
    "date.greater": "Data de validade deve ser futura",
  }),

  metadata: Joi.object().allow(null).messages({
    "object.base": "Metadados deve ser um objeto",
  }),

  seo_data: Joi.object({
    meta_title: Joi.string().max(60).allow(null),
    meta_description: Joi.string().max(160).allow(null),
    meta_keywords: Joi.array().items(Joi.string()).allow(null),
  })
    .allow(null)
    .messages({
      "object.base": "Dados SEO deve ser um objeto",
    }),
});

// Schema para atualização (todos os campos opcionais)
const websiteContentUpdateSchema = websiteContentSchema.fork(
  Object.keys(websiteContentSchema.describe().keys),
  (schema) => schema.optional(),
);

// Função de validação
const validateWebsiteContent = (data, isUpdate = false) => {
  const schema = isUpdate ? websiteContentUpdateSchema : websiteContentSchema;
  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

// Schema para configurações do site
const websiteSettingsSchema = Joi.object({
  site_info: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    tagline: Joi.string().min(5).max(200).required(),
  }).required(),

  contact_info: Joi.object({
    phones: Joi.array()
      .items(Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/))
      .required(),
    email: Joi.string().email().required(),
    address: Joi.string().max(200).allow(null),
  }).required(),

  social_media: Joi.object({
    facebook: Joi.string().uri().allow(null),
    instagram: Joi.string().uri().allow(null),
    website: Joi.string().uri().allow(null),
  }).required(),
});

const validateWebsiteSettings = (data) => {
  return websiteSettingsSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

module.exports = {
  validateWebsiteContent,
  validateWebsiteSettings,
  websiteContentSchema,
  websiteSettingsSchema,
};
