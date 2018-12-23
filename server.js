var express = require('express');
var redis   = require("redis");
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var client  = redis.createClient();
var app = express();

// start redis server on mac
// redis-server /usr/local/etc/redis.conf

app.use(session({
    secret: 'my-sercret',
    // create new redis store.
    store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl :  260}),
    saveUninitialized: false,
    resave: false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/admin', (req, res) => {
    console.log('POST: /admin - user:', req.session.key);

    if(req.session.key) {
        // if key is sent allow the request
        res.status(200).send({message: 'admin page'});
    } else {
        res.status(500).send({error: 'you must be loggedin'});
    }
});

app.post('/login',(req, res) => {
    console.log('POST: /login - user:', req.body);
    
    // when user login set the key to redis.
    req.session.key = req.body.username;
    res.status(200).send({status: 'done'});
});

app.post('/logout', (req,res) => {
    console.log('POST: /logout - deleting user:', req.session.key)

    req.session.destroy((err) => {
        if(err){
            console.log(err);
            res.status(500).send({status: 'error'});
        } else {
            res.status(200).send({status: 'done'});
        }
    });
});

app.listen(3000,function(){
    console.log("App Started on PORT 3000");
});