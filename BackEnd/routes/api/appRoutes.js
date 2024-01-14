const express = require("express");
const router = express.Router();
const controller = require("../../controllers/controllers");
const { auth } = require("../../middlewares/auth");

/**
 * @swagger
 * /api/:
 *   post:
 *     summary: Get the calculated calorie count
 *     description: Calculate the calorie count based on the provided user information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *                 description: User's current weight in kilograms
 *               height:
 *                 type: number
 *                 description: User's current height in centimeters
 *               age:
 *                 type: number
 *                 description: User's age
 *               desiredWeight:
 *                 type: number
 *                 description: User's desired weight
 *               bloodtype:
 *                 type: number
 *                 description: User's blood type (number from 1 to 4)
 *     responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         description: Error due to missing required fields or invalid types
 */

router.post("/", controller.getCalories);

/**
 * @swagger
 * /api/signup/:
 *   post:
 *     summary: Register an account
 *     description: Register a user account based on the provided information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *               name:
 *                 type: string
 *                 description: User's name
 *     responses:
 *       201:
 *         description: Success - User created
 *       400:
 *         description: Error due to missing required fields or invalid types
 *       409:
 *         description: Error - Email is already registered
 */
router.post("/signup", controller.createAccount);

/**
 * @swagger
 * /api/login/:
 *   post:
 *     summary: Authenticate an account
 *     description: Authenticate a user account based on the provided information and create a daily log for the current day if it doesn't exist.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Success - User authenticated
 *       401:
 *         description: Error - Incorrect email or password
 *       400:
 *         description: Error
 */

router.post("/login", controller.loginAccount);

/**
 * @swagger
 * /api/logout/:
 *   get:
 *     summary: Log out a user
 *     description: Log out a user based on the Bearer token in the Authorization header
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       204:
 *         description: Success - User logged out
 *       401:
 *         description: Error - Token is missing or invalid
 *       404:
 *         description: Error - User does not exist in the database
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.get("/logout", controller.logoutAccount);

/**
 * @swagger
 * /api/current-user/:
 *   get:
 *     summary: Retrieve the current user account
 *     description: Retrieve information about the current user based on the Bearer token in the Authorization header
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success - Retrieve information about the current user
 *       401:
 *         description: Error - Token is missing or invalid
 *       404:
 *         description: Error - User does not exist in the database
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.get("/current-user", auth, controller.getAccount);

/**
 * @swagger
 * /api/current-user/update/:
 *   patch:
 *     summary: Update the current user account
 *     description: Update the current user account based on the Bearer token in the Authorization header
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the user
 *     responses:
 *       200:
 *         description: Success - Updated information about the current user
 *       401:
 *         description: Error - Token is missing or invalid
 *       400:
 *         description: Error - New data for updating the user does not pass validation
 *       404:
 *         description: Error - User does not exist in the database
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.patch("/current-user/update", auth, controller.updateUser);

/**
 * @swagger
 * /api/homepage/:
 *   post:
 *     summary: Add data to the user's journal for the current day
 *     description: Add user data to the journal
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: Current date
 *               weight:
 *                 type: number
 *                 description: User's current weight in kilograms
 *               height:
 *                 type: number
 *                 description: User's current height in centimeters
 *               age:
 *                 type: number
 *                 description: User's age
 *               desiredWeight:
 *                 type: number
 *                 description: User's desired weight
 *               bloodtype:
 *                 type: number
 *                 description: User's blood type (number from 1 to 4)
 *     responses:
 *       201:
 *         description: Success - Created data in the journal
 *       404:
 *         description: Error - Unable to create data in the journal
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post("/homepage", auth, controller.postUserEntries);

/**
 * @swagger
 * /api/homepage/search:
 *   get:
 *     summary: Search for products
 *     description: Search for products based on user input
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: The text to search for
 *     responses:
 *       200:
 *         description: Success - Received data based on the search
 *       404:
 *         description: Error - Unable to retrieve data based on the search (no matching products found)
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.get("/homepage/search", auth, controller.getProduct);

/**
 * @swagger
 * /api/homepage/diary/add-product:
 *   put:
 *     summary: Add data to the user's journal for the selected date
 *     description: Add selected products to the user's journal
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SelectedDate:
 *                 type: string
 *                 description: Selected date
 *               products:
 *                 type: object
 *                 description: Selected product
 *     responses:
 *       201:
 *         description: Success - The selected products have been added to the journal successfully.
 *       404:
 *         description: Error - Unable to add selected products to the journal
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.put("/homepage/diary/add-product", auth, controller.addProducts);

/**
 * @swagger
 * /api/homepage/diary/remove/{productId}:
 *   delete:
 *     summary: Remove the selected product
 *     description: Remove the selected product from the specified date's journal
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the product you want to remove
 *     responses:
 *       200:
 *         description: Success - Removed the selected product
 *       404:
 *         description: Error - Unable to remove the selected product
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.delete(
  "/homepage/diary/remove/:productId",
  auth,
  controller.removeProduct
);

/**
 * @swagger
 * /api/homepage/diary:
 *   get:
 *     summary: Get journals
 *     description: Retrieve journals at the user level
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Success - Obtained journals successfully
 *       404:
 *         description: Error - Unable to obtain journals
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.get("/homepage/diary", auth, controller.getDiaries);

/**
 * @swagger
 * /api/verify/{verificationToken}:
 *   get:
 *     summary: Email Verification
 *     description: Verify the email address used during registration
 *     parameters:
 *       - in: path
 *         name: verificationToken
 *         schema:
 *           type: string
 *         required: true
 *         description: The verification token sent to the email address
 *     responses:
 *       200:
 *         description: Success - Email verification successful
 *       404:
 *         description: Error - Unable to verify the email address
 */

router.get("/verify/:verificationToken", controller.verifyEmailController);

/**
 * @swagger
 * /api/user/verify:
 *   post:
 *     summary: Resend Email Verification
 *     description: Resend the email verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email for which email verification is requested
 *     responses:
 *       200:
 *         description: Success - Email verification resent successfully
 *       400:
 *         description: Error - Unable to resend email verification
 */
router.post("/user/verify", controller.resendVerificationEmail);

module.exports = router;
