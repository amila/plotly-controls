
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

// all the charts we support
var charts = (function(){
  var keyAttributes, plotData, chartId;

  var getAttributes = function(chartData){
    plotData = chartData;
    keyAttributes = Object.keys(plotData[0]).map(function(key){ return {name: key} });
  }

  var generateChart = function(uniqueId, docEl, chartData){
    chartId = "chart-" + uniqueId;
    //if(chartType === "scatter"){
      return generalChart(uniqueId, docEl, chartData);
    //}
  }

  var generalChart = function(uniqueId, docEl, chartData){
    var chartType = "scatter";
    var data = [{x:[], y:[], type: this.chartType}];
    var xAxisKey, yAxisKey, groupKey;
    var events = {
      axisEvent: "axisEvent",
      groupEvent: "groupEvent"
    };

    getAttributes(chartData);

    var output = templates["scatter-control"]({id: uniqueId, keys: keyAttributes});
    docEl.append(output);

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

      if(whatChanged === events.axisEvent && groupKey === undefined ){
        for(i=0;i<data.length;i++){
          data[i].y = []; // clear out the old data set
          data[i].x = [];


          plotData.map(function(d){
            data[i].x.push(d[xAxisKey]);
            data[i].y.push(d[yAxisKey]);
          });

        }
      }

      if (whatChanged == events.groupEvent || groupKey !== undefined) {
        var groupedData = [];
        data = [];

        plotData.map(function(d){
          var keyValue = d[groupKey];

          if(groupedData[keyValue] === undefined){
            groupedData[keyValue] = {x:[], y:[]};
          }
          groupedData[keyValue].x.push( d[xAxisKey] );
          groupedData[keyValue].y.push( d[yAxisKey] );

        });

        var groupKeys = Object.keys(groupedData);
        for(i=0;i<groupKeys.length;i++){
          data[i] = groupedData[groupKeys[i]];
          data[i].name = groupKeys[i];
          data[i].type = chartType;
        }
      }

      generate();
    };

    var generate = function(){
      if(data[0].x.length >0 && data[0].y.length > 0){
        Plotly.newPlot("actual-chart-" + uniqueId, data);
      }
    };

    var changeChartType = function(cType){
      console.log(chartType);
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

      $("#" + chartId).remove();
    };


    $(docEl).on("click", ".x-axis", xAxisClick);
    $(docEl).on("click", ".y-axis", yAxisClick);
    $(docEl).on("click", ".groups", groupingClick);

    return {
      id: "chart-" + uniqueId,
      remove : removeChart,
      changeChartType : changeChartType
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
