import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/user.routes.js';
import groupRouter from './routes/group.routes.js';
import expenseRouter from './routes/expense.routes.js';
import paymentRouter from './routes/payment.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

app.use((req, res, next) => {
  req.io = app.get('socketio'); 
  next();
});

// API Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/groups', groupRouter);
app.use('/api/v1/expenses', expenseRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/dashboard', dashboardRouter);

export { app };