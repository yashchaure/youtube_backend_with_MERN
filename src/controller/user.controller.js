import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, password, email } = req.body;

  //=====
  if (
    [username, fullName, password, email].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field are required !!!");
  }

  //======
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User not found with this email");
  }

  //======
  const avatarAddPath = req.files?.avatar[0]?.path;

  let coverImageAdddPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageAdddPath = req.files.coverImage[0].path;
  }

  if (!avatarAddPath) {
    throw new ApiError(400, "Avatar Image required");
  }
  //======
  const avatar = await uploadOnCloudinary(avatarAddPath)
  const coverImage = await uploadOnCloudinary(coverImageAdddPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar file required");
  }

  //=========
  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

export { registerUser };
