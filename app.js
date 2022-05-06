const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const app = express();

app.set("port", process.env.PORT || 8050);

let fakeUser = {
  username: "test@test.com",
  password: "1234",
};

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("passportExample"));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "passportExample",
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

/** passport 미들웨어 */
app.use(passport.initialize()); // passport 초기화
app.use(passport.session());

// 세션처리 - 로그인에 성공했을 경우 딱 한번 호출되어 사용자와 식별자를 session에 저장
passport.serializeUser((user, done) => {
  console.log("serializeUser");
  done(null, user.username);
});

// 세션처리 - 로그인 후 페이지 방문마다 사용자의 실제 데이터 주입
passport.deserializeUser((id, done) => {
  console.log("deserializeUser", id);
  done(null, fakeUser);
});
passport.use(
  new LocalStrategy((username, password, done) => {
    if (username === fakeUser.username) {
      if (password === fakeUser.password) {
        return done(null, fakeUser);
      } else {
        return done(null, false, { message: "password incorrect" });
      }
    } else {
      return done(null, false, { message: "username incorrect" });
    }
  })
);

app.get("/", (req, res) => {
  //return res.sendFile(process.cwd() + "/index.html");
  if (!req.user) {
    //아직 로그인 하지 않았을때
    res.sendFile(__dirname + "/index.html");
    console.log(res.message ?? "");
    const html = `
    <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <form action="/login" method="post">
                <div>
                    <label>Username</label>
                    <input type="text" name="username"/>
                </div>
                <div>
                    <label>Password</label>
                    <input type="password" name="password"/>
                </div>
                <div>
                    <input type="submit" value="Log in"/>
                </div>

            </form>
        </body>
    </html>
    `;
  } else {
    // 로그인 성공시 세션에 req.user 저장
    const user = req.user.username;
    const html = `
    <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <p>${user}님 안녕하세요!</p>
            <button type="button" onclick="location.href='/logout'">Log out</button>
        </body>
    `;
    res.send(html);
  }
});

/**passport Login: strategy-local */
/**Authenticate Requests */
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
  }),
  (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <p>로그인에 성공하셨습니다!</p>
        <a href="/">home</a>
    </body>
    `;
    res.send(html);
  }
);

app.get("/logout", (req, res) => {
  req.session.destroy();
  return res.redirect("/");
});

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 해당 주소가 없습니다`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "development" ? err : {};
  res.status(err.status || 500);
  res.send("error Occurred");
});

app.listen(app.get("port"), () => {
  console.log(`http://localhost:${process.env.PORT || 8050}`);
});
