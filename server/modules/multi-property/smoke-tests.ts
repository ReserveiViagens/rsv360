import request from 'supertest';
const { createApp } = require('../../../backend/app.js');

async function run() {
  const app = await createApp();
  const results = {
    propertiesList: false,
    propertyCreate: false,
    propertyGet: false,
    propertyUpdate: false,
    propertyUsersList: false,
    propertyUsersAdd: false,
    propertyUsersUpdate: false,
    propertyStats: false,
    consolidated: false,
    crmTenant: false,
    housekeepingTenant: false,
    revenueTenant: false,
  };

  const list = await request(app).get('/api/properties');
  results.propertiesList = list.status === 200 && Array.isArray(list.body.data) && list.body.data.length >= 1;

  const created = await request(app).post('/api/properties').send({ name: 'Hotel Teste Multi', type: 'hotel', total_rooms: 12 });
  results.propertyCreate = created.status === 201 && Boolean(created.body.data?.id);
  const propertyId = created.body.data?.id;

  const fetched = await request(app).get(`/api/properties/${propertyId}`);
  results.propertyGet = fetched.status === 200 && fetched.body.data?.id === propertyId;

  const updated = await request(app).put(`/api/properties/${propertyId}`).send({ name: 'Hotel Teste Multi Atualizado' });
  results.propertyUpdate = updated.status === 200 && updated.body.data?.name === 'Hotel Teste Multi Atualizado';

  const usersList = await request(app).get(`/api/properties/${propertyId}/users`);
  results.propertyUsersList = usersList.status === 200 && Array.isArray(usersList.body.data);

  const userAdd = await request(app).post(`/api/properties/${propertyId}/users`).send({ userId: 2, role: 'manager' });
  results.propertyUsersAdd = userAdd.status === 201;
  const linkedUserId = userAdd.body.data?.user_id || 2;

  const userUpdate = await request(app).put(`/api/properties/${propertyId}/users/${linkedUserId}`).send({ role: 'admin' });
  results.propertyUsersUpdate = userUpdate.status === 200;

  const stats = await request(app).get(`/api/properties/${propertyId}/stats`);
  results.propertyStats = stats.status === 200;

  const consolidated = await request(app).get('/api/properties/consolidated');
  results.consolidated = consolidated.status === 200;

  const crmTenant = await request(app).get('/api/crm/guests').set('X-Property-Id', '1');
  results.crmTenant = crmTenant.status === 200;

  const housekeepingTenant = await request(app).get('/api/housekeeping/rooms').set('X-Property-Id', '1').set('X-User-Role', 'admin');
  results.housekeepingTenant = housekeepingTenant.status === 200;

  const revenueTenant = await request(app).get('/api/revenue/rules').set('X-Property-Id', '1');
  results.revenueTenant = revenueTenant.status === 200;

  console.log(JSON.stringify(results, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
