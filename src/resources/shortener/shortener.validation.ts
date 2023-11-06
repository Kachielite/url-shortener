import Joi from "joi";

const generate = Joi.object({
  short_url: Joi.string(),
  long_url: Joi.string().required(),
});

const customize = Joi.object({
  custom_code: Joi.string(),
  long_url: Joi.string().required(),
});

export default { generate, customize };
