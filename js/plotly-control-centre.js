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
      var data = {x:[], y:[], type: "scatter"};

      var xAxis = function(){
        var key = this.innerHTML;
        data.x = []; // clear out the old data set

        plotData.map(function(d){
          data.x.push(d[key]);
        });

        generate();
      };

      var yAxis = function(){
        var key = this.innerHTML;
        data.y = [];

        plotData.map(function(d){
          data.y.push(d[key]);
        });

        generate();
      };

      var generate = function(){
        if(data.x.length >0 && data.y.length > 0){
          Plotly.newPlot("actual-chart-" + uniqueId, [data]);
        }
      };

      $(docEl).on("click", ".x-axis", xAxis);
      $(docEl).on("click", ".y-axis", yAxis);
    };

    var chart = xyChart();
  };

  return {
    controlCentre: createControlCentre
  };
})();
