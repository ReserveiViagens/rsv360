// Communication Routes — Templates

import { Router } from 'express';
import { z } from 'zod';
import { TemplatesService } from '../services';

const router = Router();

// Validation schemas
const createTemplateSchema = z.object({
  enterpriseId: z.string(),
  name: z.string().min(1),
  type: z.enum(['email', 'whatsapp', 'sms', 'push']),
  channel: z.enum(['email', 'whatsapp', 'sms', 'push']),
  subject: z.string().optional(),
  content: z.string().min(1),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().optional(),
  content: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const previewTemplateSchema = z.object({
  variables: z.record(z.string()),
});

// GET / - List templates
router.get('/', async (req, res) => {
  try {
    const enterpriseId = req.query.enterpriseId as string;
    const type = req.query.type as string;
    const channel = req.query.channel as string;
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const result = await TemplatesService.listTemplates({
      enterpriseId,
      type: type as any,
      channel: channel as any,
      search,
      page,
      limit,
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Templates list error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /:id - Get template by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const template = await TemplatesService.getTemplateById(id, enterpriseId);

    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    res.json({ success: true, template });
  } catch (error: any) {
    console.error('Templates get error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST / - Create template
router.post('/', async (req, res) => {
  try {
    const data = createTemplateSchema.parse(req.body);

    const result = await TemplatesService.createTemplate(data);

    if (result.success) {
      res.status(201).json({ success: true, template: result.template });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Templates create error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /:id - Update template
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;
    const data = updateTemplateSchema.parse(req.body);

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const result = await TemplatesService.updateTemplate(id, enterpriseId, data);

    if (result.success) {
      res.json({ success: true, template: result.template });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Templates update error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /:id/preview - Preview template
router.post('/:id/preview', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;
    const data = previewTemplateSchema.parse(req.body);

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const template = await TemplatesService.getTemplateById(id, enterpriseId);

    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    const rendered = await TemplatesService.renderTemplate(template, data.variables);

    res.json({
      success: true,
      template: template,
      rendered,
      variables: data.variables,
    });
  } catch (error: any) {
    console.error('Templates preview error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /:id/duplicate - Duplicate template
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;
    const newName = req.body.newName as string;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    if (!newName) {
      return res.status(400).json({ success: false, error: 'newName required' });
    }

    const result = await TemplatesService.duplicateTemplate(id, enterpriseId, newName);

    if (result.success) {
      res.status(201).json({ success: true, template: result.template });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Templates duplicate error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /:id - Delete template
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const result = await TemplatesService.deleteTemplate(id, enterpriseId);

    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Templates delete error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;