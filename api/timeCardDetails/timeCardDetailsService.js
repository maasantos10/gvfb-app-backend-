const _ = require('lodash')
const TimeCardForm = require('../documentForm/timeCardForm')

const sendErrorsFromDB = (res, dbErrors) => {
  const errors = []
  _.forIn(dbErrors.errors, error => errors.push(error.message))
    return res.status(400).json({errors})
}

//Mais uma função middleware / se não usar os ultimos parametros podemos suprimir
// neste caso o next()

// assim que logar chamar essa função para carregar as informações sobre a lista de formulário
// que o funcionário já fez chamado.
function getFormDetailsByEmployee(req, res){

    const email = 'marcosalmeida1977@gmail.com' // req.body.email || 'marcosalmeida1977@gmail.com' || ''
    const password = req.body.password || ''

    TimeCardForm.find({email}, (err, result) => {
      if(err) {
        return sendErrorsFromDB(res, err)
        //res.status(500).json({errors: [error]})
      //} else if ( email === result.email) {
        //const { name, email } = user
        //res.json(result)
        //res.json({ name, email, token })
        //res.json(_.defaults(result[0], {credit: 0, debt: 0}))
      } else {
        res.json(result)
        //return res.status(400).send({errors: ['Usuário/Senha inválidos']})
      }
    })
}

function getSummaryFormByEmployee(req, res){
  // função aggregate do Mongoose

  const email = req.params.email
  //const email = 'bella@gmail.com' // req.body.email || 'bella@gmail.com' || ''
  //const email = 'esther@gmail.com' // req.body.email || 'esther@gmail.com' || ''

  console.log(email)

  TimeCardForm.aggregate([
  // pipeline de agregaçãop
  { $match: { email: email }
}, /*{
    $project: {typeForm: {$sum: "$typeForm"}}
  }, {
    $group: {_id: null, typeForm: {$sum: "$typeForm" }}
  }, {
    $project: {_id: 0, typeForm: 1}
  },*/ {
    $count: "myFormCount"
  }],
  function(error, result) {
    if(error){
      res.status(500).json({errors: [error]})
    } else {
      res.json(_.defaults(result[0]))
    }
  })
}

module.exports = { getFormDetailsByEmployee, getSummaryFormByEmployee }
