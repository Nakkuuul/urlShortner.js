import app from './src/app.js';
import env from './src/config/env.js';
import connectDB from './src/config/db.js'

connectDB();

app.listen(env.PORT, () => {
    console.log('Server is up and running on Port', env.PORT);
});
