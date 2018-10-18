const _ = require('lodash')
var fs = require('fs')
var nodemailer = require('nodemailer');
const TimeCardForm = require('../documentForm/timeCardForm')
const pdfMakePrinter = require('../../node_modules/pdfmake/src/printer');

//**********************************************
// create reusable transporter object using the default SMTP transport

var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    //secure: true, // use SSL
    auth: {
        user: 'gvfoodbank2018@gmail.com',
        pass: 'gvfoodbank2018!@#$'
    },
    tls: {
        rejectUnauthorized: false
    }
};

var transporter = nodemailer.createTransport(smtpConfig);

const sendErrorsFromDB = (res, dbErrors) => {
  const errors = []
  _.forIn(dbErrors.errors, error => errors.push(error.message))
    return res.status(400).json({errors})
}

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
//Mais uma função middleware / se não usar os ultimos parametros podemos suprimir
// neste caso o next()

function createPdfLineItems(tabledata){

  var headers = {
  top:{
      col_1:{ text: 'Date', style: 'tableHeader', alignment: 'center'},
      col_2:{ text: 'Time', style: 'tableHeader', colSpan: 4, alignment: 'center'},
      col_3:{},
      col_4:{},
      col_5:{},
      col_6:{ text: '', style: 'tableHeader', alignment: 'center'},
      col_7:{ text: '', style: 'tableHeader', alignment: 'center'},
      col_8:{ text: '', style: 'tableHeader', alignment: 'center'},
      col_9:{ text: 'ABSENCES', style: 'tableHeader', alignment: 'center'}
    }
  }

  var bodyTable = [];

  for (var key in headers){
  if (headers.hasOwnProperty(key)){
      var header = headers[key];
      var row = new Array();
      row.push( header.col_1 );
      row.push( header.col_2 );
      row.push( header.col_3 );
      row.push( header.col_4 );
      row.push( header.col_5 );
      row.push( header.col_6 );
      row.push( header.col_7 );
      row.push( header.col_8 );
      row.push( header.col_9 );
      bodyTable.push(row);
    }
  }

  //second headerRows
  var headersTwo = {
  top:{
      col_1:{text: 'mm dd', style: 'tableHeader', alignment: 'center'},
      col_2:{text: 'Start', style: 'tableHeader', alignment: 'center'},
      col_3:{text: 'Finish', style: 'tableHeader', alignment: 'center'},
      col_4:{text: 'Total', style: 'tableHeader', alignment: 'center'},
      col_5:{text: 'Lunch', style: 'tableHeader', alignment: 'center'},
      col_6:{text: 'Reg', style: 'tableHeader', alignment: 'center'},
      col_7:{text: 'O/T', style: 'tableHeader', alignment: 'center'},
      col_8:{text: 'Bank', style: 'tableHeader', alignment: 'center'},
      col_9:{text: 'Reason', style: 'tableHeader', alignment: 'center'}
    }
  }

  for (var key in headersTwo){
  if (headersTwo.hasOwnProperty(key)){
      var header = headersTwo[key];
      var row = new Array();
      row.push( header.col_1 );
      row.push( header.col_2 );
      row.push( header.col_3 );
      row.push( header.col_4 );
      row.push( header.col_5 );
      row.push( header.col_6 );
      row.push( header.col_7 );
      row.push( header.col_8 );
      row.push( header.col_9 );
      bodyTable.push(row);
    }
  }

  var iCountRegister = 0
  var totalTimeSum = 0
  var totalLunchTime = 0
  var totalReg = 0
  var totalOvertime = 0
  var totalBank = 0

  for (var key = 0; key < (tabledata.length); key++){
    iCountRegister += 1

    totalTimeSum += tabledata[key].totalTime
    totalLunchTime += tabledata[key].lunchTime
    totalReg += tabledata[key].reg
    totalOvertime += tabledata[key].overtime
    totalBank += tabledata[key].bank

    var monthLineGrid = tabledata[key].monthLineGrid
    var dayLineGrid = tabledata[key].dayLineGrid
    var startTime = tabledata[key].startTime
    var finishTime = tabledata[key].finishTime
    var totalTime = tabledata[key].totalTime
    var lunchTime = tabledata[key].lunchTime
    var reg = tabledata[key].reg
    var overtime = tabledata[key].overtime
    var bank = tabledata[key].bank
    var absence = tabledata[key].absence

    var row = new Array();
    row.push( { text: monthLineGrid + '/' + dayLineGrid, alignment: 'center' });
    row.push( { text: startTime, alignment: 'center' });
    row.push( { text: finishTime, alignment: 'center' });
    row.push( { text: totalTime, alignment: 'center' });
    row.push( { text: lunchTime, alignment: 'center' });
    row.push( { text: reg, alignment: 'center' });
    row.push( { text: overtime, alignment: 'center' });
    row.push( { text: bank, alignment: 'center' });
    row.push( { text: absence, alignment: 'center' });

    bodyTable.push(row);
  }

  //fill with empty fields
  for (var i = 0; i < (12 - iCountRegister); i++ ){
    var row = new Array();
    row.push( { text: ' ', alignment: 'center' });
    row.push( { text: ' ', alignment: 'center' });
    row.push( { text: ' ', alignment: 'center' });
    row.push( { text: ' ', alignment: 'center' });
    row.push( { text: ' ', alignment: 'center' });
    row.push( { text: ' ', alignment: 'center' });
    row.push( { text: ' ', alignment: 'center' });
    row.push( { text: ' ', alignment: 'center' });
    row.push( { text: ' ', alignment: 'center' });

    bodyTable.push(row);
  }

  return {bodyTable, totalTimeSum: totalTimeSum, totalLunchTime: totalLunchTime
       , totalReg: totalReg, totalOvertime: totalOvertime, totalBank: totalBank};
}

// assim que logar chamar essa função para carregar as informações sobre a lista de formulário
// que o funcionário já fez chamado.
function postSendMail(req, res){

    const _id = {_id: req.params.id}

    console.log('req.params.id ' + req.params.id)

    TimeCardForm.find(_id, (err, result) => {
      if(err) {
        res.status(500).json({errors: [err]})
      } else {

        var bodyTable = createPdfLineItems(result[0].gridLineInformation);

        ///first Example layout pdf TimeHoursForm
        const docDefinition = {
          // a string or { width: number, height: number }

          pageSize: 'A4',
          // by default we use portrait, you can change it to landscape if you wish
          //pageOrientation: 'landscape',
          pageOrientation: 'portrait',

          // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
          pageMargins: [ 40, 60, 40, 60 ],

          info: {
            title: 'Time Card - Hourly Paid Employees',
            author: 'Marcos Almeida',
            subject: 'Time Hours',
            keywords: 'keywords for document',
          },

          content: [

                    {
                      image: testImageDataUrl,
                      width: 150,
                      //height: ,
                      absolutePosition: {x: 35, y: 15}
                    },
                    //{text: 'Text on Portrait'},
                    //{text: 'Text on Landscape', pageOrientation: 'landscape', pageBreak: 'before'},
                    //{text: 'Text on Landscape 2', pageOrientation: 'landscape', pageBreak: 'after'},
                    //{text: 'Text on Portrait 2'},

                    {text: 'TIME CARD - HOURLY PAID EMPLOYEES', fontSize: 15,  color: 'black', absolutePosition: {x: 215, y: 35}, bold: true},

                    //Texto PP canto direito superior
                    {text: 'PP', fontSize: 12,  color: 'black', relativePosition: {x: 473, y: 10}, bold: true},

                    //Texto PP canto direito superior
                    {text: '2017-2018', fontSize: 12,  color: 'black', relativePosition: {x: 395, y: 33}, bold: true},

                    //label line Employee Name
                    {text: 'Employee Name:', fontSize: 12,  color: 'black', relativePosition: {x: 15, y: 33}, bold: true},
                    {text: result[0].employeeName, fontSize: 12,  color: 'blue', relativePosition: {x: 120, y: 31}, bold: true},

                    //label line Employee Name (print)
                    {text: '(Print)', fontSize: 12,  color: 'black', relativePosition: {x: 25, y: 46}, bold: true},

                    /* ############################################################ */

                    //label line Employee Name
                    {text: 'Department:', fontSize: 12,  color: 'black', relativePosition: {x: 15, y: 65}, bold: true},
                    {text: result[0].departmentName, fontSize: 12,  color: 'blue', relativePosition: {x: 120, y: 63}, bold: true},

                    //Texto PP canto direito superior
                    {text: 'Dept Code:', fontSize: 12,  color: 'black', relativePosition: {x: 395, y: 65}, bold: true},
                    {text: result[0].codDept, fontSize: 11,  color: 'blue', relativePosition: {x: 472, y: 63}, bold: true},

                    //label line Employee Name (print)
                    {text: '(Print)', fontSize: 12,  color: 'black', relativePosition: {x: 25, y: 78}, bold: true},

                    /* ############################################################ */
                    //label line Pay Period
                    {text: 'Pay Period:', fontSize: 12,  color: 'black', relativePosition: {x: 15, y: 110}, bold: true},

                    //label line From
                    {text: 'From:', fontSize: 12,  color: 'black', relativePosition: {x: 120, y: 110}, bold: true},

                    //mm/dd
                    {text: 'mm', fontSize: 11,  color: 'black', relativePosition: {x: 170, y: 122}, bold: false},
                    {text: 'dd', fontSize: 11,  color: 'black', relativePosition: {x: 210, y: 122}, bold: false},
                    {text: result[0].monthFrom, fontSize: 11,  color: 'blue', relativePosition: {x: 170, y: 105}, bold: false},
                    {text: result[0].dayFrom, fontSize: 11,  color: 'blue', relativePosition: {x: 210, y: 105}, bold: false},

                    //label line To
                    {text: 'To:', fontSize: 12,  color: 'black', relativePosition: {x: 340, y: 110}, bold: true},

                    //mm/dd
                    {text: 'mm', fontSize: 11,  color: 'black', relativePosition: {x: 380, y: 122}, bold: false},
                    {text: 'dd', fontSize: 11,  color: 'black', relativePosition: {x: 420, y: 122}, bold: false},
                    {text: result[0].monthTo, fontSize: 11,  color: 'blue', relativePosition: {x: 380, y: 105}, bold: false},
                    {text: result[0].dayTo, fontSize: 11,  color: 'blue', relativePosition: {x: 420, y: 105}, bold: false},

                    // Big box and all canvas
                    {
                      canvas: [
                        /*
                        {
                          type: 'rect',
                          x: 1,
                          y: 1,
                          w: 510,
                          h: 720,
                          r: 4,
                          lineColor: '#000',
                          absolutePosition: {x: 5, y: 2}
                        },
                        */
                        //Line One Employee Name
                        {
                          type: 'line',
                          x1: 110, y1: 45, // x1: lateralidade / y1: altura lado esquerdo
                          x2: 350, y2: 45, // x2: tamanho linha / y2: altura lado direito
                          lineWidth: 1 // largura da linha
                        },
                        //box PP
                        {
                          type: 'rect',
                          x: 455, y: 25, w: 40, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },
                        /* #################################################################### */
                        //Line two Department
                        {
                          type: 'line',
                          x1: 110, y1: 75, // x1: lateralidade / y1: altura lado esquerdo
                          x2: 350, y2: 75, // x2: tamanho linha / y2: altura lado direito
                          lineWidth: 1 // largura da linha
                        },
                        //box Dept Code
                        {
                          type: 'rect',
                          x: 455, y: 55, w: 40, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },
                        /* #################################################################### */
                        //Line Three
                        //box From mm
                        {
                          type: 'rect',
                          x: 155, y: 98, w: 40, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },
                        //box From dd
                        {
                          type: 'rect',
                          x: 195, y: 98, w: 40, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },
                        //box To mm
                        {
                          type: 'rect',
                          x: 365, y: 98, w: 40, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },
                        //box To dd
                        {
                          type: 'rect',
                          x: 405, y: 98, w: 40, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },

                      ]
                    },
                    //table
                    //values inside the table
                    //DAQUI
                    {
                      style: 'tableExample',
                      color: '#444',
                      relativePosition: {x: 1, y: 20},
                      table: {
                        widths: [45, 38, 38, 38, 38, 38, 38, 38, 95],
                        headerRows: 2,
                        // keepWithHeaderRows: 1,
                        body: bodyTable.bodyTable,
                      }
                    },
                    //ATÉ AQUI
                    //label end of table
                    {text: '**Regular time is the first 8 hours worked. Overtime kicks in after 8 hours.', fontSize: 11,  color: 'black', relativePosition: {x: 15, y: 280}, bold: false},

                    //label TOTAL HOURS
                    {text: 'TOTAL HOURS', fontSize: 12,  color: 'black', relativePosition: {x: 25, y: 310}, bold: true},

                    //Summary of HOURS
                    {text: bodyTable.totalTimeSum, fontSize: 11,  color: 'blue', relativePosition: {x: 165, y: 310}, bold: true},
                    {text: bodyTable.totalLunchTime, fontSize: 11,  color: 'blue', relativePosition: {x: 216, y: 310}, bold: true},
                    {text: bodyTable.totalReg, fontSize: 11,  color: 'blue', relativePosition: {x: 264, y: 310}, bold: true},
                    {text: bodyTable.totalOvertime, fontSize: 11,  color: 'blue', relativePosition: {x: 313, y: 310}, bold: true},
                    {text: bodyTable.totalBank, fontSize: 11,  color: 'blue', relativePosition: {x: 362, y: 310}, bold: true},

                    // Reason: Vacation/Sick
                    {text: 'Reason:', fontSize: 11,  color: 'black', relativePosition: {x: 390, y: 310}, bold: false},
                    {text: 'V', fontSize: 11,  color: 'black', relativePosition: {x: 435, y: 310}, bold: true},
                    {text: 'acation', fontSize: 11,  color: 'black', relativePosition: {x: 442, y: 310}, bold: false},
                    {text: 'S', fontSize: 11,  color: 'black', relativePosition: {x: 435, y: 320}, bold: true},
                    {text: 'ick', fontSize: 11,  color: 'black', relativePosition: {x: 442, y: 320}, bold: false},

                    {text: 'Employee Signature:', fontSize: 11,  color: 'black', relativePosition: {x: 70, y: 390}, bold: false},
                    {text: result[0].signatureEmployee, fontSize: 10,  color: 'blue', relativePosition: {x: 1, y: 360}, bold: false},

                    {text: 'Supervisor Signature:', fontSize: 11,  color: 'black', relativePosition: {x: 370, y: 390}, bold: false},
                    {text: result[0].signatureSupervisor, fontSize: 10,  color: 'blue', relativePosition: {x: 367, y: 345}, bold: false},

                    {text: 'For Office Use Only', fontSize: 11,  color: 'black', relativePosition: {x: 210, y: 445}, bold: false},

                    {text: 'Regular', fontSize: 11,  color: 'black', relativePosition: {x: 1, y: 480}, bold: false},
                    {text: 'O/T', fontSize: 11,  color: 'black', relativePosition: {x: 110, y: 480}, bold: false},
                    {text: 'Absences', fontSize: 11,  color: 'black', relativePosition: {x: 240, y: 480}, bold: false},
                    {text: 'Days Reason', fontSize: 11,  color: 'black', relativePosition: {x: 233, y: 495}, bold: false},
                    {text: 'Bank', fontSize: 11,  color: 'black', relativePosition: {x: 470, y: 480}, bold: false},

                    {
                      canvas: [
                        //box TOTAL HOURS
                        {
                          type: 'rect',
                          x: 153, y: 300, w: 40, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },
                        //box TOTAL HOURS
                        {
                          type: 'rect',
                          x: 200, y: 300, w: 40, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },
                        //box TOTAL HOURS
                        {
                          type: 'rect',
                          x: 246, y: 300, w: 40, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },
                        //box TOTAL HOURS
                        {
                          type: 'rect',
                          x: 295, y: 300, w: 40, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },
                        //box TOTAL HOURS
                        {
                          type: 'rect',
                          x: 343, y: 300, w: 40, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },
                        //Line Employee Signature
                        {
                          type: 'line',
                          x1: 240, y1: 390, // x1: tamanho linha / y1: altura lado esquerdo
                          x2: 1, y2: 390, // x2: lateralidade / y2: altura lado direito
                          lineWidth: 1 // largura da linha
                        },
                        //Line Supervisor Signature
                        {
                          type: 'line',
                          x1: 320, y1: 390, // x1: tamanho linha / y1: altura lado esquerdo
                          x2: 500, y2: 390, // x2: lateralidade / y2: altura lado direito
                          lineWidth: 1 // largura da linha
                        },

                        //Line Supervisor Signature
                        {
                          type: 'line',
                          x1: 1, y1: 440, // x1: tamanho linha / y1: altura lado esquerdo
                          x2: 500, y2: 440, // x2: lateralidade / y2: altura lado direito
                          lineWidth: 3 // largura da linha
                        },

                        //box Regular
                        {
                          type: 'rect',
                          x: 1, y: 510, w: 40, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },
                        //box O/T
                        {
                          type: 'rect',
                          x: 100, y: 510, w: 40, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },
                        //box Absences / Days Reason
                        {
                          type: 'rect',
                          x: 230, y: 510, w: 30, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },
                        //box Days Reason
                        {
                          type: 'rect',
                          x: 270, y: 510, w: 30, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },
                        //box Bank
                        {
                          type: 'rect',
                          x: 465, y: 510, w: 40, h: 25, r: 4,
                          lineColor: '#000',
                          relativePosition: {x: 40, y: 30}
                        },

                      ]
                    }
                    //end table

                  ],

                  //
                  styles: {
                    header: {
                      fontSize: 18,
                      bold: true,
                      margin: [0, 0, 0, 10]
                    },
                    subheader: {
                      fontSize: 16,
                      bold: true,
                      margin: [0, 10, 0, 5]
                    },
                    tableExample: {
                      margin: [0, 5, 0, 15]
                    },
                    tableHeader: {
                      bold: true,
                      fontSize: 12,
                      color: 'black'
                    }
                  },
                  defaultStyle: {
                    // alignment: 'justify'
                  }
        };

        generatePdf(docDefinition, (response) => {
          //res.send(response); // sends a base64 encoded string to client

          // setup e-mail data with unicode symbols
          var mailOptions = {
              from: '"Great Vancouver Food Bank" <gvfoodbank2018@gmail.com>', // sender address
              to: result[0].email + ', marcosalmeida1977@gmail.com', // list of receivers
              subject: 'GVFB Form Workflow', // Subject line
              html: emailBody(), // html body
              attachments: [
                {
                  filename: 'TimeCard.pdf',
                  content: new Buffer(response, 'base64'),
                  contentType: 'application/pdf; charset=ISO-8859-1'
                }
              ]
          };

          // send mail with defined transport object
          transporter.sendMail(mailOptions, function(error, info){
            if(error){
              return console.log(error);
              return res.status(500).send({error: [error]})
            }
            console.log('Message sent: ' + info.response);
            return res.status(200).send({result: [info.response]})
          });

        });

      }
    })
}

function generatePdf(docDefinition, callback) {
  try {
    //console.log(__dirname)
    var fontDescriptors = {
      Roboto: {
          normal: 'config/fonts/Roboto-Regular.ttf',
          bold: 'config/fonts/Roboto-Medium.ttf',
          italics: 'config/fonts/Roboto-Italic.ttf',
          bolditalics: 'config/fonts/Roboto-MediumItalic.ttf'
      }
    };

    const printer = new pdfMakePrinter(fontDescriptors);
    const doc = printer.createPdfKitDocument(docDefinition);

    let chunks = [];

    doc.on('data', (chunk) => {
      chunks.push(chunk);
    });

    doc.on('end', () => {
      const result = Buffer.concat(chunks);
      //callback('data:application/pdf;base64,' + result.toString('base64'));
      //data:application/octet-stream;charset=utf-16le;base64,
      callback(result.toString('base64'));
    });

    doc.end();

  } catch(err) {
    throw(err);
  }
};

var testImageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASQAAABbCAYAAADa+vhMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4JpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpCQTc2NjNEQTQ2NzZFMjExQjhCN0YxMkNBQ0ZDN0VENCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozNjk0ODk3MDYzQ0IxMUU1OUIwOEJBRDlDRTI3M0ZFNSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozNjk0ODk2RjYzQ0IxMUU1OUIwOEJBRDlDRTI3M0ZFNSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmM1NWVhMTk2LTA1MDMtNDA5OC1iMGExLWRiNGJjMjc5NzFmNCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjM1MDg2MzExLWFjMjAtMTE3OC04OGJmLWRl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';


function emailBody(){

  //${data.resourceName}
  //var htmlMail = `<html><head>`
  //    htmlMail += `</head>`
  //    htmlMail += `<body>`
  //    htmlMail += `<p>PDF attachments ?</p>`
  //    htmlMail += `<img src="https://foodbank.bc.ca/wp-content/themes/foodbank/images/logo.png" alt="site logo">`
  //    htmlMail += `<body></html>`

  var htmlMail = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">`
      htmlMail += `<html xmlns="http://www.w3.org/1999/xhtml">`
      htmlMail += `<head>`
      htmlMail += `<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />`
      htmlMail += `<title>Great Vancouver Food Bank</title>`
      htmlMail += `<meta name="viewport" content="width=device-width, initial-scale=1.0"/>`
      htmlMail += `</head>`

      htmlMail += `<body style="margin: 0; padding: 0;">`
      htmlMail += ``
      htmlMail += `<table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; border: 1px solid #cccccc;">`
      htmlMail += `<tr>`
      htmlMail += `<td>`
      htmlMail += `<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">`
      htmlMail += `<tr>`
      htmlMail += `<td align="center" bgcolor="#70bbd9" style="padding: 40px 0 30px 0;">`
      htmlMail += `<img src="https://foodbank.bc.ca/wp-content/themes/foodbank/images/Foodbank_Logo.png" alt="Great Vancouver Food Bank" width="300" height="230" style="display: block;">`
      htmlMail += `</td>`

      htmlMail += `</tr>`
      htmlMail += `<tr>`
      htmlMail += `<td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">`
      htmlMail += `<table border="0" cellpadding="0" cellspacing="0" width="100%">`
      htmlMail += `<tr>`
      htmlMail += `<td style="color: #153643; font-family: Arial, sans-serif; font-size: 24px;">`
      htmlMail += `<b>Lorem ipsum dolor sit amet!</b>`
      htmlMail += `</td>`
      htmlMail += `</tr>`
      htmlMail += `<tr>`
      htmlMail += `<td style="padding: 20px 0 30px 0;">`
      htmlMail += `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempus adipiscing felis, sit amet blandit ipsum volutpat sed. Morbi porttitor, eget accumsan dictum, nisi libero ultricies ipsum, in posuere mauris neque at erat.`
      htmlMail += `</td>`
      htmlMail += `</tr>`
      htmlMail += `<tr>`
      htmlMail += `<td>`
      htmlMail += `<table border="0" cellpadding="0" cellspacing="0" width="100%">`
      htmlMail += `<tr>`
      htmlMail += `<td width="260" valign="top">`
      htmlMail += `<table border="0" cellpadding="0" cellspacing="0" width="100%">`
      htmlMail += `<tr>`
      htmlMail += `<td>`
      htmlMail += `<img src="images/left.gif" alt="" width="100%" height="140" style="display: block;" />`
      htmlMail += `</td>`
      htmlMail += `</tr>`
      htmlMail += `<tr>`
      htmlMail += `<td style="padding: 25px 0 0 0;">`
      htmlMail += `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempus adipiscing felis, sit amet blandit ipsum volutpat sed. Morbi porttitor, eget accumsan dictum, nisi libero ultricies ipsum, in posuere mauris neque at erat.`
      htmlMail += `</td>`
      htmlMail += `</tr>`
      htmlMail += `</table>`
      htmlMail += `</td>`
      htmlMail += `<td style="font-size: 0; line-height: 0;" width="20">`
      htmlMail += `&nbsp;`
      htmlMail += `</td>`
      htmlMail += `<td width="260" valign="top">`
      htmlMail += `<table border="0" cellpadding="0" cellspacing="0" width="100%">`
      htmlMail += `<tr>`
      htmlMail += `<td>`
      htmlMail += `<img src="images/right.gif" alt="" width="100%" height="140" style="display: block;" />`
      htmlMail += `</td>`
      htmlMail += `</tr>`
      htmlMail += `<tr>`
      htmlMail += `<td style="padding: 25px 0 0 0;">`
      htmlMail += `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempus adipiscing felis, sit amet blandit ipsum volutpat sed. Morbi porttitor, eget accumsan dictum, nisi libero ultricies ipsum, in posuere mauris neque at erat.`
      htmlMail += `</td>`
      htmlMail += `</tr>`
      htmlMail += `</table>`
      htmlMail += `</td>`
      htmlMail += `</tr>`
      htmlMail += `</table>`
      htmlMail += `</td>`
      htmlMail += `</tr>`
      htmlMail += `</table>`
      htmlMail += `</td>`
      htmlMail += `</tr>`
      htmlMail += `<tr>`
      htmlMail += `<td bgcolor="#ee4c50" style="padding: 30px 30px 30px 30px;">`
      htmlMail += `<table border="0" cellpadding="0" cellspacing="0" width="100%">`
      htmlMail += `<tr>`
      htmlMail += `<td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">`
      htmlMail += `&reg; © 2018 All Rights Reserved.<br/>`
      htmlMail += `<a href="#" style="color: #ffffff;"><font color="#ffffff">Registered Charity Number 107449787 RR0001</font></a>`
      htmlMail += `</td>`
      htmlMail += `<td align="right">`
      htmlMail += `<table border="0" cellpadding="0" cellspacing="0">`
      htmlMail += `<tr>`
      htmlMail += `<td>`

      //<a class="ss-icon ss-social-circle Instagram" target="_blank" href="https://www.instagram.com/vanfoodbank/">Instagram</a>

      htmlMail += `<a class="ss-icon ss-social-circle Facebook" target="_blank" href="https://www.facebook.com/VanFoodBank/">`
      htmlMail += `Facebook`
      htmlMail += `</a>`
      htmlMail += `</td>`
      htmlMail += `<td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>`
      htmlMail += `<td>`
      htmlMail += `<a class="ss-icon ss-social-circle Twitter" target="_blank" href="https://twitter.com/vanfoodbank">`
      htmlMail += `Twitter`
      htmlMail += `</a>`
      htmlMail += `</td>`
      htmlMail += `</tr>`
      htmlMail += `</table>`
      htmlMail += `</td>`
      htmlMail += `</tr>`
      htmlMail += `</table>`
      htmlMail += `</td>`
      htmlMail += `</tr>`
      htmlMail += `</table>`

      htmlMail += `</td>`
      htmlMail += `</tr>`
      htmlMail += `</table>`
      htmlMail += `</body>`
      htmlMail += `</html>`

  return htmlMail

}


module.exports = { postSendMail }
