const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en ${process.env.BACKEND_URL}`);
});