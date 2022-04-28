import express from "express";
import handlebars from "express-handlebars";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
import User from "./models/User.js";
import bcrypt from "bcrypt";
import MongoStore from "connect-mongo";
import { Strategy as LocalStrategy } from "passport-local";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Using express
const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// Initializing handlebars
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

// Connecting MongoDB
const URL =
  "mongodb+srv://Diego:123@codercluster18335.oxenh.mongodb.net/passportDB?retryWrites=true&w=majority";
mongoose.connect(
  URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw new Error("Couldn't connect to db");
    console.log("db connected");
  }
);

// creating a session
const tenMins = 60 * 10;
app.use(
  session({
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://Diego:123@codercluster18335.oxenh.mongodb.net/passportDB?retryWrites=true&w=majority",
      ttl: tenMins,
    }),
    secret: "claveSecreta",
    resave: true,
    saveUninitialized: true,
  })
);

// Initializing passport
app.use(passport.initialize());
app.use(passport.session());

// Serializing user
passport.serializeUser((user, done) => {
  return done(null, user._id);
});

// Deserializing user
passport.deserializeUser((_id, done) => {
  User.findById(_id, (err, user) => {
    return done(err, user);
  });
});

// Setting passport Strategy
passport.use(
  "signup",
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    (req, username, password, done) => {
      User.findOne(
        {
          username: username,
        },
        (err, user) => {
          if (err) return done(err);
          if (user) res.redirect("/");
          const newUser = {
            name: req.body.name,
            username: username,
            password: createHash(password),
          };
          User.create(newUser, (err, userCreated) => {
            if (err) return done(err);
            return done(null, userCreated);
          });
        }
      );
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    (req, username, password, done) => {
      User.findOne(
        {
          username: username,
        },
        (err, user) => {
          if (err) return done(err);
          if (!user) return done(null, false);
          if (!bcrypt.compareSync(password, user.password)) {
            console.log("wrong password");
          } else {
            return done(null, user);
          }
        }
      );
    }
  )
);

// Crypting passwords
const createHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

// Authentication
const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect("/missingpermission");
  }
};

// ROUTES
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/missingpermission", (req, res) => {
  res.render("missingpermission");
});

app.get("/perfil", isAuth, (req, res) => {
  res.render("perfil");
});

app.get("/logout", isAuth, (req, res) => {
  res.render("logout");
});

app.post(
  "/signupForm",
  passport.authenticate("signup", {
    failureRedirect: "/signup",
  }),
  (req, res) => {
    res.redirect("/login");
  }
);

app.post(
  "/loginForm",
  passport.authenticate("login", {
    failureRedirect: "/login",
  }),
  async (req, res) => {
    req.session.isAuth = true;
    req.session.user = req.body;
    res.render("perfil", {
      userInfo: req.body.username,
    });
  }
);

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send({
        error: error,
      });
    } else {
      res.redirect("/");
    }
  });
  res.redirect("/signup");
});
