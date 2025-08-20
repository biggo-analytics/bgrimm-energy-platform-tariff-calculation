/**
 * Health Controller
 * Handles health check and info endpoints
 */

const getInfo = async (ctx) => {
  ctx.body = {
    projectName: "Koa Electricity Bill API",
    version: "1.0.0",
    framework: "Koa.js"
  };
};

module.exports = {
  getInfo
};
