import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const geenrateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating the");
  }
};

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
  const avatar = await uploadOnCloudinary(avatarAddPath);
  const coverImage = await uploadOnCloudinary(coverImageAdddPath);

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

const loginUser = asyncHandler(async (req, res) => {
  //
  const { email, username, password } = req.body;

  if (!(password || username)) {
    throw new ApiError(400, "email field required");
  }

  //
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exists");
  }

  //
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password Incorrect");
  }

  //
  const { accessToken, refreshToken } = await geenrateAccessAndRefreshToken(
    user._id
  );

  //
  const loggedInUser = User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }),
      "User Logged in Successfully"
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly:true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json( new ApiResponse(200, {}, "User LoggedOut" ))


});

export { registerUser, loginUser, logoutUser };
