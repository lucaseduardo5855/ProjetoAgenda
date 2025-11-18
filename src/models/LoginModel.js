const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

const LoginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }
});

const LoginModel = mongoose.model('Login', LoginSchema);

// Model de Login
class Login{
  constructor(body){
    this.body = body;
    this.errors = []; // Se tiver erros de validação nao posso cadastrar no banco
    this.user = null;
  }

  async login(){
    this.valida();
    if(this.errors.length > 0) return; // Se for maior que 0, tem erros
    this.user = await LoginModel.findOne({email: this.body.email});

    if(!this.user) {// se o usuario existe, ok caso contrario ele n passa daq
      this.errors.push('Usuário não existe.');
      return;
    }

    if(!bcryptjs.compareSync(this.body.password, this.user.password)){ //Se for dirente o bcrypt ele da senha errada e n passa
      this.errors.push('Senha invalida!');
      this.user = null;
      return;
    }
  }

  async register(){
    this.valida();
    if(this.errors.length > 0) return; // Se for maior que 0, tem erros

    await this.userExists();

    const salt = bcryptjs.genSaltSync();// Gera um hash de senha
    this.body.password = bcryptjs.hashSync(this.body.password, salt);// Criptografa a senha


    this.user = await LoginModel.create(this.body); // se o usuario for criado, joga na variavel user
  }


  async userExists(){
    this.user  = await LoginModel.findOne({email: this.body.email});
    if(this.user) this.errors.push('Usuario já existe')
  }

  valida(){
    this.cleanUp();
    // Validação dos campos
    // O email precisa ser valido
    if(!validator.isEmail(this.body.email)) this.errors.push('E-mail inválido');

    // A senha precisa ter entre 3 e 50 caracteres
    if(this.body.password.length < 3 || this.body.password.length >= 50) {
      this.errors.push('A senha precisa ter entre 3 e 50 caracteres');
    }
}

  cleanUp(){// Se a chave do body nao for string, troca por string vazia
    for(const key in this.body){
      if(typeof this.body[key] !== 'string'){
        this.body[key] = '';
      }
    }


    this.body = { // Meu objeto vai ter somente os campos que eu quero
      email: this.body.email,
      password: this.body.password
    }
  }
}

module.exports = Login;                                                      