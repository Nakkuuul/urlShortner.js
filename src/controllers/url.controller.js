import urlModel from "../models/url.model.js";
import crypto from "crypto";
import env from "../config/env.js";

export async function shortenURL(req, res) {
  try {
    const token = req.headers.authorization;
    const { shortCode, originalUrl, expiry = null } = req.body || {};

    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: "Original URL is required",
      });
    }

    let finalShortCode;

    if (!shortCode) {
      do {
        finalShortCode = crypto.randomBytes(4).toString("hex");
      } while (await urlModel.findOne({ shortCode: finalShortCode }));
    } else {
      const findDuplicateShortCode = await urlModel.findOne({
        shortCode: shortCode,
      });

      if (findDuplicateShortCode) {
        return res.status(400).json({
          success: false,
          message: "Short code already exists",
        });
      }
      finalShortCode = shortCode;
    }

    await urlModel.create({
      shortCode: finalShortCode,
      originalUrl: originalUrl,
      expiresAt: expiry,
    });

    return res.status(201).json({
      success: true,
      message: "URL registered successfully",
      data: {
        shortURL: `${env.DOMAIN}/${finalShortCode}`,
        originalUrl: originalUrl,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
}
