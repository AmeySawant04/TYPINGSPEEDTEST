const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const path = require("path");
const safeUserModel = require("./dbModels/safeUserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sentences = require("./sentences.js");
const { error } = require("console");
const { json } = require("stream/consumers");

const secret = "AmeySawant";

tryingAgain = false;

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

function numberEliminator(sentence) {
  return !/\d/.test(sentence);
}

async function addTestResult(email, testResult) {
  try {
    // Find the user by username
    let user = await safeUserModel.findOne({ email });

    if (!user) {
      console.log("User not found");
      return { success: false, message: "User not found" };
    }

    // Push the new test result into the `tests` array
    user.tests.push({
      testDate: new Date(), // Automatically add the current date
      wpm: testResult.wpm,
      accuracy: testResult.acc,
    });

    // Save the updated user document
    await user.save();

    console.log("Test added successfully");
    return { success: true, message: "Test added successfully" };
  } catch (error) {
    console.error("Error adding test:", error);
    return { success: false, message: "Internal Server Error" };
  }
}

app.get("/", async (req, res) => {
  if (req.cookies.token) {
    token = req.cookies.token;
    console.log(token);
    userData = {};
    try {
      let { email } = jwt.verify(req.cookies.token, secret);
      let user = await safeUserModel.findOne({ email });
      // console.log(user);
      tests = [];
      user.tests.forEach((test) => {
        tests.push({
          testDate: JSON.stringify(test.testDate).match(/\d{4}-\d{2}-\d{2}/)[0],
          wpm: test.wpm,
          accuracy: test.accuracy,
        });
      });

      userData = {
        username: user.username,
        email: user.email,
        tests: tests,
      };

      console.log("userData: ", userData);
      res.cookie("userData", JSON.stringify(userData), { maxAge: 900000 });
    } catch (e) {
      console.log(e);
      res.status(500).send({ status: "error occured: \n" + e });
    }
    res.render("index", { userData });
  } else {
    res.render("index", { userData: null });
  }
});

// app.post("/create", (req, res) => {
//   let { email, username, password } = req.body;

//   bcrypt.genSalt(10, function (err, salt) {
//     bcrypt.hash(password, salt, async function (err, hash) {
//       if (err) {
//         console.log(err);
//       } else {
//         await safeUserModel.create({
//           username,
//           email,
//           password: hash,
//           test: []
//         });
//       }
//     });
//   });

//   let token = jwt.sign(email, secret);
//   res.cookie("token", token);

//   res.redirect("/");
// });

app.post("/create", (req, res) => {
  let { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).send("All fields are required!");
  }

  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      console.log("Error generating salt:", err);
      return res.status(500).send("Server error");
    }

    bcrypt.hash(password, salt, async function (err, hash) {
      if (err) {
        console.log("Error hashing password:", err);
        return res.status(500).send("Server error");
      } else {
        try {
          await safeUserModel.create({
            username,
            email,
            password: hash,
            test: [],
          });

          let token = jwt.sign({ email }, secret, { expiresIn: "30d" });

          res.cookie("token", token, {
            httpOnly: true, // Prevents JavaScript access (XSS safe)
            sameSite: "Strict", // Prevents CSRF (can use 'Lax' or 'None' if needed)
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
          });

          res.redirect("/");
        } catch (dbError) {
          console.log("Database error:", dbError);
          res.status(500).send("Error saving user");
        }
      }
    });
  });
});

app.post("/newtest", async (req, res) => {
  try {
    let { email } = jwt.verify(req.cookies.token, secret);
    const { wpm, acc } = req.body; // Extract data from request
    const result = addTestResult(email, { wpm, acc });
    res.json(result);
  } catch (error) {
    console.error("Error saving test data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/verify", async (req, res) => {
  let { email, password } = req.body;

  try {
    user = await safeUserModel.findOne({ email });
    if (!user) {
      tryAgain = true;
      res.cookie("tryAgain", tryAgain);
      res.redirect("/login");
    }
  } catch (e) {
    console.log(e);
    res.status(503).json({
      error: "Error Occured. \nWhile searching for user. \nTry again later",
    });
  }

  try {
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) console.log(err);
      else if (result) {
        let token = jwt.sign({ email }, secret, { expiresIn: "30d" });

        res.cookie("token", token, {
          httpOnly: true, // Prevents JavaScript access (XSS safe)
          sameSite: "Strict", // Prevents CSRF (can use 'Lax' or 'None' if needed)
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
        });
        res.redirect("/test");
      } else {
        tryingAgain = true;
        res.redirect("/login");
      }
    });
  } catch (e) {
    console.log(e);
  }
});

app.get("/login", (req, res) => {
  if (req.cookies.tryAgain) {
    res.render("login", { tryAgain: true });
  } else {
    res.render("login", { tryAgain: false });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token", {
    path: "/", // <- Important!
    httpOnly: true,
    sameSite: "Strict",
  });

  res.clearCookie("userData", {
    path: "/", // Add this line to ensure it's deleted!
  });

  res.redirect("/");
});

app.get("/test", async (req, res) => {
  if (req.cookies.token) {
    token = req.cookies.token;
    console.log(token);
    userData = {};
    try {
      let { email } = jwt.verify(req.cookies.token, secret);
      let user = await safeUserModel.findOne({ email });
      console.log(user);
      userData = {
        username: user.username,
        email: user.email,
        tests: user.tests,
      };
    } catch (e) {
      console.error("Error saving test data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }

    res.render("testPage", { userData });
  } else {
    res.render("testPage", { userData: null });
  }
});

app.get("/testsentences/:size", async (req, res) => {
  size = Number(req.params.size);
  testwords = await sentences.fetchSentences(size);
  testwords = testwords.filter(numberEliminator);
  console.log(testwords);
  res.json(testwords);
});

app.get("/check-cookies", (req, res) => {
  console.log("cookies: ");
  console.log(req.cookies); // or req.headers.cookie
  res.send(200, { msg: "Check server logs" });
});

app.listen(3001, (req, res) => {
  console.log("Site is Live 3001...");
});
