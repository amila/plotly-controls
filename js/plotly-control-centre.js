var PlotlyControlCentre = (function(){

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

    loadTemplate("main-control", "js/templates/main-control.tpl");
    return theTemplates;
  })();

  var createControlCentre = function(id, plotData){
    var uniqueId = Math.random();
    var docEl = $(id);

    var keyAttributes = Object.keys(plotData[0]).map(function(key){ return {name: key} });
    var output = templates["main-control"]({id: uniqueId, keys: keyAttributes});
    docEl.append(output);

    var xyChart = function(){
      var data = [{x:[], y:[], type: "scatter"}];
      var xAxisKey, yAxisKey, groupKey;
      var events = {
        axisEvent: "axisEvent",
        groupEvent: "groupEvent"
      }

      var xAxisClick = function(){
        xAxisKey = this.innerHTML;
        createData(events.axisEvent);
        generate();
      };
      var yAxisClick = function(){
        yAxisKey = this.innerHTML;
        createData(events.axisEvent);
        generate();
      };

      var groupingClick = function(){
        groupKey = this.innerHTML;
        createData(events.groupEvent);
        generate();
      }



      var createData = function(whatChanged){
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
          }
        }
      };

      var generate = function(){
        if(data[0].x.length >0 && data[0].y.length > 0){
          Plotly.newPlot("actual-chart-" + uniqueId, data);
        }
      };

      $(docEl).on("click", ".x-axis", xAxisClick);
      $(docEl).on("click", ".y-axis", yAxisClick);
      $(docEl).on("click", ".groups", groupingClick);
    };

    var chart = xyChart();
  };

  return {
    controlCentre: createControlCentre
  };
})();
