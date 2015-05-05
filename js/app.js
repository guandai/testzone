
var app = angular.module('dzapp',["chart.js"]);

app.controller('widgetCtrl', function ($http, $scope, widgetService) {
    $scope.widgets = widgetService.widgets;
    $scope.series = ["Sent","Received", "Reply","Received in %","Reply in %"]
	$scope.monthlabels=[]
	$scope.yearlabels=[]
	$scope.daylabels=[]
    loadjson($http,$scope)
    
    $scope.check = function ( id ) {
        widgetService.check( id );
    };
     $scope.remove = function ( id ) {
        widgetService.remove( id );
    };
});


app.controller("TableCtrl",  function ($scope) {
});

app.controller("DayLineCtrl",  function ($scope) {
  
  $scope.series  = $scope.series.slice(0,3)
  $scope.lastdays = 15
  
  updateLineData()

   function updateLineData(){
	 	$scope.dayDataLine = []
	 	var skipline = osize($scope.dayData) -  $scope.lastdays
  		$scope.daylabelsRef=$scope.daylabels.slice( skipline )

		for (var i in $scope.dayDataRev ){
			if( i !="receivedPer" && i !="replyPer" ){
				var d = joinAsArray($scope.dayDataRev[i]).slice(skipline)			
				$scope.dayDataLine.push(d)	
			}
		}  
	 }
  

	$scope.$watch($scope.lastdays)
	
	document.getElementById("updateLineButton")
        .addEventListener('click', function() {
        	$scope.lastdays=parseInt($scope.lastdays)
        	tr("updated",$scope.lastdays )
		    $scope.$apply( updateLineData );
		});	

});

app.controller("MonthBarCtrl", function ($scope) {
 
	$scope.monthDataBar = []
	$scope.series  = $scope.series.slice(0,3)
	for (var i in $scope.monthDataRev ){
		if( i !="receivedPer" && i !="replyPer" ){
			var d = joinAsArray($scope.monthDataRev[i])
			$scope.monthDataBar.push(d)	
		}
		
	}  
});

app.controller("YearBarCtrl",   function ($scope) {
 
	$scope.yearDataBar = []
	$scope.series  = $scope.series.slice(0,3)
	for (var i in $scope.yearDataRev ){
		if( i !="receivedPer" && i !="replyPer" ){
			
			var d = joinAsArray($scope.yearDataRev[i])
			$scope.yearDataBar.push(d)	
		}
		
	}  
});

function loadjson(http, scope) {
  
	http.get("./emails.json").then(function(response) {
		    tr( "size of data:",osize(response.data ) )
		    var monthData = {}
		    var yearData = {}
		    var dayData = {}
		    
		    // pre processing data
		    for (t in response.data)
		    {	
		    	var data = response.data[t]
		    	var month= t.match(/-(\d{2})-/)[1]
		    	var year= t.match(/(\d{4})-/)[1]

		    	var dname =  daylabelname = t.match(/-(\d{2}-\d{2})/)[1]
		    	var mname =  year + "-" + month
		    	var yname =  yearlabelname = year

		    	var mon = mname.substring(2).match(/-(\d{2})/)[1]
		    	var monword= transMonth(mon)
		    	var monthtlabelname = mname.replace("-"+mon, " "+monword)

		    	if( scope.monthlabels.indexOf(monthtlabelname )==-1) scope.monthlabels.push( monthtlabelname )
		    	if( scope.yearlabels.indexOf(yearlabelname )==-1) scope.yearlabels.push( yearlabelname )
		    	if( scope.daylabels.indexOf(daylabelname )==-1) scope.daylabels.push( daylabelname )

		    	if( !dayData[dname] )  dayData[dname] = {"emailSent":0 , "emailReceived":0 , "emailReply":0 , "receivedPer":0, "replyPer":0}
		    	if( !monthData[mname] )  monthData[mname] = {"emailSent":0 , "emailReceived":0 , "emailReply":0 , "receivedPer":0, "replyPer":0}
				if( !yearData[yname] )  yearData[yname] = {"emailSent":0 , "emailReceived":0 , "emailReply":0, "receivedPer":0, "replyPer":0}
				 
				 monthData[mname]["emailSent"] += data["emails sent"]
				 monthData[mname]["emailReceived"] += data["email received"]
				 monthData[mname]["emailReply"] += data["email reply"]
				 monthData[mname]["receivedPer"] =  cutper(monthData[mname]["emailReceived"] / monthData[mname]["emailSent"]) 
				 monthData[mname]["replyPer"] =  cutper(monthData[mname]["emailReply"] / monthData[mname]["emailSent"])

				 yearData[yname]["emailSent"] += data["emails sent"]
				 yearData[yname]["emailReceived"] += data["email received"]
				 yearData[yname]["emailReply"] += data["email reply"]
				 yearData[yname]["receivedPer"] =  cutper(yearData[yname]["emailReceived"] / yearData[yname]["emailSent"])
				 yearData[yname]["replyPer"] =  cutper(yearData[yname]["emailReply"] / yearData[yname]["emailSent"])

				 dayData[dname]["emailSent"] = data["emails sent"]
				 dayData[dname]["emailReceived"] = data["email received"]
				 dayData[dname]["emailReply"] = data["email reply"]
				 dayData[dname]["receivedPer"] =  cutper(dayData[dname]["emailReceived"] / dayData[dname]["emailSent"])
				 dayData[dname]["replyPer"] =  cutper(dayData[dname]["emailReply"] / dayData[dname]["emailSent"])
		   
		    }

		    
		    scope.monthData = monthData
		    scope.yearData = yearData
		    scope.dayData=dayData
		    
		    scope.monthDataRev=revertjson(monthData)
		    scope.yearDataRev=revertjson(yearData)
		 	scope.dayDataRev=revertjson(dayData)	    
		 	tr("monthdata:")
		    console.log(monthData)
		    tr("yeardata:")
		    console.log(yearData)
		    tr("daydata:")
		    console.log(dayData)
		});
}


// app.directive('chartStackedBar', function (ChartJsFactory) { 
//       return new ChartJsFactory('StackedBar'); 
//     });


app.directive("sharePanel" , function(){
   return {
    restrict: 'EAC',
    transclude: true,
    templateUrl: 'template/sharepanel.html'
  };
} )

app.directive("switchCharts" , function(){
   return {
    restrict: 'EAC',
    template: '<ng-include  class="template-include"  src="switchTemplate()"/>',
    transclude: true,
    link : function(scope,element,attrs, ctrl) {
             tr("template: ",attrs.template)             
             scope.switchTemplate = function(){
                     return attrs.template
                 }
            }
    };
})



app.service('widgetService', function ($http) {
  this.check = function (id) {
        console.log("widgetService check")
        enmuobj( this.widgets, "id", id, function(scope,index){
            scope[index].checked = !scope[index].checked;
         })
    };


  
    this.widgets = [
        {
            id: 1, 
            name: 'Table Panel', 
            type: 'table',
            checked: true,
            template : "template/chart-table.html"
             
        },
        {
            id: 2, 
            name: 'Bar Panel', 
            type: 'bar',
            checked: true,
            template : "template/chart-monthbar.html"
        },
        {
              id: 3, 
             name: 'Year Panel', 
             type: 'bar',
             checked: true,
             template : "template/chart-yearbar.html"
        },
        {
             id: 4, 
             name: 'Last 15 Days Panel', 
             type: 'line',
             checked: true,
             template : "template/chart-dayline.html"
        }
     
    ];
});

// enumerate each object in a object to match id
function enmuobj( scope , valname, val, docb ){
    for (var i in scope) {
            if ( scope[i][valname] === val) {
                 docb(scope,i)
                break;
            }
        }
}

