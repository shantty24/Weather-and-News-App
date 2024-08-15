const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Create a transporter using the SMTP configuration

const mailSender = async (req, res, email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Change to your email service provider
    auth: {
      user: "yp65624@gmail.com", // Your email address
      pass: "wdnu lkto cbqy gcru", //Your email password or an application-specific password
    },
  });

  // Define the email message
  const mailOptions = {
    from: "yp65624@gmail.com", // Sender's email address
    to: email, // Recipient's email address
    subject: "Test Email", // Email subject
    text: otp,
    html: `<P>${otp}</P>`, // Email plain text body
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("maaa", email, error);
      return "404";
    } else {
      console.log("Sending the Mail");
      return "200";
    }
  });
};

//Register User
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, phone, otp } = req.body;
  if (!username || !email || !password || !phone) {
    res.status(404);
    throw new Error("all feilds are mandatory");
  }
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    console.log("400");
    throw new Error("user already registerd");
  }
  try {
    await mailSender(req, res, email, otp);
  } catch (error) {
    res.status(500).json({ error: "Failed to send email" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    phone,
  });

  if (user) {
    res
      .status(201)
      .json({ _id: user.id, email: user.email, phone: user.phone });
  } else {
    res.status(400);
    throw new Error("user not created");
  }

  res.json({ message: "register user" });
});

//Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(404);
    throw new Error("all feilds are mandatory");
  }
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const acessToken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "50m" }
    );

    res.status(200).json({ acessToken });
  } else {
    res.status(400);
    throw new Error("Credentials are incorrect");
  }
});

//@desc current user
//@route GET /api/users/current
//@acess private.

const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const updateUserIsAlive = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.isAlive = true; // Set isAlive to true

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "User is now alive", data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});
module.exports = {
  registerUser,
  loginUser,
  currentUser,
  mailSender,
  updateUserIsAlive,
};
