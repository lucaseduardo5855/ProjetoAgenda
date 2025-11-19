const mongoose = require('mongoose');
const validator = require('validator');

// O ESQUEMA (Schema)
const ContatoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  sobrenome: { type: String, required: false, default: '' },
  email: { type: String, required: false, default: '' },
  telefone: { type: String, required: false, default: '' },
  criadoEm: { type: Date, default: Date.now }, 
});

// O MODELO (Model)
const ContatoModel = mongoose.model('Contato', ContatoSchema);

// A CLASSE DE VALIDAÇÃO (Constructor Function)
// CORREÇÃO: O construtor precisa receber o 'body'
function Contato(body){
  this.body = body;
  this.errors = [];
  this.contato = null;
}



// Método para registrar
Contato.prototype.register = async function(){
  this.valida();
  if(this.errors.length > 0) return; // Se tiver erros, para aqui
  // Se passou na validação, cria o contato no DB
  this.contato = await ContatoModel.create(this.body);
}

// Método para validar os dados
Contato.prototype.valida = function(){
    this.cleanUp();
    
    // Validação dos campos
    // O email precisa ser valido (se existir)
    if(this.body.email && !validator.isEmail(this.body.email)) {
      this.errors.push('E-mail inválido');
    }
    // O nome é obrigatório
    if(!this.body.nome) {
      this.errors.push('Nome é um campo obrigatorio');
    }
    // CORREÇÃO: O typo 'his' foi corrigido para 'this'
    if(!this.body.email && !this.body.telefone){
      this.errors.push('Pelo menos um contato precisa ser enviado: E-mail ou Telefone');
    }

    // CORREÇÃO: A validação de 'password' (que era do Login) foi removida.
}

// Método para limpar os dados recebidos
Contato.prototype.cleanUp = function(){
    // Garante que todos os campos sejam strings
    for(const key in this.body){
      if(typeof this.body[key] !== 'string'){
        this.body[key] = '';
      }
    }

    // Garante que o objeto 'body' tenha APENAS os campos do Schema
    this.body = { 
      nome: this.body.nome,
      sobrenome: this.body.sobrenome,
      email: this.body.email,
      telefone: this.body.telefone,
    }
  };

  Contato.prototype.edit = async function(id){
    if(typeof id !== 'string') return;
    this.valida();
    if(this.errors.length > 0) return;
    this.contato = await ContatoModel.findByIdAndUpdate(id, this.body, {new: true});
  };

  //Métodos estáticos
  // Método para buscar um único contato pelo ID
Contato.buscaPorId = async function(id){
  if(typeof id !== 'string') return;
  const contato = await ContatoModel.findById(id);
  return contato;
};

  // Método para buscar Contatos em ordem crescente
Contato.buscaContatos = async function(){
  const contatos = await ContatoModel.find()
  .sort({ criadoEm: -1 })
  return contatos;
}

Contato.delete = async function(id){
  if(typeof id !== 'string') return;
  const contato = await ContatoModel.findByIdAndDelete({_id: id});
  return contato;
}

module.exports = Contato;