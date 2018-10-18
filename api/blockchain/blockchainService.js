const _ = require('lodash')
const BlockchainDAO = require('./blockchainDAO')

// Cria os métodos da API através do "node-restful" automaticamente.
// crud methods
BlockchainDAO.methods(['get', 'post', 'put', 'delete'])

BlockchainDAO.after('post', sendErrorsOrNext).after('put', sendErrorsOrNext)

function sendErrorsOrNext(req, res, next){
  const bundle = res.locals.bundle

  if(bundle.errors){
    var errors = parseErrors(bundle.errors)
    res.status(500).json({errors})
  } else {
    next()
  }
}

function parseErrors(nodeRestfulErrors) {
  const errors = []
  _.forIn(nodeRestfulErrors, error => errors.push(error.message))
  return errors
}

//Ao atualizar um registro ele irá retonar o registro atualizado na próxima consulta
BlockchainDAO.updateOptions({new: true, runValidators: true})

//(node:22004) DeprecationWarning: collection.count is deprecated, and will be
//removed in a future version. Use collection.countDocuments or
//collection.estimatedDocumentCount instead

BlockchainDAO.route('count', function(req, res, next){

  const email = 'marcosalmeida1977@gmail.com'
  //constole.log('req.params.email' + req.params.email)
  //email:marcosalmeida1977@gmail.com

  BlockchainDAO.aggregate([
  // pipeline de agregaçãop
  { $match: { email: email }
  },{
    $count: "value"
  }],
  function(error, result) {
    if(error){
      res.status(500).json({errors: [error]})
    } else {
      res.json(_.defaults(result[0]))
    }
  })

  /*
  TimeCardForm.countDocuments({email},function(error, value){
    if(error){
      res.status(500).json({errors: [error]})
    } else {
       res.json({value})
    }
  })
  */

})

module.exports = BlockchainDAO
