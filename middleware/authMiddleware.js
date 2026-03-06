module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.session.admin) {
            return next();
        }
        res.redirect('/auth/login');
    },
    forwardAuthenticated: function (req, res, next) {
        if (!req.session.admin) {
            return next();
        }
        res.redirect('/');
    }
};
