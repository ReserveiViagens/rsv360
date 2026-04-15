process.env.NODE_ENV = 'test';
process.env.PAYMENT_PROVIDER = 'mercadopago';
process.env.SUBSCRIPTION_PROVIDER = 'mercadopago';
process.env.PIX_PROVIDER = 'mercadopago';
process.env.MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'test-token';

jest.mock(
  'nodemailer',
  () => ({
    createTransport: jest.fn(() => ({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-message-id' }),
    })),
  }),
  { virtual: true }
);

jest.mock(
  'twilio',
  () =>
    jest.fn(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({ sid: 'mock-twilio-sid' }),
      },
    })),
  { virtual: true }
);

jest.mock(
  '@aws-sdk/client-s3',
  () => ({
    S3Client: jest.fn(),
    PutObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
  }),
  { virtual: true }
);
