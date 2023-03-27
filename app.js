const express = require('express');
const routes = require('./routes/routes');
const usersRoutes = require('./routes/users-routes')


const app = express();
const port = 5000;

const cors = require('cors')

const db = require('./db/connect');


require('dotenv').config();

const startApp = async ()=>{
    try {
        await db(process.env.MONGO_URI);
        app.listen(port,()=>{
            console.log(`server listening to port ${port}`);
        })
    } catch (error) {
        console.log(error);
    }
}
app.use(cors());
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow_Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE');
    next();
});

startApp();
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('assets'));
app.use(express.static('upload'))
app.use('/api',routes);
app.use('/user', usersRoutes);
app.use('/', (req,res)=>{
    try {
        res.status(200).send('index');
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
})
