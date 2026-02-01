require("dotenv").config();
const User = require("../models/user.model");
const Token = require("../models/token.model");
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const opts = {};
const jwt = require("jsonwebtoken");
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET || "dev_secret_change_me";

if (!process.env.SECRET) {
  console.warn("WARNING: SECRET is not set. Using an insecure development secret.");
}
if (!process.env.REFRESH_SECRET) {
  console.warn("WARNING: REFRESH_SECRET is not set. Token refresh may be insecure in development.");
}

passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User.findOne({ email: jwt_payload.email });

      if (user) {
        const refreshTokenFromDB = await Token.findOne({
          user: user._id,
        });

        if (!refreshTokenFromDB) {
          return done(null, false);
        }

        const refreshPayload = jwt.verify(
          refreshTokenFromDB.refreshToken,
          process.env.REFRESH_SECRET || "dev_refresh_secret_change_me"
        );

        if (refreshPayload.email !== jwt_payload.email) {
          return done(null, false);
        }

        const tokenExpiration = new Date(jwt_payload.exp * 1000);
        const now = new Date();
        const timeDifference = tokenExpiration.getTime() - now.getTime();

        if (timeDifference > 0 && timeDifference < 30 * 60 * 1000) {
          const payloadNew = {
            _id: user._id,
            email: user.email,
          };
          const newToken = jwt.sign(
            payloadNew,
            process.env.SECRET || "dev_secret_change_me",
            {
              expiresIn: "6h",
            }
          );

          return done(null, { user, newToken });
        }
        return done(null, { user });
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);
