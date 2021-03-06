import Product from '../models/Product.js';
import APIError from '../errors/APIErrors.js';
import User from '../models/User.js';

// Get all products of user
export const getUserProducts = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  // Current user
  const currUser = await User.findById(req.user.id);

  // Check if user can access this route
  verifyAccess(currUser.role, userId, req.user.id);

  if (!user)
    throw APIError.notFound(`User with id of ${userId} does not exist`);

  // Retrieving products
  const products = await Product.find({ owner: userId }).sort({ name: 1 });

  res.status(200).json(products);
};

// Get product's info
export const getProduct = async (req, res) => {
  const { productId } = req.params;

  // Product info
  const product = await Product.findById(productId);

  if (!product)
    throw APIError.notFound(`Product with id ${productId} does not exist`);

  // Current user
  const currUser = await User.findById(req.user.id);

  // Check if user can access this route
  verifyAccess(currUser.role, product.owner, req.user.id);

  res.status(200).json(product);
};

// Create product
export const createProduct = async (req, res) => {
  // Set product owner to the current user
  req.body.owner = req.user.id;

  // Save product to db
  await Product.create(req.body);

  res.status(201).json({ message: 'Product Created' });
};

// Edit product
export const editProduct = async (req, res) => {
  const { productId } = req.params;

  // Product info
  const product = await Product.findById(productId);

  if (!product)
    throw APIError.notFound(`Product with id ${productId} does not exist`);

  // Current user
  const currUser = await User.findById(req.user.id);

  // Check if user can access this route
  verifyAccess(currUser.role, product.owner, req.user.id);

  await Product.findByIdAndUpdate(productId, req.body, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({ message: 'Product updated' });
};

// Delete product
export const deleteProduct = async (req, res) => {
  const { productId } = req.params;

  // Product info
  const product = await Product.findById(productId);

  if (!product)
    throw APIError.notFound(`Product with id ${productId} does not exist`);

  // Current user
  const currUser = await User.findById(req.user.id);

  // Check if user can access this route
  verifyAccess(currUser.role, product.owner, req.user.id);

  await Product.deleteOne({ _id: productId });

  res.status(200).json({ message: 'Product Deleted' });
};

// ## utils

// Verify if the current user is the owner or admin
export const verifyAccess = (role, userId, currId) => {
  if (role !== 'admin' && userId.toString() !== currId)
    throw APIError.forbiddden('Only the owner can access this route');
};
