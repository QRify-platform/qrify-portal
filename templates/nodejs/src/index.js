const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: '{{SERVICE_NAME}}' });
});

app.get('/', (_req, res) => {
  res
    .status(200)
    .json({ service: '{{SERVICE_NAME}}', message: 'Scaffolded by QRify Portal' });
});

app.listen(port, () => {
  console.log(`{{SERVICE_NAME}} listening on ${port}`);
});
