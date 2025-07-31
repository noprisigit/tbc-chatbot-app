import express, { Express } from 'express';
import apiRouter from './routes/api';
import webRouter from './routes/web';
import dotenv from 'dotenv';
import expressEjsLayouts from 'express-ejs-layouts';
import path from 'path';
import session from 'express-session';
import { errorHandler } from './middlewares/errorHandler';
import { httpLogger } from './middlewares/httpLogger';
import { runWhatsappService } from './services/whatsapp.service';
import { runRemindersSchedulerFromDB } from './jobs/reminder.job';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24, // 1 hari
  }
}));

// Custom middleware untuk membuat data user tersedia di semua view
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
})

// View Engine (EJS)
app.use(expressEjsLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Custom Middlewares
app.use(httpLogger);

// Routes
app.use('/api', apiRouter);
app.use('/', webRouter);

app.use(errorHandler);

runWhatsappService();
runRemindersSchedulerFromDB();

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
})
