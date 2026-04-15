import request from 'supertest';
const { createApp } = require('../../../backend/app.js');

async function run() {
  const app = await createApp();
  const results = {
    guestList: false,
    guestCreate: false,
    guestGet: false,
    guestSearch: false,
    loyaltyProgram: false,
    loyaltyEnroll: false,
    loyaltyEarn: false,
    loyaltyStatement: false,
    campaignsList: false,
    kpisDashboard: false,
  };

  const listGuests = await request(app).get('/api/crm/guests');
  results.guestList = listGuests.status === 200 && Array.isArray(listGuests.body.data?.data || listGuests.body.data);

  const createGuest = await request(app).post('/api/crm/guests').send({
    first_name: 'Teste',
    last_name: 'CRM',
    email: 'teste.crm@example.com',
    total_stays: 0,
    total_revenue: 0,
    average_daily_rate: 0,
  });
  results.guestCreate = createGuest.status === 201 && !!createGuest.body.data;

  const guestId = createGuest.body.data?.id;
  const getGuest = await request(app).get(`/api/crm/guests/${guestId}`);
  results.guestGet = getGuest.status === 200 && getGuest.body.data?.id === guestId;

  const search = await request(app).get('/api/crm/guests/search?q=Silva');
  results.guestSearch = search.status === 200;

  const program = await request(app).get('/api/crm/loyalty/program?userId=1');
  results.loyaltyProgram = program.status === 200;

  const enroll = await request(app).post('/api/crm/loyalty/members').send({ guestProfileId: guestId, userId: 1 });
  results.loyaltyEnroll = enroll.status === 201;
  const memberId = enroll.body.data?.id;

  const earn = await request(app).post(`/api/crm/loyalty/members/${memberId}/earn`).send({ amount: 150 });
  results.loyaltyEarn = earn.status === 200;

  const statement = await request(app).get(`/api/crm/loyalty/members/${memberId}/statement`);
  results.loyaltyStatement = statement.status === 200;

  const campaigns = await request(app).get('/api/crm/campaigns');
  results.campaignsList = campaigns.status === 200;

  const kpis = await request(app).get('/api/crm/kpis/dashboard');
  results.kpisDashboard = kpis.status === 200;

  console.log(JSON.stringify(results, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
