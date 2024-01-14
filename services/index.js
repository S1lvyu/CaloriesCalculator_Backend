const Diary = require("./schemas/diarySchema");
const Products = require("./schemas/productsSchema");
const User = require("./schemas/usersSchema");
const nanoid = require("nanoid");
const nodeMailer = require("nodemailer");
const moment = require("moment");
require("dotenv").config();
const { calculateCalories } = require("../utils/utils");

const getCalculatedCalories = async (
  height,
  age,
  currentWeight,
  desiredWeight,
  bloodType
) => {
  const caloriesIntake = calculateCalories(
    height,
    age,
    currentWeight,
    desiredWeight,
    bloodType
  );
  const notAllowedFood = await Products.find({
    [`groupBloodNotAllowed.${bloodType}`]: true,
  });
  return { caloriesIntake, notAllowedFood };
};

const createUser = async ({ email, password, name }) => {
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error("Email already in use");
    }

    const verificationToken = nanoid();

    const transporter = nodeMailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.OUTLOOK_EMAIL,
        pass: process.env.OUTLOOK_PASS,
      },
    });

    const mailOptions = {
      from: process.env.OUTLOOK_EMAIL,
      to: email,
      subject: "Email Verification",
      html: `<p>For account verification click on the following link<b><a  href="http://localhost:3000/api/verify/${verificationToken}">
              Click Here!
            </a>
          </b>
        </p>`,
    };
    transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    const newUser = new User({
      email,
      password,
      name,
      verificationToken: verificationToken,
    });
    newUser.setPassword(password);

    return await newUser.save();
  } catch (error) {
    throw error;
  }
};

const loginUser = async ({ email, password, token }) => {
  const user = await User.findOne({ email });

  if (!user || !user.validPassword(password)) {
    throw new Error("Wrong email or password");
  }
  if (!user.verify) {
    throw new Error("Before login you have to verify your email address");
  }
  user.setToken(token);
  await user.save();
  return user;
};

const findAccount = async (user) => {
  const result = await User.findOne({ email: user.email });
  return result;
};

const verifyEmail = async (verificationToken) => {
  const update = { verify: true, verificationToken: null };

  const result = await User.findOneAndUpdate(
    {
      verificationToken,
    },
    { $set: update },
    { new: true }
  );

  if (!result) throw new Error("User not found");
};

const resendVerifyEmail = async (email) => {
  const result = await User.findOne({ email });
  if (!result) throw new Error("User not found");
  const verificationToken = result.verificationToken;

  if (!verificationToken)
    throw new Error("Verification has already been passed");
  const transporter = nodeMailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.OUTLOOK_EMAIL,
      pass: process.env.OUTLOOK_PASS,
    },
  });

  const mailOptions = {
    from: process.env.OUTLOOK_EMAIL,
    to: email,
    subject: "Email Verification",
    html: `<p>For account verification click on the following link<b><a  href="http://localhost:3000/api/verify/${verificationToken}">
              Click Here!
            </a>
          </b>
        </p>`,
  };
  transporter.sendMail(mailOptions);
  console.log("Email sent successfully");
};

const getProducts = async (query) => {
  const result = await Products.find({
    title: { $regex: query, $options: "i" },
  });

  return result;
};

const createNextDayDiary = async (user, date) => {
  const lastDiary = await Diary.findOne({ user: user._id }).sort({ date: -1 });
  if (!lastDiary) {
    return;
  }
  const diary = new Diary({
    user: user._id,
    date: date,
    necessaryCalories: lastDiary ? lastDiary.necessaryCalories : 2200,
    consumedProducts: [],
    nonRecommendedFood: lastDiary?.nonRecommendedFood,
  });

  await diary.save();
  return diary;
};

const checkAndCreateDiary = async (user) => {
  const today = new Date();
  const currentDate = moment(today).format("DD.MM.YYYY");
  const existingDiary = await Diary.findOne({
    user: user._id,
    date: currentDate,
  });

  if (!existingDiary) {
    await createNextDayDiary(user, currentDate);
  }
};

const postUserInfo = async (
  user,
  date,
  height,
  age,
  currentWeight,
  desiredWeight,
  bloodType
) => {
  const currentDate = moment(new Date()).format("DD.MM.YYYY");

  if (date > currentDate) {
    throw new Error("Invalid date. Future dates are not allowed.");
  }
  const filter = { date };

  const data = await getCalculatedCalories(
    height,
    age,
    currentWeight,
    desiredWeight,
    bloodType
  );
  if (!data.caloriesIntake) {
    throw new Error("Data Validation Error! Try Again!");
  }
  const newDiaryEntry = {
    date,
    necessaryCalories: data.caloriesIntake,
    user: user._id,
    nonRecommendedFood: data.notAllowedFood,
  };
  const options = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  };

  const result = await Diary.findOneAndUpdate(filter, newDiaryEntry, options);

  result.remainingCalories = result.calculateRemainingCalories();
  result.percentageRemaining = result.calculatePercentageRemaining();
  await result.save();

  return result;
};

const addConsumedProducts = async (user, products, selectedDate) => {
  const diary = await Diary.findOne({ user: user._id, date: selectedDate });
  if (!diary) {
    throw new Error("Future dates are not allowed");
  }
  diary.consumedProducts.push(products);

  diary.calculateConsumedCalories();
  diary.remainingCalories = diary.calculateRemainingCalories();
  diary.percentageRemaining = diary.calculatePercentageRemaining();

  await diary.save();
  return diary;
};

const deleteProduct = async (user, id, selectedDate) => {
  const diary = await Diary.findOne({ user: user._id, date: selectedDate });

  if (!diary) {
    throw new Error("Firstly you have to calculate your daily calories intake");
  }

  diary.consumedProducts = diary.consumedProducts.filter(
    (item) => item.id !== id
  );

  diary.calculateConsumedCalories();
  diary.remainingCalories = diary.calculateRemainingCalories();
  diary.percentageRemaining = diary.calculatePercentageRemaining();

  await diary.save();
  return diary;
};

const getDiariesData = async (user) => {
  const diaries = await Diary.find({ user: user._id });
  return diaries;
};

module.exports = {
  getCalculatedCalories,
  createUser,
  loginUser,
  findAccount,
  verifyEmail,
  getProducts,
  checkAndCreateDiary,
  postUserInfo,
  addConsumedProducts,
  deleteProduct,
  getDiariesData,
  resendVerifyEmail,
};
