const Contato = require('../models/contatoModel');

// Rota GET: Renderiza o formulário de "Criar novo contato"
exports.index = (req, res) => {
  // CORREÇÃO: O objeto { contato: {} } é o segundo argumento
  // da função res.render(), não uma linha de código separada.
  res.render('contato', { contato: {} });
};

// Rota POST: Registra um novo contato
exports.register = async (req, res) => {
  try {
    const contato = new Contato(req.body);
    await contato.register();

    // Bloco de ERRO (quando a validação do Model falha)
    if (contato.errors.length > 0) {
      req.flash('errors', contato.errors);
      req.session.save(() => res.redirect('/contato/index'));
      return;
    }

    // Bloco de SUCESSO
    req.flash('success', 'Contato registrado com sucesso!');
    // Redireciona para a página de EDIÇÃO do contato que acabou de ser criado
    req.session.save(() => res.redirect(`/contato/index/${contato.contato._id}`));
    return;
  } catch (e) {
    // Bloco de ERRO (quando o Model quebra ou o DB falha)
    console.log(e);
    return res.render('404');
  }
};

// Rota GET: Renderiza a página de EDIÇÃO de um contato existente
exports.editIndex = async function (req, res) {
  try {
    // 1. Verifica se o ID foi enviado na URL
    if (!req.params.id) return res.render('404');

    // 2. Busca o contato no DB (Esta função deve existir no seu Model)
    const contato = await Contato.buscaPorId(req.params.id);

    // 3. Se o contato não existir, retorna 404
    if (!contato) return res.render('404');

    // 4. Renderiza a mesma view 'contato.ejs', mas agora passando os dados
    res.render('contato', { contato }); // A view 'contato.ejs' recebe o contato
  } catch (e) {
    console.log(e);
    res.render('404');
  }
};


