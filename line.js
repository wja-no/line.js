(function(){


/*GraphLines*/
var processGraphLines = function(){
	var figs = document.getElementsByTagName('figure');

	var i, dl, graph, labels;
	for(i=0; i < figs.length; ++i){
		if(!figs[i].attributes['class']) continue;
		if(!hasClassValue(figs[i].attributes['class'].nodeValue,
				'graph line')) continue;
		dl = fetchGraphLine(figs[i]);
		graph = drawGraphLine(dl, figs[i]);
		
		labels = dl[1];

		markHover(graph, labels, figs[i]);

	}
}; 


var fetchGraphLine = function(root){
	var tableLength = -1;
 	
  var table = findFirstChild(root, compTag('table'));
  if(!table) throw new Error('No table form');

	var bd = table.tBodies[0];
	var tr = bd.getElementsByTagName('tr');
	if(!tr.length) throw new Error('No table rows');
	var dl = new Array(2);
	dl[0] = new Array(tr.length); dl[1] = new Array(tr.length);

	var r, y, z;
	for(r = 0; r < tr.length; ++r){
  	z = findFirstChild(tr[r], compTag('td')).firstChild.nodeValue;
		y = parseInt(z, 10);
		dl[0][r] = {x: r, y: y};
		dl[1][r] = findFirstChild(tr[r], compTag('th')).firstChild.nodeValue;
	}

	return dl;
}; 


var drawGraphLine = function(dl, root){
  var data = dl[0];
	var draw = setDraw(root);
	var GraphSetup =	{
		element: draw,
		//CSS
		renderer: 'line',
		strokeWidth: 1,
		padding: { top: 0.03, right: 0.005, bottom: 0.03, left: 0.005 },
		series: [
		{
			color: "#30AFEF",
			data: data,
			name: 'Besøk pr. dag, Store Norske Leksikon, 2012'
		}
		]
	};

	var graph = new Rickshaw.Graph(GraphSetup);
	storeGraphLine(graph);
  return graph;
}; 


var markHover = function(graph, labels, context){
	var HoverSetup =  {
		xLab : arraySetter(labels),

		render: function(args) {

			args.detail.sort(function(a, b) { return a.order - b.order }).forEach( function(d) {

				var points = args.points;
				var point = points.filter(function(p) {return p.active}).shift();
				var formattedXValue = point.formattedXValue;
				var formattedYValue = point.formattedYValue;

				var dot = document.createElement('div');
				dot.className = 'dot';
				dot.style.top = graph.y(d.value.y0 + d.value.y) + 'px';
				dot.style.borderColor = d.series.color;

				this.element.appendChild(dot);
				dot.className = 'dot active';

				var xLabel = document.createElement('div');
				xLabel.className = 'x_label';

				xLabel.innerHTML = this.xLab(args.domainX);
				this.element.appendChild(xLabel);
				this.show();

			}, this );
		}
	};

	var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, HoverSetup);
	var hover = new Hover( { graph: graph } ); 
}; 


/*Sparklines */

var processSparkLines = function(){
	var sparks = document.getElementsByTagName('figure');
	sparks = nodeListToArray(sparks);

	var i,j, dl, graph, datas, dates, titles, da, ti, sec, par;
	for(i = 0; i < sparks.length; ++i){
  	if(!sparks[i].attributes['class']) continue;
		if(!hasClassValue(sparks[i].attributes['class'].nodeValue, 
				'graph sparklines')) continue;
		dl = fetchSparkLine(sparks[i]);
		datas = dl[0];
		dates = dl[1];
		titles = dl[2];

		sec = createEl(undefined, 'section', {name: 'class', value: 'graph sparklines'}, undefined);
		par = sparks[i].parentNode;
		sec =  par.insertBefore(sec, sparks[i]);
		
		for(j = 0; j < datas.length; ++j){
    	da = datas[j];
			ti = titles[j];
			var graph = drawSparkLine(da, dates, ti, sec);
		}

	}

};


var fetchSparkLine = function(root){
	var rows, cols, datas, labels, titles, th, tr, td, tBody, tHead, i,j, y,z, dl;
	rows = cols = -1;
	
	var table = findFirstChild(root, compTag('table'));
	if(!table) throw new Error('Missing table sparklines');

	tBody = table.tBodies[0];
	tHead	= table.tHead;
  th = tHead.getElementsByTagName('th');
	titles = new Array(th.length -1);
	cols = titles.length;

	for(i = 1; i < th.length; ++i){
  	titles[i-1] = th[i].innerHTML;
	}
	
	tr = tBody.getElementsByTagName('tr');
	rows = tr.length;

	datas = new Array(cols); labels = new Array(rows);
	for(i = 0; i < datas.length; ++i){
  	datas[i] = new Array(rows);
	}
	for(j = 0; j < rows; ++j){
    td = tr[j].getElementsByTagName('td');
		labels[j] = tr[j].getElementsByTagName('th')[0].firstChild.nodeValue;
		for(i = 0; i < cols; ++i){
    	y = parseInt(td[i].firstChild.nodeValue, 10);
			datas[i][j] = {x: j, y: y};
		}
	}
	
	dl = new Array(3);
	dl[0] = datas; dl[1] = labels; dl[2] = titles;
	return dl;
};


var drawSparkLine = function(data, dates, name, root){
	var a, textName,div, draw, figcap;
  

	a = setPara(name, root);
	textName = getText(name);
	div = a.getElementsByTagName('div');
	filter(div, classFilter('draw'), function(el){
  	draw = el;
	});
	figcap = a.getElementsByTagName('figcaption')[0];

 var GraphSetup =	{
		//TODO Try other.find or delete other 
		element: draw,
		//CSS OUT
		width: 275,
		height: 48,
		figcaption: figcap,
		renderer: 'line',
		strokeWidth: 1,
		padding: { top: 0, right: 0, bottom: 0, left: 0 },
		series: [
		{
			color: "#30AFEF",
			data: data,
			name: textName
		}
		]
	};

	var graph = new Rickshaw.Graph(GraphSetup);
	graph.render();
	//markHover still old
	markHoverSpark(graph, dates, a);

  return graph;  

}; 


var markHoverSpark = function(graph, labels, root){
	var span = nodeListToArray(root.getElementsByTagName('span'));
	var date = null;
	filter(span, classFilter('date'), function(node){
		date = node;
	});

	var HoverSetup =  {
		xLab : arraySetter(labels),

		render: function(args) {

			args.detail.sort(function(a, b) { return a.order - b.order }).forEach( function(d) {

				var points = args.points;
				var point = points.filter(function(p) {return p.active}).shift();
				var formattedXValue = point.formattedXValue;
				var formattedYValue = point.formattedYValue;

				var dot = document.createElement('div');
				dot.className = 'dot';
				dot.style.top = graph.y(d.value.y0 + d.value.y) + 'px';
				dot.style.borderColor = d.series.color;

				this.element.appendChild(dot);
				dot.className = 'dot active';

        date.innerHTML = this.xLab(args.domainX);
				this.show();

			}, this );
		}
	};

	var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, HoverSetup);
	var hover = new Hover( { graph: graph } ); 
};
   
var conf1200 = {width: 1175, height: 275, strokeWidth: 1.4};
var conf900 = {width: 875, height: 225, strokeWidth: 1.4};                
var conf600 = {width: 575, height: 150, strokeWidth: 1.1};
var conf300 = {width: 275, height: 50, strokeWidth: 1};


var list1200 = function(mq){
	if(mq.matches){
		resizeGraphLines(conf1200);
	}
};
var list900 = function(mq){
	if(mq.matches){
		resizeGraphLines(conf900);
	}
};
var list600 = function(mq){
	if(mq.matches){
		resizeGraphLines(conf600);
	}
};
var list300 = function(mq){
	if(mq.matches){
		resizeGraphLines(conf300);
	}
};

var arGraphLines = new Array();

var rendGraphLine = function(graph, conf){
	graph.configure(conf);
	graph.update();
}

var resizeGraphLines = function(conf){
	for(var i = 0; i < arGraphLines.length; ++i){
		rendGraphLine(arGraphLines[i], conf);  	
	}
};

var compTag = function(tagName){
	return function(node){
		if(node.nodeName.toLowerCase().valueOf() === tagName.toLowerCase().valueOf()) return true;
		return false;
	};
}

var findFirstChild = function(root, comp){
	var el = root.firstChild;
	while(el){
		if(comp(el)) return el;
		el = el.nextSibling;
	}
	return null;
};

/*1-indexed*/
var getnthChild = function(root, n){
	var el = root.firstChild;
	var i = 1;
	while(el){
		if(i++ === n) break;
		el = el.nextSibling;
	}
	return el;
};


var arraySetter = function(ar){
	return function(i){
		return ar[i];
	};
}; 


var createEl = function(verb, type, attributes, root){
	var method = 'createElement';
	if(type === 'text') method = 'createTextNode';
	var el = document[method](type==='text' ? attributes : type);
	if(attributes && attributes.name && attributes.value){
		el.setAttribute(attributes.name, attributes.value);
	}
	if(attributes && attributes.innerHTML){
  	el.innerHTML = attributes.innerHTML;
	}
	if(!verb) return el;
 	return root[verb](el);
};          


var filter = function(ar, filter, callback){
	var i;
	for(i = 0; i < ar.length; ++i){
  	if(filter(ar[i])) callback(ar[i]);
	}
};

var classFilter = function(classValue){
	return function(node){
		if(!node.attributes['class']) return false;
		return hasClassValue(node.attributes['class'].nodeValue, classValue);
	};
};


var prepend = function(type, attributes, root){
	var method = Element.prototype.appendChild;
 	var el = createEl(undefined, type, attributes, root);
 	var argu = [el];  
	if(root.firstChild){
		method = Element.prototype.insertBefore;
		argu.push(root.firstChild);
	}
	return method.apply(root, argu);
};

var setDraw = function(root){
	var chart = prepend('div', {name: 'class', value: 'chart-container'},
			root);
	return createEl('appendChild', 'div', {name: 'class', value: 'draw'}, chart);

};


var extractAttrib = function(str, attrib){
  /*We use the built in functions of the browser instead of
	 *a string matching solution. Faster?*/
	var el = document.createElement('div');
	el.innerHTML = str;
	return (el.firstChild ? el.firstChild.getAttribute(attrib) : null);
};

var getText = function(str){
	var i, beg, end, first;
	firstEnd = true;
	for(i = 0; i < str.length; ++i){
  	if(str[i] === '>') beg = i;
		if(str[i] === '<'){
			if(firstEnd){
				firstEnd = false;
				continue;
			}
      end = i;
			break;
		}
	}
	return str.substring(beg+1, end);	
};


var nodeListToArray = function(nL){
	var array, i; 
	array= new Array(nL.length);
	for(i = 0; i < nL.length; ++i){
  	array[i] = nL[i];
	}
	return array;
};


var setPara = function(name, root){
	var link = extractAttrib(name, 'href');
	var prop, a, caphtml;
	prop= {};
	if(link) prop = {name: 'href', value: link};
	var fig = createEl('appendChild', 'figure', {}, root);
	a = prepend('a', prop, fig);
	caphtml = getText(name) + " <span class='date'></span>";
	prepend('figcaption', {innerHTML : caphtml}, a);
	prepend('div', {name: 'class', value: 'draw'}, a);

	return a;
};



var split = function(str){
	var i;
	var words = []; var newWord = true; var beg = -1;
	for(i = 0; i < str.length; ++i){
		if(str[i] !== ' '){
			if(newWord){
				newWord = false;
				beg = i;
			}
			if(i+1=== str.length){
       	words.push(str.substring(beg,i+1));
			}
		}
		else{
			if(!newWord){
				newWord = true;
				words.push(str.substring(beg, i));
			}
		}
	}
	return words;  	
};



/*case sensitive*/
var hasClassValue = function(elValStr, hasValStr){
	var elVal = split(elValStr);
	var hasVal = split(hasValStr);

	var i, j;
	var found = true;
	for(i = 0; i < hasVal.length; ++i){
		if(!found) return false;
		found = false;
  	for(j = 0; j < elVal.length; ++j){
			if(hasVal[i].valueOf() === elVal[j].valueOf()){
      	found  = true;
				break;
			}
		}
	}
	if(!found) return false;

	return true;
};


var clearTables = function(){
	arGraphLines = new Array();
};

var storeGraphLine = function(graph){
	arGraphLines.push(graph);
}


var allGraphs = function(){
	processGraphLines();
	processSparkLines();
};

var renderAll = function(){
	if(window.matchMedia){
		var mq1200 = window.matchMedia("(min-width: 1225px)");
		mq1200.addListener(list1200);
		var mq900 = window.matchMedia("(min-width: 925px) and (max-width: 1224px)");
		mq900.addListener(list900);
		var mq600 = window.matchMedia("(min-width: 625px) and (max-width: 924px)");
		mq600.addListener(list600);
	  var mq300 = window.matchMedia("(max-width: 624px)");
		mq300.addListener(list300);

		list1200(mq1200);
		list900(mq900);
		list600(mq600);
		list300(mq300); 
	}
	else{
  	resizeGraphLines(conf1200);
	}
 	
};

window.onload = function(){

	allGraphs();
	renderAll();
}; 


})();
