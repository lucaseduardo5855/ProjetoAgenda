// Middleware global que será executado em todas as requisições
exports.middlewareGlobal = (req, res, next) => {
    res.locals.errors = req.flash('errors'); // flash messages de erros
    res.locals.success = req.flash('success'); // flash messages de sucesso
    res.locals.user = req.session.user;
    next();
};

exports.outroMiddleware = (req, res, next) => {
    next();
}

exports.checkCsrfError = (err, req, res, next) => { //Qualquer erro que ocorreu na aplicação, ele cai aqui
    if(err) {
        return res.render('404');
    }
    next(); 
}

exports.csrfMiddleware = (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
}

exports.loginRequired = (req, res, next) => { //Valida se tem usuario logado
    if(!req.session.user) {
        req.flash('erros', 'Você precisa fazer login ');
        req.session.save(() => res.redirect('/'));
        return;
    }
    next();
};