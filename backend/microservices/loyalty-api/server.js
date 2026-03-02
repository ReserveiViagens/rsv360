const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 6030;
const NAME = "loyalty-api";

app.get('/health', (req, res) => {
  res.json({ service: NAME, status: 'healthy', port: PORT });
});

app.get('/', (req, res) => {
  res.json({ message: `Microservice ${NAME} active`, service: NAME });
});

app.post('/api/data', (req, res) => {
  res.json({ service: NAME, received: req.body, timestamp: new Date() });
});

app.listen(PORT, () => console.log(`Microservice ${NAME} listening on ${PORT}`));
