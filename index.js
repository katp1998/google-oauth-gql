const express = require("express");
const session = require('express-session');
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");

// Configure Passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {

      done(null, profile);
    }
  )
);

// Serialize user object
passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  // Deserialize user object
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

// Set up authentication routes
const app = express();
app.use(
  session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  // Successful authentication, redirect or perform additional actions
  res.redirect('/profile');
});

// Define your GraphQL schema
const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

// Define your resolvers
const root = {
  hello: () => "Hello, world!",
};

// Set up the GraphQL endpoint
app.use(
    '/graphql',
    passport.authenticate('google', { session: false }), // Authenticate requests with Google OAuth
    graphqlHTTP((req, res) => ({
      schema: schema,
      rootValue: root,
      graphiql: true,
    }))
  );

// Start the server
app.listen(4000, () => {
  console.log("Server started on http://localhost:4000");
});
