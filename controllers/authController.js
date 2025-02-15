import User from "../models/User.js";
import Token from "../models/Token.js";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  UnauthenticatedError,
} from "../errors/customErrors.js";
import { randomBytes } from "crypto";

import {
  hashString,
  sendResetPasswordEmail,
  sendVerificationEmail,
  createTokenUser,
  attachCookiesToResponse,
} from "../utils/index.js";
import { comparePassword, hashPassword } from "../utils/passwordUtils.js";

export const register = async (req, res) => {
  const { email, name,phoneNumber,street,postalCode,city,state,country} = req.body;

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments()) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const hashedPassword = await hashPassword(req.body.password);

  const verificationToken = randomBytes(40).toString("hex");

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    verificationToken,
    phoneNumber,
    street,
    postalCode,
    city,
    state,
    country
    
  });

  const origin = "https://treknest.onrender.com";


  const tempOrigin = req.get('origin');
  const protocol = req.protocol;
  const host = req.get('host');
  const forwardedHost = req.get('x-forwarded-host');
  const forwardedProtocol = req.get('x-forwarded-proto');

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });
  // send verification token back only while testing in postman!!!
  res.status(StatusCodes.CREATED).json({
    msg: "Registration successful!",
  });
};

export const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("Verification Failed");
  }

  if (user.verificationToken !== verificationToken) {
    throw new UnauthenticatedError("Verification Failed");
  }

  (user.isVerified = true), (user.verified = Date.now());
  user.verificationToken = "";

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Email Verified" });
};

export const login = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await comparePassword(
    req.body.password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  if (!user.isVerified) {
    throw new UnauthenticatedError("Please verify your email");
  }
  const tokenUser = createTokenUser(user);

  // create refresh token
  let refreshToken = "";
  // check for existing token
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new UnauthenticatedError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

export const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("Please provide valid email");
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = randomBytes(70).toString("hex");
    // send email
    const origin = "http://localhost:3000";
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = hashString(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: "Please check your email for reset password link" });
};

export const resetPassword = async (req, res) => {
  const { token, email, newPassword } = req.body;

  const user = await User.findOne({ email });
  const hashedPassword = await hashPassword(req.body.newPassword);

  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === hashString(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = hashedPassword;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }

  res.send("Password reset successfully!");
};
