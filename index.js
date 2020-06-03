const express = require('express');
const app = express();

app.use(express.static(__dirname));

const PORT = process.env.PORT || 3002;
const server = app.listen(PORT, async function () {
    console.log('Server running on port', PORT);
});
