exports.getLogin = (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.session.admin) {
        return res.redirect('/');
    }
    res.render('auth/login', { error: null });
};

exports.postLogin = (req, res) => {
    const { username, password } = req.body;

    // Fixed credentials as requested
    if (username === 'admin' && password === 'admin123') {
        req.session.admin = username;
        return res.redirect('/');
    } else {
        return res.render('auth/login', { error: 'Invalid username or password' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/auth/login');
    });
};
