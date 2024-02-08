const httpStatus = require("http-status");
const { Cart, Product, User } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  const { email } = user;
  const cart = await Cart.findOne({ email });

  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  } 
  else {
    return cart;
  }
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  

  const { email } = user;
  let cart = await Cart.findOne({ email });
  const product = await Product.findById(productId);

  if (!cart) {
    try {
      // cart = await Cart.create({ email: user.email, cartItems: [] });
      // throw new ApiError(
      //   httpStatus.INTERNAL_SERVER_ERROR,
      //   "Internal Server Error"
      // );

      const newCartDocument = Cart({
        email: user.email,
        cartItems: [],
      });
      cart= await newCartDocument.save();
    } catch (error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }

 

  const existingCartItem = cart.cartItems.find(
    (item) => item.product._id == productId
  );

  if (existingCartItem) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product already in cart. Use the cart sidebar to update or remove product from cart"
    );
  }

  if (!product) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product doesn't exist in database"
    );
  }

  const cartItem = { product: product, quantity: quantity };

  cart.cartItems.push(cartItem);

  await cart.save();

  return cart;
};

// Return Format :
// * {
//   *  "_id": "5f82eebd2b11f6979231653f",
//   *  "email": "crio-user@gmail.com",
//   *  "cartItems": [
//   *      {
//   *          "_id": "5f8feede75b0cc037b1bce9d",
//   *          "product": {
//   *              "_id": "5f71c1ca04c69a5874e9fd45",
//   *              "name": "ball",
//   *              "category": "Sports",
//   *              "rating": 5,
//   *              "cost": 20,
//   *              "image": "google.com",
//   *              "__v": 0
//   *          },
//   *          "quantity": 2
//   *      }
//   *  ],
//   *  "paymentOption": "PAYMENT_OPTION_DEFAULT",
//   *  "__v": 33
//   * }

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  const { email } = user;

  const userCart = await Cart.findOne({ email });
  if (!userCart) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User does not have a cart. Use POST to create cart and add a product"
    );
  }
  console.log(userCart);
  const cartItemIndex = userCart.cartItems.findIndex(
    ({ product }) => product._id == productId
  );
  console.log(cartItemIndex);
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product doesn't exist in database"
    );
  }

  if (cartItemIndex < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }

  userCart.cartItems[cartItemIndex].quantity = quantity;

  await userCart.save();

  return userCart;
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  const { email } = user;

  const userCart = await Cart.findOne({ email });
  if (!userCart) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
  }

  const cartItemIndex = userCart.cartItems.findIndex(
    ({ product }) => product._id == productId
  );

  if (cartItemIndex < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }

  userCart.cartItems.splice(cartItemIndex, 1);

  await userCart.save();

  console.log(userCart);
  return userCart;
};

// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {
  const {email} = user;
  const cart = await Cart.findOne({email})
  
  //test1
  if(!cart){
      throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart")

  }
  

  //test2
  if(cart.cartItems.length==0){
      throw new ApiError(httpStatus.BAD_REQUEST,"Cart is empty")
  }
 
 //test3
 let hasSetNonDefaultAddress = await user.hasSetNonDefaultAddress() 
 if(!hasSetNonDefaultAddress){
  throw new ApiError(httpStatus.BAD_REQUEST,"Address not set")
 }


 //test 4
 let total=0;
 for(let i=0;i<cart.cartItems.length;i++){
  total += cart.cartItems[i].product.cost * cart.cartItems[i].quantity;

 }

 if(total >user.walletMoney){
  throw new ApiError(httpStatus.BAD_REQUEST,"Insufficient money to checkout")
 }

 user.walletMoney-=total;
 await user.save()

 cart.cartItems= [];

 cart.save()






};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
