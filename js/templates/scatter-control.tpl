<template>
  <div id="chart-{{id}}" class="pure-g">
    <div class="pure-u-1-8">
      <h3>X Axis</h3>
      <ul>
        {{#each keys}}
          <li class="button-xsmall pure-button x-axis">{{name}}</li>
        {{/each}}
      </ul>
    </div>
    <div class="pure-u-1-8">
      <h3>Y Axis</h3>
      <ul>
        {{#each keys}}
          <li class="button-xsmall pure-button y-axis">{{name}}</li>
        {{/each}}
      </ul>
    </div>
    <div class="pure-u-1-8">
      <h3>Groups</h3>
      <select id="group-aggregation-{{id}}">
        <option value="sum">Sum</option>
        <option value="avg">Average</option>
      </select>
      <ul>
        <li class="button-xsmall pure-button groups">None</li>
        {{#each keys}}
          <li class="button-xsmall pure-button groups">{{name}}</li>
        {{/each}}
      </ul>
    </div>
    <div id="messages-{{id}}" class="pure-u-1 messages"></div>
    <div id="actual-chart-{{id}}" class="pure-u-1"></div>
  </div>
</template>
