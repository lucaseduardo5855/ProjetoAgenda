const Login = require('../models/LoginModel');
const { index } = require('./homeController');

exports.index = (req, res) => {
    if(req.session.user) return res.render('login-logado');
    res.render('login');
};

exports.register = async (req, res) => {
    try {
        const login = new Login(req.body);
        await login.register();

        if (login.errors.length > 0) {// flash messages se tiver erros
            req.flash('errors', login.errors);
            req.session.save(function () {
                return res.redirect('/login/index');
            });
            return;
        }

        req.flash('success', 'Seus dados foram cadastrados com sucesso.');
        req.session.save(function () {
            return res.redirect('/login/index');
        });
    } catch (e) {
        console.log(e);
        return res.render('404');
    }
};


exports.login = async (req, res) => {
    try {
        const login = new Login(req.body);// usando nossa classe de login
        await login.login();// pedindo para fazer o login

        if (login.errors.length > 0) {// se ocorrer algum erro ele da um flash message 
            req.flash('errors', login.errors);
            req.session.save(function () { // salva a session
                return res.redirect('/login/index'); //retorna 
            });
            return;
        } // se n tiver nenhum erro
 
        req.flash('success', 'Você logou no sistema.'); // se n tiver, msg de sucesso e retorna
        req.session.user = login.user;
        req.session.save(function () {
            return res.redirect('/login/index');
        });
    } catch (e) {
        console.log(e);
        return res.render('404');
    }
};


exports.logout = function(req, res) {
    req.session.destroy();
    res.redirect(index)
}






























