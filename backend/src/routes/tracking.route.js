const express = require('express');
const crypto = require('crypto');
const { sendMetaServerEvent } = require('../../../server/modules/tracking/meta-capi.service');
const { sendTikTokServerEvent } = require('../../../server/modules/tracking/tiktok-events-api.service');

const router = express.Router();
const processedEvents = new Set();

router.post('/event', async (req, res) => {
  const eventName = req.body?.eventName || 'UnknownEvent';
  const eventId = req.body?.eventId || crypto.randomUUID();

  if (processedEvents.has(eventId)) {
    return res.status(200).json({
      success: true,
      deduplicated: true,
      eventId,
    });
  }

  processedEvents.add(eventId);

  const payload = {
    eventName,
    eventId,
    data: req.body?.data || {},
    pageUrl: req.body?.pageUrl || req.get('referer') || null,
    userAgent: req.body?.userAgent || req.get('user-agent') || null,
    propertyId: req.propertyId || 1,
  };

  try {
    await Promise.all([
      sendMetaServerEvent(payload),
      sendTikTokServerEvent(payload),
    ]);
  } catch (err) {
    console.warn('[TRACKING] dispatch failure:', err.message);
  }

  res.status(201).json({
    success: true,
    eventId,
    dispatched: true,
  });
});

module.exports = { trackingRouter: router };
