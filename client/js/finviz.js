(function() {
    console.log("Im here");
});
console.log("You are not");
google.load("visualization", "1",{packages:["corechart"]});
//google.setOnLoadCallback(setUp);
if (typeof module !== 'undefined' && module.exports) {
//	module.exports = FastClick.attach;
	module.exports.setupViz = setupViz;
	//module.exports.reqOptionsData = setupViz.reqOptionsData;
}
else
{
    window.setupViz = setupViz;
  //  window.reqOptionsData = reqOptionsData;
}
var setupViz = function() 
{


var baseAPI = "https://testjson-backend-willbittner.c9.io/api/options/";

function setUp() {
    var numRows = 300.0;
    var numCols = 400;

    var tooltipStrings = new Array();
    var dat2 = [['Strike Price','Implied Volatility']];


    var d = 360 / numRows;
    var idx = 0;

    //    for (var i = 0; i < numRows; i++) {
    //      for (var j = 0; j < numCols; j++) {

    //         var value = (Math.cos(i * d * Math.PI / 180.0) * Math.cos(j * d * Math.PI / 180.0));

    //       data.setValue(i, j, value / 4.0);

    //      tooltipStrings[idx] = "x:" + i + ", y:" + j + " = " + value;
    //    idx++;
    //}
    //}
  //  for (var m = 0; m < optData.calls.length; m++) {

        for (var n = 0; n < optData.calls.length; n++) {
            var call1 = optData.calls[n];
            console.log("Dat2: " + JSON.stringify(call1));
        var implValue = Math.round(call1.impliedVol * 100.0);
            if (implValue > 0) {
           // data.setValue(m, Math.round(call1.strikePrice),implValue );
            dat2.push([parseFloat(call1.strikePrice),implValue]);
//  tooltipStrings[idx] = "x:" + m + ", y:" + Math.round(call1.strikePrice) + " = " + call1.impliedVol;
      //  idx++;
            }
        }
    console.log("Dat2: " + JSON.stringify(dat2));
    
       

   // }
    var data = google.visualization.arrayToDataTable(dat2);
   var surfacePlot = new google.visualization.ScatterChart(document.getElementById('finvizChart1'));

    // Don't fill polygons in IE. It's too slow.
   // var fillPly = true;

    // Define a colour gradient.
    var colour1 = {
        red: 0,
        green: 0,
        blue: 255
    };
    var colour2 = {
        red: 0,
        green: 255,
        blue: 255
    };
    var colour3 = {
        red: 0,
        green: 255,
        blue: 0
    };
    var colour4 = {
        red: 255,
        green: 255,
        blue: 0
    };
    var colour5 = {
        red: 255,
        green: 0,
        blue: 0
    };
    var colours = [colour1, colour2, colour3, colour4, colour5];

    // Axis labels.
    var xAxisHeader = "X";
    var yAxisHeader = "Y";

    var options = {
        xPos: 50,
        yPos: 0,
        width: 500,
        height: 500,
        xTitle: xAxisHeader,
        yTitle: yAxisHeader

   
    };

    surfacePlot.draw(data, options);
}
var optData = {};
 function ajaxParams(sy) {
        
        return {
             // The 'type' property sets the HTTP method.
    // A value of 'PUT' or 'DELETE' will trigger a preflight request.
    type: 'GET',
    dataType: 'jsonp',
    // The URL to make the request to.
    data: optData,
    url: baseAPI + sy,

    // The 'contentType' property sets the 'Content-Type' header.
    // The JQuery default for this property is
    // 'application/x-www-form-urlencoded; charset=UTF-8', which does not trigger
    // a preflight. If you set this value to anything other than
    // application/x-www-form-urlencoded, multipart/form-data, or text/plain,
    // you will trigger a preflight request.
    contentType: 'text/plain; charset=UTF-8',


    xhrFields: {
        // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
        // This can be used to set the 'withCredentials' property.
        // Set the value to 'true' if you'd like to pass cookies to the server.
        // If this is enabled, your server must respond with the header
        // 'Access-Control-Allow-Credentials: true'.
        withCredentials: false
    },

    headers: {
        // Set any custom headers here.
        // If you set any non-simple headers, your server must include these
        // headers in the 'Access-Control-Allow-Headers' response header.
    },

    success: function (respo) {
        // Here's where you handle a successful response.
        //	console.log("Success!!" + JSON.stringify(respo));
        optData = respo;
        setUp();
    },

    error: function () {
        // Here's where you handle an error response.
        // Note that if the error was due to a CORS issue,
        // this function will still fire, but there won't be any additional
        // information about the error.

    }
        };
    };
this.reqOptionsData = function(symb1) {
   return (function() {
    console.log("Executed now");
    var ajaxOptions = new ajaxParams(symb1);
    $.ajax(ajaxOptions);
    });
   
};

function dataFromOptions() {
    var retval = [];
    if (!optData.calls) {
        retval = [
            [0, 0],
            [0, 0]
        ];
        return retval;
    }
    for (var i = 0; i < optData.calls.length; i++) {
        var ynew = [];
        retval.push(ynew);
        for (var j = 0; j < optData.calls.length; j++) {
            var call1 = optData.calls[j];

            ynew[call1.strikePrice] = call1.impliedVol;

        }

    }
    return retval;


}
return this;
};

