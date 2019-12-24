const express = require('express');
const hbs = require('express-handlebars');
const morgan = require('morgan');
const PORT = 3000;
const config = require('./config');

const db = {};

const session = require('express-session');
const passport = require('passport');
const GithubStrategy = require('passport-github').Strategy;

passport.use(new GithubStrategy(
    {
        ...config,
        passReqtoCallback: true
    },
    (req, accessToken, refreshToken, profile, done) => {
        profile.myusername = req.body.username
        console.info('accessToken: ', accessToken)
        console.info('refreshToken: ', refreshToken)
        console.info('profile: ', profile)
        // save to database
        db[profile.username] = accessToken;
        done(null, profile)
    }
));
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

const app = express();

app.use(morgan('tiny'));
app.use(express.urlencoded({extended: true}));
app.use(session({
    name: 'github_session',
    secret: 'TERCES',
    resave: true, saveUninitialized: true
}))

app.post('/register',
    passport.authenticate('github'))

app.post('/github/callback',
    passport.authenticate('github', {failureRedirect: '/error.html'}),
    (req, resp)=> {
        const username = req.body.username;
        resp.status(200).type('text/html').send(`<h1>Registered ${username}</h1>`)
    }
)

app.get('/repos', 
    (req, resp) => {
        const token = db[req.user.username]
        resp.status(200).type('text/html').send(`<h1>Done</h1>`)
    })
// app.post('/register',
//     (req, resp) => {
//         const username = req.body.username;
//         resp.status(200).type('text/html').send(`<h1>Registered ${username}</h1>`)
//     })

app.use(express.static(__dirname + 'public'));


app.listen(PORT, () => {
    console.info(`Application started on ${PORT} at ${new Date()}`)
})