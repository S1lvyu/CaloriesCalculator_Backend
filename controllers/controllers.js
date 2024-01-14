const jwt = require("jsonwebtoken");
const {
  getCalculatedCalories,
  createUser,
  loginUser,
  findAccount,
  verifyEmail,
  getProducts,
  postUserInfo,
  addConsumedProducts,
  deleteProduct,
  checkAndCreateDiary,
  getDiariesData,
  resendVerifyEmail,
} = require("../services/index");

const secret = process.env.SECRET;

const getCalories = async (req, res, next) => {
  try {
    const { height, age, currentWeight, desiredWeight, bloodType } = req.body;
    if (!currentWeight || !height || !age || !desiredWeight || !bloodType) {
      throw new Error("Missing required fields");
    }
    const result = await getCalculatedCalories(
      height,
      age,
      currentWeight,
      desiredWeight,
      bloodType
    );
    res.status(200).json({
      status: "succes",
      code: 200,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      code: 400,
      message: error.message,
    });
  }
};

const createAccount = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      throw new Error("Missing required fields");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email address");
    }
    const result = await createUser({
      email,
      password,
      name,
    });

    res.status(201).json({
      status: "succes",
      code: 201,
      data: {
        user: {
          email: result.email,
          name: result.name,
        },
      },
    });
  } catch (error) {
    if (
      error.message === "Missing email or password" ||
      "Invalid email address"
    ) {
      res.status(400).json({
        status: 400,
        error: error.message,
      });
    } else {
      res.status(409).json({
        status: 409,
        error: "email in use",
      });
    }
  }
};

const loginAccount = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Missing email or password");
    }

    const payload = { email: email };

    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    const result = await loginUser({
      email,
      password,
      token,
    });
    await checkAndCreateDiary(result);
    const tokenExpiryTime = Date.now() + 60 * 60 * 1000;
    result.setToken(token);

    res.status(200).json({
      status: "succes",
      code: 200,
      data: {
        token: token,
        tokenValability: tokenExpiryTime,
        user: {
          email: result.email,
          name: result.name,
        },
      },
    });
  } catch (error) {
    if (error.message === "Wrong email or password") {
      res.status(401).json({
        status: 401,
        message: error.message,
      });
      return;
    }
    res.status(400).json({
      status: 400,
      error: error.message,
    });
  }
};

const logoutAccount = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ status: 401, message: "Not authorized" });
    }
    const token = authHeader.split(" ")[1];

    const decodedToken = jwt.verify(token, secret);

    const user = await findAccount(decodedToken);
    user.setToken(null);
    await user.save();
    if (user) {
      res.status(204).json({
        status: "success",
        code: 204,
      });
    } else {
      res.status(404).json({ status: "404", message: "User not found" });
    }
  } catch (error) {
    if (error.message === "invalid token") {
      res.status(401).json({ status: 401, message: error.message });
    }

    res.status(500).json({ status: "error", message: "Server error" });
  }
};

const getAccount = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ status: 401, message: "Not authorized" });
    }
    const token = authHeader.split(" ")[1];

    const user = jwt.verify(token, secret);

    const result = await findAccount({ email: user.email });

    if (result) {
      res.status(200).json({
        status: "success",
        code: 200,
        data: {
          email: result.email,
          name: result.name,
        },
      });
    } else {
      res.status(404).json({ status: "404", message: "User not found" });
    }
  } catch (error) {
    if (error.message === "invalid token") {
      res.status(401).json({ status: 401, message: "Not authorized" });
    }

    res.status(500).json({ status: "error", message: "Server error" });
  }
};

const verifyEmailController = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    await verifyEmail(verificationToken);

    res.status(200).json({ message: "Verification successful", code: 200 });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

const resendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;
  try {
    await resendVerifyEmail(email);
    res.status(200).json({
      status: 200,
      message: "Verification email sent",
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (name.length < 4) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Invalid name! Your name must contain at least 3 characters",
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ status: 401, message: "Not authorized" });
    }
    const token = authHeader.split(" ")[1];

    const decodedToken = jwt.verify(token, secret);

    const user = await findAccount(decodedToken);

    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "User not found",
      });
    }

    user.name = name;
    await user.save();

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        user: {
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: error.message,
    });
  }
};

const getProduct = async (req, res, next) => {
  try {
    const query = req.query.q;
    const result = await getProducts(query);

    res.status(200).json({
      status: "succes",
      code: 200,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      message: error.message,
    });
  }
};

const postUserEntries = async (req, res, next) => {
  try {
    const user = req.user;
    const { date, height, age, currentWeight, desiredWeight, bloodType } =
      req.body;

    const result = await postUserInfo(
      user,
      date,
      height,
      age,
      currentWeight,
      desiredWeight,
      bloodType
    );
    res.status(201).json({
      status: "succes",
      code: 201,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      message: error.message,
    });
  }
};

const addProducts = async (req, res, next) => {
  try {
    const user = req.user;

    const { selectedDate, products } = req.body;

    const result = await addConsumedProducts(user, products, selectedDate);

    res.status(201).json({
      status: "succes",
      code: 201,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      message: error.message,
    });
  }
};

const removeProduct = async (req, res, next) => {
  try {
    const user = req.user;
    const selectedDate = req.body.selectedDate;
    const id = req.params.productId;

    const result = await deleteProduct(user, id, selectedDate);
    res.status(200).json({
      status: "succes",
      code: 200,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      message: error.message,
    });
  }
};

const getDiaries = async (req, res, next) => {
  try {
    const user = req.user;
    const result = await getDiariesData(user);
    res.status(200).json({
      status: "succes",
      code: 200,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
      message: error.message,
    });
  }
};
module.exports = {
  getCalories,
  createAccount,
  loginAccount,
  logoutAccount,
  verifyEmailController,
  getAccount,
  updateUser,
  getProduct,
  postUserEntries,
  addProducts,
  removeProduct,
  getDiaries,
  resendVerificationEmail,
};
