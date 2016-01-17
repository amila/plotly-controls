<template>
  <div id="control-panel_{{id}}">
    <h3>X</h3>
    <ul>
      {{#each keys}}
        <li class="x-axis">{{name}}</li>
      {{/each}}
    </ul>
    <h3>Y</h3>
    <ul>
      {{#each keys}}
        <li class="y-axis">{{name}}</li>
      {{/each}}
    </ul>
    <h3>Groups</h3>
    <ul>
      {{#each keys}}
        <li class="groups">{{name}}</li>
      {{/each}}
    </ul>
    <div id="actual-chart-{{id}}"></div>
  </div>
</template>
