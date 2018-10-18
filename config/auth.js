const jwt = require('jsonwebtoken')
const env = require('../.env')

// middleware
module.exports = (req, res, next) => {

  // CORS preflight request (Cross Origem)
  // requisição antes de chamar o que quer mandar, se chama preflight
  // requisição do tipo option e a resposta é quais são os métodos que
  // poderão serem consumidos
  if(req.method === 'OPTIONS') {
    next()
    console.log('token OPTIONS')
  } else {
    const token = req.body.token || req.query.token || req.headers['authorization']
    console.log('token token')
    if(!token) {
      return res.status(403).send({errors: ['No token provided.']})
    }
    console.log('token before jwt.verify')
    jwt.verify(token, env.authSecret, function(err, decoded) {
      console.log('token after jwt.verify')
      if(err) {
        console.log('token jwt.verify error ')
        return res.status(403).send({
          errors: ['Failed to authenticate token.']
        })
      } else {
        console.log('valid token')
        // req.decoded = decoded
        next()
      }
    })
  }
}
