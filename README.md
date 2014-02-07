There are many tools out there for drawing graphs in the browser, but most of them require you to know JavaScript well to get anywhere.

line.js is different. Anyone who knows a bit of HTML can get this thing to work.

Here's how it works. Put a data table in your HTML document. Something like this:

    <figure class='graph line'>
     <table>
      <tr><th>Monday</th>    <td>9</td></tr>
      <tr><th>Tuesday</th>   <td>3</td></tr>
      <tr><th>Wednesday</th> <td>4</td></tr>
      <tr><th>Thursday</th>  <td>5</td></tr>
      <tr><th>Friday</th>    <td>7</td></tr>
      <tr><th>Saturday</th>  <td>1</td></tr>
      <tr><th>Sunday</th>    <td>2</td></tr>
     </table>
     <figcaption>Coffees per day, week 5.</figcaption>
    </figure>

Then pull in the line.js script and stylesheet. Bam, you have a graph.

Currently, line.js can draw simple line graphs and Edward Tufe-style sparklines. Here is a demo with annotated source code:

http://wja.no/e/line.js/demo.html

Download a copy of this repository, start editing that file, and you're ready to go.

line.js is available under the MIT license, which basically says “you can use this for anything you want”.

== Plans ahead ==

line.js is a spin-off from a project at the WJA development agency, and still in its infancy.

The next step for the project is to allow authors to customize their graphs in the same declarative way as you'd fill it with data. By setting your preferred classes for the graph, its behaviour would change. So you could do: 

    <figure class='graph multiple xaxis yaxis hover legend'>
     <table>
      <thead>
       <tr>
        <th></th>
        <th data-icon='♘' data-color='blue'>Player 1</th>
        <th data-icon='♗' data-color='red'>Player 2</th>
       </tr>
      </thead>
      <tr>
       <th>Round 1</th>
       <td>3</td>
       <td>7</td>
      </tr>
      ....
     </table>
     <figcaption>Points per round.</figcaption>
    </figure>

This will allow us to make graphs like this prototype example:

http://wja.no/t/mm-slides/browsers.html

