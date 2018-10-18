const express = require('express')
const auth = require('./auth') // usado para acessar a autenticação

module.exports = function(server){

  /*
  * Rotas abertas
  */
  const openApi = express.Router()
  server.use('/oapi', openApi)

  const AuthService = require('../api/user/authService')

  openApi.post('/login', AuthService.login)
  openApi.post('/signup', AuthService.signup)
  openApi.post('/validateToken', AuthService.validateToken)

  // just test. After tests I need to remove the code below
  //API Routes

  const router = express.Router()
  server.use('/api', router)

  // rotas da API
  const timeCardFormService = require('../api/documentForm/timeCardFormService')
  timeCardFormService.register(router, '/timeCards')

  const timeCardDetailsService = require('../api/timeCardDetails/timeCardDetailsService')
  router.route('/timeCardDetails/:email').get(timeCardDetailsService.getFormDetailsByEmployee)

  const timeCarServiceSummary = require('../api/timeCardDetails/timeCardDetailsService')
  router.route('/timeCardSummary/:email').get(timeCarServiceSummary.getSummaryFormByEmployee)

  const userService = require('../api/user/userService')
  userService.register(router, '/users')

  const formService = require('../api/form/formService')
  formService.register(router, '/forms')

  //blockchain
  const signDocumentBlockchain = require('../api/blockchain/blockchain')
  router.route('/signDocument').get(signDocumentBlockchain.signDocument)

  //dashboard
  const dashboardDataDetailByEmail = require('../api/dashboard/dashboardData')
  router.route('/formDetailsByEmail').get(dashboardDataDetailByEmail.getFormDetailsByEmail)

  const dashboardDataSummary = require('../api/dashboard/dashboardData')
  router.route('/summaryFormForSupervisor').get(dashboardDataSummary.getSummaryFormForSupervisor)

  const dashboardDataGroup = require('../api/dashboard/dashboardData')
  router.route('/groupHoursByEmployee').get(dashboardDataGroup.getGroupHoursByEmployee)

  // pdfmake
  const formPdf = require('../api/pdf/timeCard')
  router.route('/timeHourFormPdf/:id').get(formPdf.getPDFTimeHourForm)

  //send mail
  const sendMailPost = require('../api/mail/sendMail')
  router.route('/SendMail/:id').get(sendMailPost.postSendMail)
  
  /*******************************************************************************/
  /*
  * Rotas protegidas por Token JWT
  */
  /*
  const protectedApi = express.Router()
  server.use('/api', protectedApi)
  protectedApi.use(auth)

  const timeCardFormService = require('../api/documentForm/timeCardFormService')
  timeCardFormService.register(protectedApi, '/timeCards')

  const timeCardDetailsService = require('../api/timeCardDetails/timeCardDetailsService')
  protectedApi.route('/timeCardDetails/:email').get(timeCardDetailsService.getFormDetailsByEmployee)

  const timeCarServiceSummary = require('../api/timeCardDetails/timeCardDetailsService')
  protectedApi.route('/timeCardSummary/:email').get(timeCarServiceSummary.getSummaryFormByEmployee)

  const userService = require('../api/user/userService')
  userService.register(protectedApi, '/users')

  const formService = require('../api/form/formService')
  formService.register(protectedApi, '/forms')

  //blockchain
  const signDocumentBlockchain = require('../api/blockchain/blockchain')
  protectedApi.route('/signDocument').get(signDocumentBlockchain.signDocument)

  //dashboard
  const dashboardDataDetailByEmail = require('../api/dashboard/dashboardData')
  protectedApi.route('/formDetailsByEmail').get(dashboardDataDetailByEmail.getFormDetailsByEmail)

  const dashboardDataSummary = require('../api/dashboard/dashboardData')
  protectedApi.route('/summaryFormForSupervisor').get(dashboardDataSummary.getSummaryFormForSupervisor)

  const dashboardDataGroup = require('../api/dashboard/dashboardData')
  protectedApi.route('/groupHoursByEmployee').get(dashboardDataGroup.getGroupHoursByEmployee)

  // pdfmake
  const formPdf = require('../api/pdf/timeCard')
  protectedApi.route('/timeHourFormPdf/:id').get(formPdf.getPDFTimeHourForm)

  //send mail
  const sendMailPost = require('../api/mail/sendMail')
  protectedApi.route('/SendMail/:id').get(sendMailPost.postSendMail)
  */
}
