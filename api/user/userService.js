const _ = require('lodash')
const UserEmployee = require('./user')

// Cria os métodos da API através do "node-restful" automaticamente.
// crud methods
UserEmployee.methods(['get', 'post', 'put', 'delete'])

//this service it is necessary to update information of user/employee
UserEmployee.after('post', sendErrorsOrNext).after('put', sendErrorsOrNext)

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
UserEmployee.updateOptions({new: true, runValidators: true})

//Criar uma nova rota para count
UserEmployee.route('count', function(req, res, next){

  UserEmployee.count(function(error, value){
    if(error){
      res.status(500).json({errors: [error]})
    } else {
       res.json({value})
    }
  })

})

module.exports = UserEmployee
