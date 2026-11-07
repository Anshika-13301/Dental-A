/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} roles Allowed roles: 'SUPER_ADMIN', 'PRACTICE_ADMIN', 'STAFF_USER'
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role forbidden: ${req.user.role} does not have access to this resource`
      });
    }

    next();
  };
};

module.exports = { authorize };
