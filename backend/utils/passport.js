const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
require('dotenv').config();

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();
        let user = await User.findOne({ email });
        
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: email,
            avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
            isVerified: true,
            googleId: profile.id,
            authProvider: 'google'
          });
        } else {
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || "/api/auth/github/callback",
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
        if (!email) {
          return done(new Error("No email found from GitHub"), null);
        }
        email = email.toLowerCase();
        let user = await User.findOne({ email });
        
        if (!user) {
          user = await User.create({
            name: profile.displayName || profile.username,
            email: email,
            avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
            isVerified: true,
            githubId: profile.id,
            authProvider: 'github'
          });
        } else {
          if (!user.githubId) {
            user.githubId = profile.id;
            await user.save();
          }
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
}

module.exports = passport;
