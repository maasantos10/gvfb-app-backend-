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
function getFormDetailsByEmail(req, res){

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

function getSummaryFormForSupervisor(req, res){
  // função aggregate do Mongoose

  console.log(req.params.email)
  console.log('getGroupHoursByEmployee')

  const email = req.params.email

  TimeCardForm.aggregate([
  // pipeline de agregaçãop
  /*{ $match: { email: email }
}, */{
    $project: {totalHours: {$sum: "$totalHours"}, count : {$sum: 1}}
  }, {
    $group: {_id: null, totalHours: {$sum: "$totalHours" }, count: {$sum: 1 } }
  }, {
    $project: {_id: 0, totalHours: 1, count: 1}
  }],

  function(error, result) {
    if(error){
      res.status(500).json({errors: [error]})
    } else {
      res.json(_.defaults(result[0]))
    }
  })
}


function getGroupHoursByEmployee(req, res){
  // função aggregate do Mongoose
  console.log(req.params.email)
  console.log('getGroupHoursByEmployee')

  const email = req.params.email // req.param('email') || 'marcosalmeida1977@gmail.com' || ''
  //const email = 'bella@gmail.com' // req.body.email || 'bella@gmail.com' || ''
  //const email = 'esther@gmail.com' // req.body.email || 'esther@gmail.com' || ''

  TimeCardForm.aggregate([
  // pipeline de agregaçãop
  ////////////////////////////
  /*
  { $match: { email: email }
  }, {
    $match: { status: 'OPEN' }
  }, {
    $group: {_id: {email:"$email", employeeName:"$employeeName"}, count:{$sum:1}, totalHours: {$sum: "$totalHours"} }
  }, {
    $group: {_id: 1, count:{$sum:1} }
  },
  //{"$group" :
	//	{_id:{email:"$email",employeeName:"$employeeName",departmentName:"$departmentName"}, count:{$sum:1}, totalHours: {$sum: "$totalHours"}}
	//},
  {$sort:{"_id.employeeName":-1}}
  */
  ////////////////
  /*{
  $group: {
    _id: '$email',
   email : { $first: '$email' },
   employeeName : { $first: '$employeeName' },
   departmentName : { $first: '$departmentName' },
   status : { $first: '$status' },
   //city : { $first: '$city' },
   //area : { $first: '$area' },
   //address : { $first: '$address' },
   count: { $sum: 1 },
   totalHours: {$sum: "$totalHours"}
  }
 }*/
 //{ $match: { email: email }
 //},
 {
  //$group: {_id: {email:"$email", employeeName:"$employeeName",departmentName:"$departmentName"}
  $group: {_id: {email:"$email"}
  , count:{$sum:1}, totalHours: {$sum: "$totalHours"} }
 },{
  $sort:{"_id.employeeName":1}
},
  { $limit: 20 }
],

  function(error, result) {
    if(error){
      res.status(500).json({errors: [error]})
    } else {
      res.json(_.defaults(result))
    }
  })

}

module.exports = { getFormDetailsByEmail, getSummaryFormForSupervisor, getGroupHoursByEmployee }
