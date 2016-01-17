<template>
  <div id="control-panel_{{id}}">
    <h3>Keys</h3>
    <ul>
      {{#each keys}}
        <li class="x-axis">{{name}}</li>
      {{/each}}
    </ul>

    <ul>
      {{#each keys}}
        <li class="y-axis">{{name}}</li>
      {{/each}}
    </ul>
    <div id="actual-chart-{{id}}"></div>
  </div>
</template>
