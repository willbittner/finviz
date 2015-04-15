angular.module("finViz", ["ngRoute", "googlechart"]).config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/options', {
                templateUrl: 'partials/options.html',
                controller: 'OptionsChartCtrl'
            }).
            otherwise({
                redirectTo: '/options'
            });
    }]).value('googleChartApiConfig', {
            version: '1',
            optionalSettings: {
                packages: ['corechart', 'gauge'],
                language: 'en'
            }
    })
    .controller("OptionsChartCtrl", function ($scope, $routeParams) {
    $scope.chartObject = {};

    $scope.onions = [
        {v: "Onions"},
        {v: 3},
    ];

    $scope.chartObject.data = {"cols": [
        {id: "t", label: "Topping", type: "string"},
        {id: "s", label: "Slices", type: "number"}
    ], "rows": [
        {c: [
            {v: "Mushrooms"},
            {v: 3},
        ]},
        {c: $scope.onions},
        {c: [
            {v: "Olives"},
            {v: 31}
        ]},
        {c: [
            {v: "Zucchini"},
            {v: 1},
        ]},
        {c: [
            {v: "Pepperoni"},
            {v: 2},
        ]}
    ]};


    // $routeParams.chartType == BarChart or PieChart or ColumnChart...
    $scope.chartObject.type = $routeParams.chartType;
    $scope.chartObject.options = {
        'title': 'How Much Pizza I Ate Last Night'
    }
}).
  factory('optionsAPIFactory', function($http) {

    var optionsAPI = {};
    optionsAPI.puts = [];
    optionsAPI.calls = [];

    // ergastAPI.getDrivers = function() {
    //   return $http({
    //     method: 'JSONP', 
    //     url: 'http://ergast.com/api/f1/2013/driverStandings.json?callback=JSON_CALLBACK'
    //   });
    // } 
    optionsAPI.get = function (sym) {
        return $http({
    method: 'JSONP',
    // The URL to make the request to.
  
    url: "https://testjson-backend-willbittner.c9.io/api/options/" + sym + "?callback=JSON_CALLBACK",


        });
    }



    return optionsAPI;
  }).controller('MainCtrl',function($scope,optionsAPIFactory) {
        $scope.ticker = "AAPL";
        // var socket = io.connect();
        $scope.optData = [];
         $scope.chartObject = {};
             $scope.chartObject.type = "LineChart";
    $scope.chartObject.options = {
        'title': 'Options Impl Vol'
    }
        


        // socket.on('connect', function () {
        //   $scope.setName();
        // });

        // socket.on('message', function (msg) {
        //   $scope.messages.push(msg);
        //   $scope.$apply();
        // });

        // socket.on('roster', function (names) {
        //   $scope.roster = names;
        //   $scope.$apply();
        // });

        // $scope.send = function send() {
        //   console.log('Sending message:', $scope.text);
        //   socket.emit('message', $scope.text);
        //   $scope.text = '';
        // };
      function buildChartData(odata)
      {
          var defVal = null;
          var retdat = [['Strike Price','Call Implied Vol','Put Implied Vol']];
        for (var n = 0; n < odata.calls.length; n++) {
            var call1 = odata.calls[n];
            console.log("Dat2: " + JSON.stringify(call1));
        var implValue = Math.round(call1.impliedVol * 100.0);
            if (implValue > 0) {
                retdat.push([call1.strikePrice,implValue,defVal]);

            }
            
        }
        for (var p = 0; p < odata.puts.length; p++) {
            var put1 = odata.puts[p];
            console.log("Dat2: " + JSON.stringify(put1));
        var implValue2 = Math.round(put1.impliedVol * 100.0);
            if (implValue2 > 0) {
                retdat.push([put1.strikePrice,defVal,implValue2]);

            }
            
        }
        return google.visualization.arrayToDataTable(retdat);


        
    }; 
      
      
      $scope.getSymbol = function getSymbol() {
            optionsAPIFactory.get($scope.ticker).success(function (response) {
        //Dig into the responde to get the relevant data
                $scope.optData = response;
                $scope.chartObject.data = [[]];
                $scope.chartObject.data = buildChartData($scope.optData);
              


    // $routeParams.chartType == BarChart or PieChart or ColumnChart...

 //   $scope.optionsVolChart = $scope.chartObject;
            });
      };
        // $scope.setName = function setName() {
        //   socket.emit('identify', $scope.name);
        // };
  });