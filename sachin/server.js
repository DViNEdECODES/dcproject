const express = require('express');
const app = express();
const port = process.env.PORT || 3002;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send(`<h2>Welcome to ${process.env.STAND_NAME}!</h2><a href="/">Back to main</a>`);
});

app.listen(port, () => {
    console.log(`${process.env.STAND_NAME} running on port ${port}`);
});
