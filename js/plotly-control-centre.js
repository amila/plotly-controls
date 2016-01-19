
// store all of the templates in here
// can be retrieved by using templateMap["name of template"]

var templates = (function(){
  var theTemplates = {};
  var loadTemplate = function(templateName, templatePath){
    $.get({
      url: templatePath,
      success: function(data){
        theTemplates[templateName] = Handlebars.compile(data.activeElement.innerHTML);
      },
      async: false
    });
  };

  loadTemplate("scatter-control", "js/templates/scatter-control.tpl");
  loadTemplate("chart-chooser", "js/templates/chart-chooser.tpl");
  return theTemplates;
})();

var aggregationFactory = function(chartId, callback){

  var sum = function(data){
    var x = data.x;
    var y = data.y;

    var newX = [], newY = [];

    for(var i=0;i<x.length;i++){
      newX[x[i]] = x[i];
      if(newY[x[i]] === undefined){
        newY[x[i]] = 0;
      }
      newY[x[i]] += y[i];
    }

    data.x = _.keys(newX);
    data.y = _.values(newY);

    return data;
  }
  var avg = function(data){
    var x = data.x;
    var y = data.y;

    var newX = [], newY = [];
    for(var i=0;i<x.length;i++){
      if(newX[x[i]] === undefined){
        newX[x[i]] = 0;
      }
      newX[x[i]] += 1; // counter

      if(newY[x[i]] === undefined){
        newY[x[i]] = 0;
      }
      newY[x[i]] += y[i];
    }

    data.x = _.keys(newX);
    data.y = [];

    for(var i=0;i<data.x.length;i++){
      // get the count for the key
      var k = data.x[i];
      data.y.push( newY[k] / newX[k] );
    }

    return data;
  }

  $("#group-aggregation-" + chartId).on("change",function(){
    var selected = $(this).val();
    var calculation = sum;

    if (selected === "avg") {
      calculation = avg;
    }

    callback(calculation);
  });

  return {
    sum: sum,
    avg: avg
  };
}


// all the charts we support
var charts = (function(){
  var keyAttributes, plotData, chartId;

  var getAttributes = function(chartData){
    plotData = chartData;
    keyAttributes = Object.keys(plotData[0]).map(function(key){ return {name: key} });
  }

  var generateChart = function(uniqueId, docEl, chartData){
    chartId = uniqueId;
    return generalChart(uniqueId, docEl, chartData);
  }

  var postMessage = function(message){
    $("#messages-" + chartId).text( message );
  };

  var generalChart = function(uniqueId, docEl, chartData){
    var chartType = "scattergl";
    var data = [{x:[], y:[], type: this.chartType}];
    var xAxisKey, yAxisKey, groupKey;
    var events = {
      axisEvent: "axisEvent",
      groupEvent: "groupEvent"
    };

    getAttributes(chartData);

    var output = templates["scatter-control"]({id: uniqueId, keys: keyAttributes});
    docEl.append(output);

    var aggregationMethod = undefined;
    var aggregation = aggregationFactory(uniqueId, function(aggMethod){

      aggregationMethod = aggMethod;
      transformData(events.groupEvent);
    });
    aggregationMethod = aggregation.sum;

    var xAxisClick = function(){
      xAxisKey = this.innerHTML;
      highlightSelected($(this).parent().children(), xAxisKey, "x-axis");
      transformData(events.axisEvent);
    };
    var yAxisClick = function(){
      yAxisKey = this.innerHTML;
      highlightSelected($(this).parent().children(), yAxisKey, "y-axis");
      transformData(events.axisEvent);
    };
    var groupingClick = function(){
      groupKey = this.innerHTML;
      highlightSelected($(this).parent().children(), groupKey, "groups");
      transformData(events.groupEvent);
    };

    var highlightSelected = function(group, selectedOption, groupClass){
      group.map(function(id, option){
        $(option).removeClass(groupClass);

        if(option.innerHTML === selectedOption){
          $(option).addClass("pure-button-disabled");
        }else{
          $(option).removeClass("pure-button-disabled");
          $(option).addClass(groupClass);
        }

      })
    };

    // transform the data depending on
    // what event happened
    var transformData = function(whatChanged){
      // we definitely need an x and y axis defined
      if(xAxisKey === undefined && yAxisKey === undefined){
        return;
      }

      if(whatChanged === events.axisEvent && groupKey === undefined
        && (xAxisKey !== undefined && yAxisKey !== undefined)){
        for(i=0;i<data.length;i++){
          data[i].y = []; // clear out the old data set
          data[i].x = [];

          plotData.map(function(d){
            data[i].x.push(d[xAxisKey]);
            data[i].y.push(d[yAxisKey]);
          });

        }

        if(plotData.length > 1000){
          postMessage("There's way too much data.  Chart will not be generated until a grouping criteria is selected.");
          return;
        }
      }

      if (whatChanged == events.groupEvent || groupKey !== undefined) {
        var groupedData = [];
        data = [];

        // map the data to the x and y
        // temporarily
        plotData.map(function(d){
          var keyValue = d[groupKey];

          if(groupedData[keyValue] === undefined){
            groupedData[keyValue] = {x:[], y:[]};
          }
          groupedData[keyValue].x.push( d[xAxisKey] );
          groupedData[keyValue].y.push( d[yAxisKey] );

        });

        var groupKeys = Object.keys(groupedData);
        // now bring the newly grouped data back
        // to the final data object

        for(var i=0;i<groupKeys.length;i++){
          data[i] = groupedData[groupKeys[i]];
          if(groupKey !== "None"){
            data[i] = aggregationMethod(data[i]);
          }

          data[i].name = groupKeys[i];
          data[i].type = chartType;
        }
      }

      generate();
    };

    var generate = function(){
      if(data[0].x.length >0 && data[0].y.length > 0){
        Plotly.newPlot("actual-chart-" + uniqueId, data);
        postMessage("");
      }
    };

    var changeChartType = function(cType){
      chartType = cType;
      for(i=0;i<data.length;i++){
        data[i].type = chartType;
      }

      generate();
    }

    var removeChart = function(){
      $(docEl).off("click", ".x-axis", xAxisClick);
      $(docEl).off("click", ".y-axis", yAxisClick);
      $(docEl).off("click", ".groups", groupingClick);

      $("#chart-" + chartId).remove();
    };


    $(docEl).on("click", ".x-axis", xAxisClick);
    $(docEl).on("click", ".y-axis", yAxisClick);
    $(docEl).on("click", ".groups", groupingClick);

    return {
      id: uniqueId,
      remove : removeChart,
      changeChartType : changeChartType,
      generate: generate
    };
  };

  return {
    generate : generateChart
  };
})();

var PlotlyControlCentre = (function(){

  var createControlCentre = function(id, plotData){
    var uniqueId = Math.random().toString(36).substring(7);
    var docEl = $(id);
    var theChart;

    var output = templates["chart-chooser"]({});
    docEl.append(output);


    theChart = charts.generate(uniqueId, docEl, plotData);

    $(docEl).on("change", "#chart-list", function(){
      var chartType = $(this).val();

      if(chartType === "none"){
        return;
      }
      theChart.changeChartType(chartType);
    });

    //var chart = charts.scatter(uniqueId, docEl, plotData);
  };

  return {
    controlCentre: createControlCentre
  };
})();
