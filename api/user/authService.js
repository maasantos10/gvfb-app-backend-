const _ = require('lodash')
const jwt = require('jsonwebtoken') // token
const bcrypt = require('bcrypt') // criptografar a senha
const User = require('./user')
const env = require('../../.env')

// validar formato do email
const emailRegex = /\S+@\S+\.\S+/ // String, com @, com String, com ponto com uma string
//validar senha com
// essa senha precisa ter letras minísculas [a-z]
// letras maísculas [A-Z]
// caracter especial [@#$%]
// precisa ter um tamanho entre 6 e 12 {6,12}
const passwordRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,12})/

const sendErrorsFromDB = (res, dbErrors) => {
  const errors = []
  _.forIn(dbErrors.errors, error => errors.push(error.message))
    return res.status(400).json({errors})
}

const login = (req, res, next) => {
  const email = req.body.email || ''
  const password = req.body.password || ''

  //precisa colocar "https" na aplicação caso contrário as informações
  // por exemplo de e-mail e senha ficam expostas do browser até o
  // servidor. aplicativos como wireshark para fazer sniffer na rede
  // podem capturar as informações.
  // qualquer monitor de rede pode capturar a senha.
  // não basta apenas colocar autenticação precisa colocar segurança.

  User.findOne({email}, (err, user) => {
    if(err) {
      return sendErrorsFromDB(res, err)
    } else if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(user, env.authSecret, {
        //expiresIn: "1 day"
        expiresIn: "4 hours"
      })

      const { employee, email, nameUser, codDept, departmentName, employeeType } = user

      res.json({ employee, email, nameUser, codDept, departmentName, employeeType, token }) //ajuste feito para passar os dados do usuário
    } else {
      return res.status(400).send({errors: ['Usuário/Senha inválidos']})
    }
  })
}

// middleware para validar o jsonwebtoken
// vamos armazenar no local storage do browser.
// vamos armazenar por um dia o token, por exemplo validar quando fechar e abrir
// o browser e assim por diante.
const validateToken = (req, res, next) => {
  const token = req.body.token || '' // token e se não vier nada passa vazio
  jwt.verify(token, env.authSecret, function(err, decoded) {
    return res.status(200).send({valid: !err})
  })
}

// método para signup
const signup = (req, res, next) => {

  console.log(req.body.nameUser)
  console.log(req.body.employee)
  console.log(req.body.email)
  console.log(req.body.confirm_password)
  console.log(req.body.employeeType)
  console.log(req.body.codDept)
  console.log(req.body.departmentName)

  const nameUser = req.body.nameUser
  const employee = req.body.employee
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirm_password
  var employeeType =  req.body.employeeType
  const codDept = req.body.codDept
  const departmentName = req.body.departmentName

  employeeType = employeeType.toUpperCase()

  console.log(employeeType)

  //validação do formato do email
  if(!email.match(emailRegex)) {
    return res.status(400).send({errors: ['something is wrong with email, please fix it and try again']})
  }

  //validação da senha
  if(!password.match(passwordRegex)) {
    return res.status(400).send({errors: [
      "password needs to have: a capital letter, a lowercase letter, a number, a special character(@#$%) and minimum 6 and maximum 12."
    ]})
  }

  // salt ou sabor
  const salt = bcrypt.genSaltSync() // randomico, mesmo passando a mesma senha em times diferentes ele irá gerar um outro valor.
  // o bcrypt usa o sabor acim para gerar o hash da senha, conforme abaixo:
  const passwordHash = bcrypt.hashSync(password, salt)
  if(!bcrypt.compareSync(confirmPassword, passwordHash)) {
    return res.status(400).send({errors: ['Password does not.']})
  }

  //employee type validation

  if(employeeType === 'SUPERVISOR') {
    null
  } else if (employeeType === 'EMPLOYEE') {
    null
  } else {
    return res.status(400).send({errors: ['Employee type is different of Employee or Supervisor ']})
  }

  if(employeeType === '') {
    return res.status(400).send({errors: ['Employee type can not be empty ']})
  }

  //Cod Department
  if(codDept === '') {
    return res.status(400).send({errors: ['Cod department can not be empty']})
  }

  //Name Department
  if(departmentName ==='') {
    return res.status(400).send({errors: ['Department Name can not be empty']})
  }

  User.findOne({email}, (err, user) => {
    if(err) {
      return sendErrorsFromDB(res, err)
    } else if (user) {
      return res.status(400).send({errors: ['User has already exist.']})
    } else {
      const newUser = new User({ nameUser, employee, email, password: passwordHash
                               , employeeType, codDept: codDept, departmentName: departmentName })
      newUser.save(err => {
        if(err) {
          return sendErrorsFromDB(res, err)
        } else {
          login(req, res, next)
        }
      })
    }
  })
}

module.exports = { login, signup, validateToken }
