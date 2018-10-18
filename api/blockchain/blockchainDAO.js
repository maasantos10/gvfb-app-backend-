const restful = require('node-restful')
const mongoose = restful.mongoose

const blockhainSignatureSchema = new mongoose.Schema({
  index: { type: Number, min: 0, required: true, default: 0 },
  userName: {type: String},
  timestamp: { type: String, required: true },
  previousHash: { type: String, required: true, default: 0 },
  typeSignature: { type: String, required: true },
  data: {employee: String
         ,emailEmployee: String
         ,supervisor: String
         ,emailSupervisor: String
         ,form: String
  },
  hash: {type: String, required: true},
  complexity: { type: Number, min: 0, required: true },
  nonce: { type: Number, min: 0, required: true },
  confirmValidity: {type: String, required: true},
  created_at: {type: Date, required: true}
})

module.exports = restful.model('BlockhainSignature', blockhainSignatureSchema)
