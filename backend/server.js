import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sequelize from './db.js';

import { adminRoute } from './routes/admin.route.js';
import { authRoute } from './routes/auth.route.js';
import { transactionRoute } from './routes/transaction.route.js';
import { trashRoute } from './routes/trash.route.js';
import { colorGameUserRoute } from './routes/colorGameUser.route.js';
import { liveMarketBetRoute } from './routes/liveMarketBet.route.js';
import { activeAdminRoute } from './routes/activeAdmin.route.js';
import { lotteryGameModule } from './routes/lotteryGame.route.js';

import './models/permissions.model.js';
import { SliderRoute } from './routes/slider.route.js';
import { AnnouncementRoute } from './routes/announcement.route.js';
import './models/creditRefs.model.js';
import './models/partnerships.model.js'

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env' });
}

console.log('Running in environment:', process.env.NODE_ENV);

dotenv.config();
const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = process.env.FRONTEND_URI.split(',');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.send('Production environment is running.');
  } else {
    res.send('Development environment is running.');
  }
});

adminRoute(app);
authRoute(app);
transactionRoute(app);
trashRoute(app);
colorGameUserRoute(app);
liveMarketBetRoute(app);
activeAdminRoute(app);
lotteryGameModule(app);
SliderRoute(app),
AnnouncementRoute(app)

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database & tables created!');
    app.listen(process.env.PORT, () => {
      console.log(`App is running on  - http://localhost:${process.env.PORT || 8000}`);
    });

    
  })
  .catch(err => {
    console.error('Unable to create tables:', err);
  });
  process.on('SIGINT', async () => {
    await sequelize.close();
    process.exit(0);
  });

