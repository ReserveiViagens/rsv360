const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const { db } = require("../config/database");
const logger = require("./logger");

/**
 * Generate 2FA secret for user
 */
const generateTwoFactorSecret = (userEmail, serviceName = "Onboarding RSV") => {
  const secret = speakeasy.generateSecret({
    name: userEmail,
    service: serviceName,
    length: 32,
  });

  return {
    secret: secret.base32,
    manualEntryKey: secret.base32,
    qrCodeUrl: secret.otpauth_url,
  };
};

/**
 * Generate QR Code for 2FA setup
 */
const generateQRCode = async (otpauthUrl) => {
  try {
    const qrCodeDataURL = await qrcode.toDataURL(otpauthUrl);
    return qrCodeDataURL;
  } catch (error) {
    logger.error("Error generating QR code:", error);
    throw error;
  }
};

/**
 * Verify 2FA token
 */
const verifyTwoFactorToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: token,
    window: 2, // Allow 2 time steps before/after current time
  });
};

/**
 * Generate backup codes for 2FA
 */
const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
};

/**
 * Enable 2FA for user
 */
const enableTwoFactor = async (userId, secret, backupCodes) => {
  try {
    await db("users")
      .where({ id: userId })
      .update({
        two_factor_enabled: true,
        two_factor_secret: secret,
        recovery_codes: JSON.stringify(backupCodes),
        updated_at: new Date(),
      });

    logger.info(`2FA enabled for user ID: ${userId}`);
    return true;
  } catch (error) {
    logger.error("Error enabling 2FA:", error);
    throw error;
  }
};

/**
 * Disable 2FA for user
 */
const disableTwoFactor = async (userId) => {
  try {
    await db("users").where({ id: userId }).update({
      two_factor_enabled: false,
      two_factor_secret: null,
      recovery_codes: null,
      updated_at: new Date(),
    });

    logger.info(`2FA disabled for user ID: ${userId}`);
    return true;
  } catch (error) {
    logger.error("Error disabling 2FA:", error);
    throw error;
  }
};

/**
 * Verify backup code
 */
const verifyBackupCode = async (userId, code) => {
  try {
    const user = await db("users")
      .where({ id: userId })
      .select("recovery_codes")
      .first();

    if (!user || !user.recovery_codes) {
      return false;
    }

    const backupCodes = JSON.parse(user.recovery_codes);
    const codeIndex = backupCodes.indexOf(code.toUpperCase());

    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1);

    await db("users")
      .where({ id: userId })
      .update({
        recovery_codes: JSON.stringify(backupCodes),
        updated_at: new Date(),
      });

    logger.info(`Backup code used for user ID: ${userId}`);
    return true;
  } catch (error) {
    logger.error("Error verifying backup code:", error);
    throw error;
  }
};

/**
 * Check if user has 2FA enabled
 */
const isTwoFactorEnabled = async (userId) => {
  try {
    const user = await db("users")
      .where({ id: userId })
      .select("two_factor_enabled")
      .first();

    return user ? user.two_factor_enabled : false;
  } catch (error) {
    logger.error("Error checking 2FA status:", error);
    return false;
  }
};

module.exports = {
  generateTwoFactorSecret,
  generateQRCode,
  verifyTwoFactorToken,
  generateBackupCodes,
  enableTwoFactor,
  disableTwoFactor,
  verifyBackupCode,
  isTwoFactorEnabled,
};
