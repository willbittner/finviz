//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var request = require('request');
var dJSON = require('dirty-json');
var iv = require("implied-volatility");
var riskFreeRate = 0.0015;

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];

io.on('connection', function (socket) {
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

var getOptionsData = function(sym,callback) {
  var addressGet = 'http://www.google.com/finance/option_chain?q=' + sym + '&output=json';
request.get(addressGet,function cb(req,resp,body) {
 // var obj = JSON.parse(body);
 //var obj = eval(body);
// var obj = body.toString().replace(/({)([a-zA-Z0-9]+)(:)/,'$1"$2"$3');
dJSON.parse(body).then(function(obj2) {
  callback(obj2);
});

});
};
function OptionData(s,isCall,underlying_price)
{
  this.underlyingPrice = underlying_price;
 
    this.strikePrice = parseFloat(s.strike);
    
    this.symbol = s.s;
    if(isCall) this.callOrPut = "call";
    else this.callOrPut = "put";
    this.price = parseFloat(s.p);
    this.expiration = s.expiry;
    this.daysToExpiration = this.GetDaysUntilExp();
    this.openInterest = s.oi;
    this.timeToExpirationYears = (this.daysToExpiration / 360.0); //:FIXME::
    this.impliedVol = this.GetVolatility(riskFreeRate);
    
  
}

OptionData.prototype.GetDaysUntilExp = function()
{
  var daydivisor = (1000.0 * 60.0 * 60.0 * 24.0);
  
  var dnow = Date.now();
  this.expirationDate = Date.parse(this.expiration);
  var msleft = this.expirationDate - dnow;
  var daysLeft = msleft / daydivisor;
  return daysLeft;
}
OptionData.prototype.GetVolatility = function(risk_free_rate){
  var newiv =  iv.getImpliedVolatility(this.price,this.underlyingPrice, this.strikePrice, this.timeToExpirationYears, risk_free_rate, this.callOrPut);
  this.impliedVol = newiv;
  return newiv;
};
OptionData.prototype.isGarbage = function() {
      if(isNaN(this.price) || this.openInterest <= 0)
    {
      return true;
    }
    return false;
}
function assembleOptionsFromResponse(dt) {
  var calls = dt.calls;
  var puts = dt.puts;
  var newCalls = [];
  var newPuts = [];
  var up = dt.underlying_price;
  for(var i=0; i < calls.length; i++)
  {
    var newOpt = new OptionData(calls[i],1,up);

    if(newOpt.isGarbage()) console.log("Bad option " + JSON.stringify(calls[i]));
    else newCalls.push(newOpt);
  }
    for(var i=0; i < puts.length; i++)
  {
    var newOpt2 = new OptionData(puts[i],0,up);

    if(newOpt2.isGarbage()) console.log("Bad option " + JSON.stringify(puts[i]));
    else newPuts.push(newOpt2);
  }
  var retval = {
    calls: newCalls,
    puts: newPuts
  }
  return retval;
}

router.get('/api/options/:symbol',function(req, resp, next) {
  var symb = req.params.symbol;
  console.log("Getting marketdata for " + symb);
  
    getOptionsData(symb,function (dt) {
      var goodOptions = assembleOptionsFromResponse(dt);
      
      resp.jsonp(goodOptions);
   resp.end();
    });
});
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();

  console.log("Chat server listening at", addr.address + ":" + addr.port);
    console.log("Reg server on port: " + process.env.PORT + " Addr: " + server.address().toString());
});

