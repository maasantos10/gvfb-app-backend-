const SHA256 = require('crypto-js/sha256');
const _ = require('lodash')
const BlockchainDAO = require('./blockchainDAO')

class Block {

   constructor(index, timestamp, data, previousHash = '') {
       this.index = index;
       this.previousHash = previousHash;
       this.timestamp = timestamp;
       //this.timestamp = Math.floor(Date.now() / 1000);
       this.data = data;
       this.hash = this.computeHash();
       this.nonce = 0;
   }

   computeHash() {
       return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
   }

   mineBlock(complexity) {
       while (this.hash.substring(0, complexity) !== Array(complexity + 1).join("0")) {
           this.nonce++;
           this.hash = this.computeHash();
       }
       console.log('Mining is taking place: ' + this.hash);
   }
}

class Blockchain{

   constructor(index, data, previousHash) {
       this.chain = [this.buildGenesisBlock(index, data, previousHash)];
       this.complexity = 3;
   }

   buildGenesisBlock(index, data, previousHash) {
       return new Block(index, Math.floor(Date.now() / 1000), data, previousHash);
   }

   obtainLatestBlock() {
       return this.chain[this.chain.length - 1];
   }

   addBlock(newBlock) {
       newBlock.previousHash = this.obtainLatestBlock().hash;
       newBlock.mineBlock(this.complexity);
       this.chain.push(newBlock);
   }

   confirmValidity() {
       for (let i = 1; i < this.chain.length; i++){
           const currentBlock = this.chain[i];
           const previousBlock = this.chain[i - 1];
           if (currentBlock.hash !== currentBlock.computeHash()) {
               return false;
           }
           if (currentBlock.previousHash !== previousBlock.hash) {
               return false;
           }
       }
       return true;
   }
}

const signDocument = (req, res, next) => {

  //res.json({ timestamp, userName, typeSignature, data, previousHash, hash, signatureChain })
  //precisa colocar "https" na aplicação caso contrário as informações
  // por exemplo de e-mail e senha ficam expostas do browser até o
  // servidor. aplicativos como wireshark para fazer sniffer na rede
  // podem capturar as informações.
  // qualquer monitor de rede pode capturar a senha.
  // não basta apenas colocar autenticação precisa colocar segurança.

  BlockchainDAO.findOne({}, {}, { sort: { 'created_at' : -1 } }, (err, chain) => {
    if(err) {
      //return sendErrorsFromDB(res, err)
      return res.status(400).send({errors: [err]})
    } else {
      const index = chain.index + 1

      const timestamp = Math.floor(Date.now() / 1000);
      const userName = 'maasantos10' //req.body.userName
      const typeSignature =  'SUPERVISOR' //req.body.typeSignature //'SUPERVISOR/EMPLOYEE'

      const data = {
                      //employee: req.body.emailEmployee,
                      //supervisor: req.body.emailSupervisor,
                      //form: req.body.email
                      employee: 'Marcos Almeida',
                      emailEmployee: 'marcosalmeida1977@gmail.com',
                      supervisor: 'Belquiria',
                      emailSupervisor: 'bella@gmail.com',
                      form: 'TIME HOURS'
                    }
      console.log('chain.previousHash: ' + chain.previousHash)
      console.log('chain.hash: ' + chain.hash)

      let signatureChain = new Blockchain(index, data, chain.hash);

      //signatureChain.addBlock(new Block(index, timestamp, data, chain.hash));

      const previousHash = signatureChain.chain[0].previousHash
      const hash =  signatureChain.chain[0].hash

      const newBlockchain = new BlockchainDAO({ index, userName, timestamp, previousHash, typeSignature
                               , data, hash, complexity: signatureChain.complexity, nonce: signatureChain.chain[0].nonce
                               , confirmValidity: signatureChain.confirmValidity(), created_at: Date.now() })
      newBlockchain.save(err => {
        if(err) {
          return sendErrorsFromDB(res, err)
        } else {
          res.json({ signatureChain, confirmValidity: signatureChain.confirmValidity() })
        }
      })
    }
  })
}
/*
BlockchainDAO.aggregate([
// pipeline de agregaçãop
{ $match: { email: email }
}, {
  $project: {typeForm: {$sum: "$typeForm"}}
}, {
  $group: {_id: null, typeForm: {$sum: "$typeForm" }}
}, {
  $project: {_id: 0, typeForm: 1}
}, {
  $count: "myFormCount"
}],
function(error, result) {
  if(error){
    res.status(500).json({errors: [error]})
  } else {
    res.json(_.defaults(result[0]))
  }
})
*/

const sendErrorsFromDB = (res, dbErrors) => {
  const errors = []
  _.forIn(dbErrors.errors, error => errors.push(error.message))
    return res.status(400).json({errors})
}

module.exports = { signDocument }
