YUI.add('chartTypes',function(Y){

	var chartTypes = {
		"bar":{
			ycount:1,
			yaxis:{
				tickFormatter:FORMATTERS['kilo']
			},
			bars : {
	    		show : true,
	    		shadowSize : 0,
	    		barWidth : 0.5
			},
			mouse : { 
				track : true,
				trackAll : true 
			}
		},
		"line":{
			ycount:1,			
			yaxis:{
				tickFormatter:FORMATTERS['kilo']
			},
			parseFloat:false,
			mouse : { 
				track : true,
				sensibility:7,
				trackFormatter : TRACK_FORMATTERS.time
			}
		},
		"bubble":{
			ycount:2,
			bubbles : { 
				show : true, 
				baseRadius : 5 
			},
			mouse : {
				track : true,
				trackAll : true
			}
		},
		"candle":{
			ycount:4,
		    candles : { show : true, candleWidth : 0.6 },
		    xaxis   : { noTicks : 10 }
		},
		"pie":{
			pie : {
		    	show : true, 
		    	explode : 6
		    },
			xaxis : { showLabels : false },
			yaxis : { showLabels : false },
		    grid : {
    			verticalLines : false,
      			horizontalLines : false
    		},
    		legend : {
			    position : 'se',
		    	backgroundColor : '#D2E8FF'
		    },
		    mouse : { track : true }
		}
	}
	
	
	Y.ChartTypes = chartTypes;
});