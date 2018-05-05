var globalChartData = null;
$(document).ready(function(){
	getDataAndPaintCharts();
	
	$("#saveMobileData").click(function(){
		var company = $("#selCompany").val();
		var device = $("#selDevice").val();
		var dateOfSale = $("#txtDateOfSale").val();
		var price = $("#txtPrice").val();
		var quantity = $("#txtQuantity").val();

		if(company && device && dateOfSale && price && quantity){
			var data = {
				'company' : company,
				'device' : device,
				'dateOfSale' : dateOfSale,
				'price': price,
				'quantity': quantity
			};
			console.log(data);
			var newMobileData = database.ref('mobileData').push();
			newMobileData.set(data);
			$("#addMobileData").modal('hide');
			$("#mobileDataForm")[0].reset();
		} else {
			alert("All Fields are compulsory");
		}


	});
	
	$("#selPivotEntity").change(function(){
		var pivotEntity = $("#selPivotEntity").val();
		pivotDataAndPaintCharts(globalChartData, pivotEntity);
	});
	
});

function getDataAndPaintCharts(){
	var mobileData = database.ref('mobileData');
	mobileData.on('value', function(snapshot){
		globalChartData = snapshot.val();
		pivotDataAndPaintCharts(globalChartData);
	});
}

function pivotDataAndPaintCharts(rawChartData, pivotWith){
	var pivotWith = pivotWith || 'company';

	var barChartData = prepareBarChartData(rawChartData, pivotWith);
	var pieChartData = preparePieChartData(rawChartData, pivotWith);
	prepareBarChart(pivotWith, barChartData);
	preparePieChart(pivotWith, pieChartData);
}

function prepareBarChartData(rawChartData, pivotWith){
	var barChartRawData = {};
	$.each(rawChartData, function(key, dataSplice){
		if(barChartRawData.hasOwnProperty(dataSplice[pivotWith])){
			barChartRawData[dataSplice[pivotWith]]['data'][0]++;
		} else{
			barChartRawData[dataSplice[pivotWith]] = {
				name : dataSplice[pivotWith],
				data : [1]
			};
		}
	});

	var barChartData = $.map(barChartRawData, function(value, index) {
		return [value];
	});

	return barChartData;
}

function preparePieChartData(rawChartData, pivotWith){
	var pieChartRawData = {};
	var totalCount = 0;
	$.each(rawChartData, function(key, dataSplice){
		if(pieChartRawData.hasOwnProperty(dataSplice[pivotWith])){
			pieChartRawData[dataSplice[pivotWith]]++;
		} else{
			pieChartRawData[dataSplice[pivotWith]] = 1;
		}
		totalCount++;
	});

	var pieChartData = [];
	$.each(pieChartRawData, function(pivotName, count){
		pieChartData.push({
			name : pivotName,
			y : ((count * 100)/totalCount)
		});
	});
	return pieChartData;
}

function prepareBarChart(category, data){
	var barChart = Highcharts.chart('barChart', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Phone Sale Analysis'
        },
        xAxis: {
            categories: [category]
        },
        yAxis: {
            title: {
                text: 'Number Of Phones'
            }
        },
        series: data
	});
}

function preparePieChart(category, data){
	var pieChart = Highcharts.chart('pieChart', {
        chart: {
			type: 'pie',
			plotBackgroundColor: null,
        	plotBorderWidth: null,
        	plotShadow: false,
        },
        title: {
			text: 'Phone Sales Percentage'
		},
		tooltip: {
			pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: true,
					format: '<b>{point.name}</b>: {point.percentage:.1f} %',
					style: {
						color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
					}
				}
			}
		},
		series: [{
			name: category,
			colorByPoint: true,
			data: data
		}]
	});
}