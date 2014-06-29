
/*	Global Variables
 *	app.totCells     - Total # of cells on board
 *  app.currentLevel - Current level (out of 4)
 *  app.totSolved    - Total # of solved Icons for current level
 *  app.totIcons     - Total # of Icons on board for current level
 *  app.First        - Object containing Data of first cell selected
 *  app.second       - Object containing Data of second cell selected
 */



var app = {

	init: function(){
		
		app.totCells = 144;
		app.currentLevel = 1;
		var gamegrid = $('#gamegrid');

		var cellStart = '<div class=cell id=';
		var cellEnd = "></div>";
		var cellHTML = '';

		// Append all the cells to the DOM
		for (var i = 1; i < app.totCells+1; i++) {
			cellHTML =  cellStart+i+cellEnd;
			gamegrid.append(cellHTML);
			cellHTML = cellStart;
		}

		app.buildIcons(app.currentLevel);
	},

	eventListeners: function(){
		
		var select; // Test if selected

		$('.cell').on('click', function(event){
				
				event.preventDefault();

				if (select === false){
					select = true;
					app.first = $(this).data();
				} 
				else {

					if ( app.getId( $(this).data().x,$(this).data().y) === app.getId( app.first.x, app.first.y) ){
						console.log('no same onez1!!');
						select = false;
					}
					else{
						select = false;
						app.second = $(this).data();

						app.checkMatch();
					}
				}

		});



	},

	buildIcons: function(level){

		app.totSolved = 0;  // Reset # of solved icons

		var distribution,   // Array representing # of times each icon has been Drawn
		    totDistributed, // Int keeps track of total number of icons drawn
		    totalOutput,    // Int Total # of icons to be outputed
		    rows, columns,  // Int rows & columns on grid
		    icon,           // Object retrieved from icons.js containing id and color/background
		    odd,            // Boolean determining if found any odd icons
		    start,          // Starting location of where to start drawing icons
		    selector,       // String representing # for jQuery calls
		    sum;            // Int that determines which id on board to target


		function init(level){


			distribution = new Array(icons.length);
			for (var k = 0; k < icons.length; k++) {
				distribution[k] = 0;
			}


			switch(level) {
				case 1: 
					start = 27;
					rows = 8;
					columns = 8;
					break;
				case 2:
					start = 14;
					rows = 10;
					columns = 10;
					break;
				case 3:
					start = 13;
					rows = 10;
					columns = 12;
					break;
				case 4:
					start = 1;
					rows = 12;
					columns = 12;
					break;
			}

			totalOutput =  rows * columns;
			app.totIcons = totalOutput; // Total # of icons to be solved
			totDistributed = 0;
			selector = '#';

		}
			


		init(level);

		for (var i = 0; i < columns; i++) {
			for(var j = 0; j < rows; j++){
				sum = start + i + j*12; //id on grid
				var sel = $(selector+sum);
				

				// Ensure everything has a match when close to limit
				if (totalOutput - totDistributed <= icons.length){

					odd = false; // Test if found odd # of a distributed icon
					
					// Iterate through distribution and test to see what is odd
					for (var k = 0; k < distribution.length; k++){

						// If odd number distributed, get that icon to even out
						if (distribution[k] % 2 === 1 ){
							icon = icons[k];
							
							odd = true;
							break;
						}
					}
					// Else all icons are evenly distributed
					if (odd === false){
						// Get random icon
						icon = app.getIcon();						
					}
				}

				else 
					icon = app.getIcon();

				// Increase tot distributed for that particular Icon
				distribution[icon.id]++; 
				// Increase total icons distributed
				totDistributed++;
				
				var color = icon.color;
				sel.css('background-color',color);
				sel.data('id',color);
				sel.data('solved',false);
				sel.data('x',app.getX(sum));
				sel.data('y',app.getY(sum));
			}	
		}
	},

	// Randomly select and Icon
	// @return Object - Icon from Icons.js
	getIcon: function() {
		var rand = Math.floor((Math.random() * (icons.length)));
		return icons[rand];
	},

	// If id % 12 = 0 then on 12th column, return 12, else return id % 12
	// @param id - represents an position on the grid from 1-144
	// @return int - An x coordinate representing which column the icon is on 
	getX: function(id) {
		return (id % 12 === 0) ? 12 : id % 12; 
	},

	// Return which row cell falls on based on 12 cells in a row
	// @param id - represents an position on the grid from 1-144
	// @return int - An y coordinate representing which row the icon is on
	getY: function(id) {
		return Math.ceil(id/12);
	},

	getId: function(x,y){
		// Y ordering starts at 1, account for this
		return(x + 12 * (y-1));
	},

	checkMatch: function(){
		
		// If they are both the same icon
		if (app.case0(app.first,app.second) === true){
			// If they are both on same X or Y axis
			if (app.case1(app.first,app.second) === false)
				// If they can be matched through U or L shaped paths
				if(app.case2(app.first,app.second) === false)
					// Attempt to match through Zig-Zag pattern
					app.case3(app.first,app.second);
		}
		else 
			console.log("Try to select the same Icon"); // Not same Icon
	},

	matchSuccess: function(first,second) {
		cell1 =  $('#'+app.getId(first.x,first.y));
		cell2 =  $('#'+app.getId(second.x,second.y));

		cell1.data('solved',true);
		cell1.data('id',null);
		cell2.data('solved',true);
		cell2.data('id',null);
		cell1.css('background-color','black');
		cell2.css('background-color','black');

		// Just matched two squares.
		app.totSolved = app.totSolved + 2;

		app.testLevelCompletion();

	},

	testLevelCompletion: function() {

		if (app.totSolved === app.totIcons) {
			console.log("win");
			app.currentLevel++;
			app.buildIcons(app.currentLevel);
		}
	},

	// Make sure both cells are actually same type of icon
	case0: function(first,second) {
		// If either id has matched 
		if (first.solved === true || second.solved === true)
			return false;
		return (first.id === second.id) ? true : false;
	},

	// Two cells in either the same row or column
	case1: function(first,second) {
		
		var cordX = first.x, cordY = first.y, solved = false, cell;

		/*************************/

		// If they are both on same column
		if (first.x === second.x) {

			// If selected [1]
			//			    .
			//	       		.
			//	 		   [2]
			if (first.y < second.y){
				while (cordY < second.y){
					cordY++;
					cell = $('#'+app.getId(cordX,cordY));
					if(cordY === second.y){
						solved = true;
						break;
					}
					else if (cell.data().solved === false){
						solved = false;
						break;
					}
				}
			}

			//if selected [2]
			//			   .
			//			   .
			//			  [1]
			if (first.y > second.y){
				while (cordY > second.y){
					cordY--;
					cell = $('#'+app.getId(cordX,cordY));
					if(cordY === second.y){
						
						solved = true;
						break;
					}
					else if (cell.data().solved === false){
						
						solved = false;
						break;
					}
				}
			}
		}

		/*************************/

		//if they are both on the same row
		else if (first.y === second.y){
			//
			// If selected [1] .... [2]
			//
			if (first.x < second.x){
				while (cordX < second.x){
					cordX++;
					cell = $('#'+app.getId(cordX,cordY));
					if (cordX === second.x){
						
						solved = true;
						break;
					}

					if (cell.data().solved === false){
						
						solved = false;
						break;
					}
				}
			}
			//
			// Else selected [2] .... [1]
			//
			else if (first.x > second.x){
				while (cordX > second.x){
					cordX--;
					cell = $('#'+app.getId(cordX,cordY));
					if (cordX === second.x){
						console.log('match!');
						solved = true;
						break;
					}
					if (cell.data().solved === false){
						
						solved = false;
						break;
					}
				}
			}
		}
		if (solved === true){
			app.matchSuccess(first,second);
			return true;

		}
		else {
			
			return false;
		}
	},// case1

	// U shapes
	case2: function(first,second) {
		var cordX = first.x, cordY = first.y, tempX, tempY, solved = false, cell;
		console.log("=================================");
		
		function init() {
			cordX = first.x; 
			cordY = first.y;
			solved = false;
		}

		// CASE A & B
		if (first.x < second.x){
			console.log("hit case A & B");


			// *********    CASE A    **********   
			//
			//  ............. 	 .....[2]    ..........
			//  : [X][X][X] :    : [X][X]    : [X][X] :
			// [1][X][X][X][2]  [1][X][X]   [1][X][X] :
			//                              [X][X][X][2]
	        if (!solved) {
	        	console.log("Case A");
	        	init();

				// While we haven't reached the top of the board
				while (cordY > 1 && solved !== true) {
					cordY--;// Move up 1 row
					console.log("moved up to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					// If the cell just moved up to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same columm
						while(cordX < second.x) {
							cordX++; // Move right 1 column
							console.log("moved right to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							// If we have moved up and right to the location
							if(cordY === second.y && cordX === second.x) {
								console.log("MATCH!!!! via Case A");
								solved = true;
								break;
							}
							// If the column we just moved to is not occupied
							if(cell.data().solved === true || cell.data().solved === undefined){
								// If reached same column, iterate down.
								if(cordX === second.x){
									// When we iterate down we change cordY, cache it to prevent infinite loop
									tempY = cordY;
									// While we haven't moved down far enough
									while (cordY < second.y){
										cordY++; // Move down
										console.log("moved down to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if(cordY === second.y) {
											console.log("MATCH!!!! via Case A");
											solved = true;
											break;
										}
										// Else if cell we just went to is occupied, break
										else if (cell.data().solved === false){
											console.log("no match;");
											break;
										}
									}// Third while
									// Reset to same cordY before going right and down.
									cordY = tempY;
								}	
							}
							// Else column moved to the right is occupied
							else
								break;
							
						}// 2nd while
						// Reset cordX since iterated to new cordY
						cordX = first.x;
					}
					// Else the cell above is occupied, break
					else
						break;
				}// First while
			}// ---- CASE A ----

			// *********    CASE B    **********   
			//
			//	[1][X][X]     [1][X][X]   [X][X][2]
			//	 : [X][X][2]   : [X][X]   [1][X] :
			//	 : [X][X] :    : [X][X]	   : [X] :
			//   :........:    :... [2]    :.....:              
			if (!solved){
				console.log("Case B");
				init();


				// While we haven't reached the bottom of the board
				while (cordY < 12 && solved !== true) {
					cordY++;// Move down 1 row
					console.log("moved down to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					// If the cell just moved down to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same column
						while(cordX < second.x) {
							cordX++; //move right  M column
							console.log("moved right to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							//if we have moved down and right to the location
							if(cordY === second.y && cordX === second.x) {
								console.log("MATCH!!!! via Case B");
								solved = true;
								break;
							}
							// If the column we just moved to is not occupied
							if(cell.data().solved === true || cell.data().solved === undefined){
								// If reached same column, iterate up.
								if(cordX === second.x){
									// When we iterate up we change cordY, cache it to prevent infinite loop
									tempY = cordY;
									// While we haven't moved up far enough
									while (cordY > second.y){
										cordY--; // Move up
										console.log("moved up to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if(cordY === second.y) {
											console.log("MATCH!!!! via Case B");
											solved = true;
											break;
										}
										// Else if cell we just went to is occupied, break
										else if (cell.data().solved === false){
											console.log("no match;");
											break;
										}
									}// Third while
									// Reset to same cordY before going right and up.
									cordY = tempY;
								}	
							}
							// Else column moved to the right is occupied
							else
								break;
							
						}// 2nd while
						// Reset cordX since iterated to new cordY
						cordX = first.x;
					}
					// Else the cell above is occupied, break
					else
						break;
				}// First while	

			}// ---- CASE B ----

		}// CASE A & B

		
		// CASE C & D
		if (first.y > second.y){
			console.log("hit case C & D");

			// *********    CASE C    ********** 
			//
			//   [2].......  [X][X][2]
			// 	 [X][X][X]:  [X][X] :
			//	 [X][1]...:  [1]....:
			if(!solved) {
				console.log("Case C");
				init();

				// While we haven't reached the far right of the board
				while (cordX < 12 && solved !== true) {
					cordX++;// Move right 1 column
					console.log("moved right to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					// If the cell just moved right to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same row
						while(cordY > second.y) {
							cordY--; // Move up 1 row
							console.log("moved up to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							// If we have moved right and up to the location
							if(cordY === second.y && cordX === second.x) {
								console.log("MATCH!!!! via Case E");
								solved = true;
								break;
							}
							// If the row we just moved to is not occupied
							if(cell.data().solved === true || cell.data().solved === undefined){
								// If reached same row, iterate left
								if(cordY === second.y){
									// When we iterate left we change cordX, cache it to prevent infinite loop
									tempX = cordX;
									// While we haven't moved left far enough
									while (cordX > second.x){
										cordX--; // Move left
										console.log("moved left to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if(cordX === second.x) {
											console.log("MATCH!!!! via Case C");
											solved = true;
											break;
										}
										// Else if cell we just went to is occupied, break
										else if (cell.data().solved === false){
											console.log("no match via C");
											break;
										}

									}// Third while
									// Reset to same cordY before going up and left
									cordX = tempX;
								}
							}
							// Else row moved up to is occupied
							else
								break;

						}// 2nd while
						// Reset cordX since iterated to new cordY
						cordY = first.y;
					}
					// Else the cell to left is occupied, break
					else
						break;
				}// 1st while
			}// ---- CASE C -----


			// *********    CASE D    ********** 
			//
			//   .......[2]  [2][X][X]
			// 	 :[X][X][X]   :[X][X]
			//	 :......[1]   :...[1]

			if(!solved) {
				console.log("Case D");
				init();

				// While we haven't reached the far left of the board
				while (cordX > 1 && solved !== true) {
					cordX--;// Move left 1 column
					console.log("moved left to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					// If the cell just moved left to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same row
						while(cordY > second.y) {
							cordY--; // Move up 1 row
							console.log("moved up to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							// If we have moved left and up to the location
							if(cordY === second.y && cordX === second.x) {
								console.log("MATCH!!!! via Case E");
								solved = true;
								break;
							}
							// If the row we just moved to is not occupied
							if(cell.data().solved === true || cell.data().solved === undefined){
								// If reached same row, iterate right
								if(cordY === second.y){
									// When we iterate right we change cordX, cache it to prevent infinite loop
									tempX = cordX;
									// While we haven't moved right far enough
									while (cordX < second.x){
										cordX++; // Move right
										console.log("moved right to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if(cordX === second.x) {
											console.log("MATCH!!!! via Case D");
											solved = true;
											break;
										}
										// Else if cell we just went to is occupied, break
										else if (cell.data().solved === false){
											console.log("no match via D");
											break;
										}
									}// Third while
									// Reset to same cordY before going up and right
									cordX = tempX;
								}
							}
							// Else row moved up to is occupied
							else
								break;

						}// 2nd while
						// Reset cordX since iterated to new cordY
						cordY = first.y;
					}
					// Else the cell to left is occupied, break
					else
						break;
				}// 1st while
			}// ---- CASE D -----


		} // CASE C & D


		// CASE E & F
		if (first.x > second.x){
			console.log("hit case E & F");
			

			// *********    CASE E    **********   
			//
			//  ............. 	[2].....    ..........
			//  : [X][X][X] :   [X][X] :    : [X][X] :
			// [2][X][X][X][1]  [X][X][1]   [2][X][X] :
			//                              [X][X][X][1]
	        if (!solved) {
	        	console.log("Case E");
	        	init();

				//while we haven't reached the top of the board
				while (cordY > 1 && solved !== true) {
					cordY--;//move up  M row
					console.log("moved up to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					//if the cell just moved up to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same column
						while(cordX > second.x) {
							cordX--; //move left  M column
							console.log("moved left to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							//if we have moved up and left to the location
							if(cordY === second.y && cordX === second.x) {
								console.log("MATCH!!!! via Case E");
								solved = true;
								break;
							}
							// If the column we just moved to is not occupied
							if(cell.data().solved === true || cell.data().solved === undefined){
								//if reached same column, iterate down.
								if(cordX === second.x){
									//when we iterate down we change cordY, cache it to prevent infinite loop
									tempY = cordY;
									//while we haven't moved down far enough
									while (cordY < second.y){
										cordY++; // Move down
										console.log("moved down to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if(cordY === second.y) {
											console.log("MATCH!!!! via Case E");
											solved = true;
											break;
										}
										// Else if cell we just went to is occupied, break
										else if (cell.data().solved === false){
											console.log("no match;");
											break;
										}
									}// Third while
									// Reset to same cordY before going left and down.
									cordY = tempY;
								}	
							}
							// Else column moved to the left is occupied
							else
								break;
							
						}// 2nd while
						// Reset cordX since iterated to new cordY
						cordX = first.x;
					}
					// Else the cell above is occupied, break
					else
						break;
				}// First while
			}// ---- CASE E ----

			// *********    CASE F    **********   
			//
			//	[1][X][X]     [1][X][X]   [X][X][2]
			//	 : [X][X][2]   : [X][X]   [1][X] :
			//	 : [X][X] :    : [X][X]	   : [X] :
			//   :........:    :... [2]    :.....: 
			if (!solved){
				console.log("Case B");
				init();


				// While we haven't reached the bottom of the board
				while (cordY < 12 && solved !== true) {
					cordY++;// Move down 1 row
					console.log("moved down to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					// If the cell just moved down to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same column
						while(cordX > second.x) {
							cordX--; //move left  M column
							console.log("moved left to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							//if we have moved down and left to the location
							if(cordY === second.y && cordX === second.x) {
								console.log("MATCH!!!! via Case F");
								solved = true;
								break;
							}
							// If the column we just moved to is not occupied
							if(cell.data().solved === true || cell.data().solved === undefined){
								// If reached same column, iterate up.
								if(cordX === second.x){
									// When we iterate up we change cordY, cache it to prevent infinite loop
									tempY = cordY;
									// While we haven't moved up far enough
									while (cordY > second.y){
										cordY--; // Move up
										console.log("moved up to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if(cordY === second.y) {
											console.log("MATCH!!!! via Case F");
											solved = true;
											break;
										}
										// Else if cell we just went to is occupied, break
										else if (cell.data().solved === false){
											console.log("no match;");
											break;
										}
									}// Third while
									// Reset to same cordY before going left and up.
									cordY = tempY;
								}	
							}
							// Else column moved to the left is occupied
							else
								break;
							
						}// 2nd while
						// Reset cordX since iterated to new cordY
						cordX = first.x;
					}
					// Else the cell above is occupied, break
					else
						break;
				}// First while	

			}// ---- CASE F ----


		}// CASE E & F

		// CASE G & H
		if (first.y < second.y){
			console.log("hit case G & H");

			// *********    CASE G    ********** 
			//
			//   [1].......  [1].....
			// 	 [X][X][X]:  [X][X] :
			//	 [X][2]...:  [X][X][2]
			if(!solved) {
				console.log("Case G");
				init();

				// While we haven't reached the far right of the board
				while (cordX < 12 && solved !== true) {
					cordX++;// Move right 1 column
					console.log("moved right to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					// If the cell just moved right to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same row
						while(cordY < second.y) {
							cordY++; // Move down 1 row
							console.log("moved down to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							// If we have moved right and down to the location
							if(cordY === second.y && cordX === second.x) {
								console.log("MATCH!!!! via Case G");
								solved = true;
								break;
							}
							// If the row we just moved to is not occupied
							if(cell.data().solved === true || cell.data().solved === undefined){
								// If reached same row, iterate left
								if(cordY === second.y){
									// When we iterate left we change cordX, cache it to prevent infinite loop
									tempX = cordX;
									// While we haven't moved left far enough
									while (cordX > second.x){
										cordX--; // Move left
										console.log("moved left to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if(cordX === second.x) {
											console.log("MATCH!!!! via Case G");
											solved = true;
											break;
										}
										// Else if cell we just went to is occupied, break
										else if (cell.data().solved === false){
											console.log("no match via G");
											break;
										}

									}// Third while
									// Reset to same cordY before going down and left
									cordX = tempX;
								}
							}
							// Else row moved down to is occupied
							else
								break;

						}// 2nd while
						// Reset cordX since iterated to new cordY
						cordY = first.y;
					}
					// Else the cell to left is occupied, break
					else
						break;
				}// 1st while
			}// ---- CASE G -----

			// *********    CASE H    ********** 
			//
			//   .......[1]   ....[1]
			// 	 :[X][X][X]   :[X][X]
			//	 :......[2]  [2]

			if(!solved) {
				console.log("Case H");
				init();

				// While we haven't reached the far left of the board
				while (cordX > 1 && solved !== true) {
					cordX--;// Move left 1 column
					console.log("moved left to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					// If the cell just moved left to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same row
						while(cordY < second.y) {
							cordY++; // Move down 1 row
							console.log("moved down to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							// If we have moved left and down to the location
							if(cordY === second.y && cordX === second.x) {
								console.log("MATCH!!!! via Case H");
								solved = true;
								break;
							}
							// If the row we just moved to is not occupied
							if(cell.data().solved === true || cell.data().solved === undefined){
								// If reached same row, iterate right
								if(cordY === second.y){
									// When we iterate right we change cordX, cache it to prevent infinite loop
									tempX = cordX;
									// While we haven't moved right far enough
									while (cordX < second.x){
										cordX++; // Move right
										console.log("moved right to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if(cordX === second.x) {
											console.log("MATCH!!!! via Case H");
											solved = true;
											break;
										}
										// Else if cell we just went to is occupied, break
										else if (cell.data().solved === false){
											console.log("no match via H");
											break;
										}
									}// Third while
									// Reset to same cordY before going up and right
									cordX = tempX;
								}
							}
							// Else row moved up to is occupied
							else
								break;

						}// 2nd while
						// Reset cordX since iterated to new cordY
						cordY = first.y;
					}
					// Else the cell to left is occupied, break
					else
						break;
				}// 1st while
			}// ---- CASE D -----



		}// Case G & H

		//final
		if (solved) {
			app.matchSuccess(first,second);
			return true;
		}
		else
			return false;

	},//case2

	//Zig Zagz
	case3: function(first,second) {
		var cordX = first.x, cordY = first.y, tempX, tempY, solved = false, cell;
		console.log("---------------------------------");
		
		function init() {
			cordX = first.x; 
			cordY = first.y;
			solved = false;
		}
		
		// Case I & J
		if (first.x < second.x){
			console.log("Entered Case I & J");

			// Case I
			//		  .....[2]
			//        :
			// [1]....:

			if (!solved){
				console.log("Case I");
				init();

				// While we reached the same column 
				while (cordX < second.x && !solved) {
					cordX++; // Go right one column
					console.log("moved right to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					// If the cell just moved right to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same row
						while (cordY > second.y) {
							cordY--; // Go up one row
							console.log("moved up to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							// If we have moved right and up to the location
							if (cordY === second.y && cordX === second.x) {
								console.log("Match! via Case I");
								solved = true;
								break;
							}
							// If the row we just moved up to is empty
							if (cell.data().solved === true || cell.data().solved === undefined) {
								// If we reached same row
								if (cordY === second.y) {
									// When we iterate across we change cordX, cache it to prevent havoc
									tempX = cordX;
									// While we haven't moved far enough right
									while (cordX < second.x) {
										cordX++; // Move right
										console.log("moved right to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if (cordX === second.x) {
											console.log("Match! via Case I");
											solved = true;
											break;
										}

									}// Third while
									// Reset to same cordX before going right and up
									cordX = tempX;				
								}
							}
							// Else row moved up to is occupied
							else
								break;
						}// 2nd while
						// Reset y cord after iterating up and right
						cordY = first.y;
					}
					// Else the cell to the right is occupied
					else
						break;

				}// first while

			}


			// Case J
			// [1].....
			//        :
			//        :....[2]

			if (!solved){
				console.log("Case J");
				init();

				// While we reached the same column 
				while (cordX < second.x && !solved) {
					cordX++; // Go right one column
					console.log("moved right to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					// If the cell just moved right to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same row
						while (cordY < second.y) {
							cordY++; // Go down one row
							console.log("moved down to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							// If we have moved right and down to the location
							if (cordY === second.y && cordX === second.x) {
								console.log("Match! via Case J");
								solved = true;
								break;
							}
							// If the row we just moved down to is empty
							if (cell.data().solved === true || cell.data().solved === undefined) {
								// If we reached same row
								if (cordY === second.y) {
									// When we iterate across we change cordX, cache it to prevent havoc
									tempX = cordX;
									// While we haven't moved far enough right
									while (cordX < second.x) {
										cordX++; // Move right
										console.log("moved right to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if (cordX === second.x) {
											console.log("Match! via Case J");
											solved = true;
											break;
										}

									}// Third while
									// Reset to same cordX before going right and down
									cordX = tempX;				
								}
							}
							// Else row moved down to is occupied
							else
								break;
						}// 2nd while
						// Reset y cord after iterating down and right
						cordY = first.y;
					}
					// Else the cell to the right is occupied
					else
						break;

				}// first while

			}
		}// Case I & J

		// Case K & L
		if (first.y > second.y){


			// Case K
			// 	   [2]
			//  ....:
			//	:
			// [1]
			if(!solved){
				console.log("Case K");
				init();

				// While we reached the same row 
				while (cordY > second.y && !solved) {
					cordY--; // Go up one row
					console.log("moved up to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					// If the cell just moved up to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same column
						while (cordX < second.x) {
							cordX++; // Go right one column
							console.log("moved right to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							// If we have moved up and right to the location
							if (cordY === second.y && cordX === second.x) {
								console.log("Match! via Case K");
								solved = true;
								break;
							}
							// If the column we just moved down to is empty
							if (cell.data().solved === true || cell.data().solved === undefined) {
								// If we reached same row
								if (cordX === second.x) {
									// When we iterate across we change cordY, cache it to prevent havoc
									tempY = cordY;
									// While we haven't moved far enough up
									while (cordY > second.y) {
										cordY--; // Move up
										console.log("moved up to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if (cordX === second.x) {
											console.log("Match! via Case K");
											solved = true;
											break;
										}

									}// Third while
									// Reset to same cordY before going up and right
									cordY = tempY;				
								}
							}
							// Else row moved down to is occupied
							else
								break;
						}// 2nd while
						// Reset x cord after iterating right and up
						cordX = first.x;
					}
					// Else the cell up is occupied
					else
						break;

				}// first while



			}

			// Case L
			// [2]
			//  :....
			//	    :
			// 	   [1]
			if(!solved){
				console.log("Case L");
				init();

				// While we reached the same row 
				while (cordY > second.y && !solved) {
					cordY--; // Go up one row
					console.log("moved up to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					// If the cell just moved up to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same column
						while (cordX > second.x) {
							cordX--; // Go left one column
							console.log("moved left to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							// If we have moved up and left to the location
							if (cordY === second.y && cordX === second.x) {
								console.log("Match! via Case L");
								solved = true;
								break;
							}
							// If the column we just moved down to is empty
							if (cell.data().solved === true || cell.data().solved === undefined) {
								// If we reached same row
								if (cordX === second.x) {
									// When we iterate across we change cordY, cache it to prevent havoc
									tempY = cordY;
									// While we haven't moved far enough up
									while (cordY > second.y) {
										cordY--; // Move up
										console.log("moved up to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if (cordX === second.x) {
											console.log("Match! via Case L");
											solved = true;
											break;
										}

									}// Third while
									// Reset to same cordY before going up and left
									cordY = tempY;				
								}
							}
							// Else row moved down to is occupied
							else
								break;
						}// 2nd while
						// Reset x cord after iterating left and up
						cordX = first.x;
					}
					// Else the cell up is occupied
					else
						break;

				}// first while

			}
		}

		// Case M & N
		if (first.x > second.x){
			
			// Case M
			// [2].....
			//        :
			//        :....[1]
			if(!solved){
				console.log("Case M");
				init();

				// While we reached the same column 
				while (cordX > second.x && !solved) {
					cordX--; // Go left one column
					console.log("moved left to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					// If the cell just moved left to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same row
						while (cordY > second.y) {
							cordY--; // Go up one row
							console.log("moved up to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							// If we have moved left and up to the location
							if (cordY === second.y && cordX === second.x) {
								console.log("Match! via Case M");
								solved = true;
								break;
							}
							// If the row we just moved up to is empty
							if (cell.data().solved === true || cell.data().solved === undefined) {
								// If we reached same row
								if (cordY === second.y) {
									// When we iterate across we change cordX, cache it to prevent havoc
									tempX = cordX;
									// While we haven't moved far enough left
									while (cordX > second.x) {
										cordX--; // Move left
										console.log("moved left to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if (cordX === second.x) {
											console.log("Match! via Case M");
											solved = true;
											break;
										}

									}// Third while
									// Reset to same cordX before going left and up
									cordX = tempX;				
								}
							}
							// Else row moved up to is occupied
							else
								break;
						}// 2nd while
						// Reset y cord after iterating up and left
						cordY = first.y;
					}
					// Else the cell to the left is occupied
					else
						break;

				}// first while


			}

			// Case N
			//		  .....[1]
			//        :
			// [2]....:
			if(!solved){
				console.log("Case N");
				init();

				// While we reached the same column 
				while (cordX > second.x && !solved) {
					cordX--; // Go left one column
					console.log("moved left to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					// If the cell just moved left to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same row
						while (cordY < second.y) {
							cordY++; // Go down one row
							console.log("moved down to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							// If we have moved left and down to the location
							if (cordY === second.y && cordX === second.x) {
								console.log("Match! via Case N");
								solved = true;
								break;
							}
							// If the row we just moved down to is empty
							if (cell.data().solved === true || cell.data().solved === undefined) {
								// If we reached same row
								if (cordY === second.y) {
									// When we iterate across we change cordX, cache it to prevent havoc
									tempX = cordX;
									// While we haven't moved far enough left
									while (cordX > second.x) {
										cordX--; // Move left
										console.log("moved left to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if (cordX === second.x) {
											console.log("Match! via Case N");
											solved = true;
											break;
										}

									}// Third while
									// Reset to same cordX before going left and down
									cordX = tempX;				
								}
							}
							// Else row moved down to is occupied
							else
								break;
						}// 2nd while
						// Reset y cord after iterating down and left
						cordY = first.y;
					}
					// Else the cell to the left is occupied
					else
						break;

				}// first while

			}
		}

		// Case O & P
		if (first.y < second.y){

			//Case O
		    // [2]
			//  :....
			//	    :
			//     [1]

			if(!solved){
				console.log("Case O");
				init();

				// While we reached the same row 
				while (cordY < second.y && !solved) {
					cordY++; // Go down one row
					console.log("moved down to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					// If the cell just moved down to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same column
						while (cordX < second.x) {
							cordX++; // Go right one column
							console.log("moved right to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							// If we have moved down and right to the location
							if (cordY === second.y && cordX === second.x) {
								console.log("Match! via Case O");
								solved = true;
								break;
							}
							// If the column we just moved down to is empty
							if (cell.data().solved === true || cell.data().solved === undefined) {
								// If we reached same row
								if (cordX === second.x) {
									// When we iterate across we change cordY, cache it to prevent havoc
									tempY = cordY;
									// While we haven't moved far enough down
									while (cordY < second.y) {
										cordY++; // Move down
										console.log("moved down to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if (cordX === second.x) {
											console.log("Match! via Case O");
											solved = true;
											break;
										}

									}// Third while
									// Reset to same cordY before going down and right
									cordY = tempY;				
								}
							}
							// Else row moved down to is occupied
							else
								break;
						}// 2nd while
						// Reset x cord after iterating right and down
						cordX = first.x;
					}
					// Else the cell down is occupied
					else
						break;

				}// first while



			}

			//Case P
			// 	   [1]
			//  ....:
			//	:
			// [2]

			if(!solved){
				console.log("Case P");
				init();


				// While we reached the same row 
				while (cordY < second.y && !solved) {
					cordY++; // Go down one row
					console.log("moved down to:("+cordX+","+cordY+")");
					// Get the new cell that we moved to.
					cell = $('#'+app.getId(cordX,cordY));
					// If the cell just moved down to is empty
					if (cell.data().solved === true || cell.data().solved === undefined){
						// While we haven't reached the same column
						while (cordX > second.x) {
							cordX--; // Go left one column
							console.log("moved left to:("+cordX+","+cordY+")");
							cell = $('#'+app.getId(cordX,cordY));
							// If we have moved down and left to the location
							if (cordY === second.y && cordX === second.x) {
								console.log("Match! via Case P");
								solved = true;
								break;
							}
							// If the column we just moved down to is empty
							if (cell.data().solved === true || cell.data().solved === undefined) {
								// If we reached same row
								if (cordX === second.x) {
									// When we iterate across we change cordY, cache it to prevent havoc
									tempY = cordY;
									// While we haven't moved far enough down
									while (cordY < second.y) {
										cordY++; // Move down
										console.log("moved down to:("+cordX+","+cordY+")");
										cell = $('#'+app.getId(cordX,cordY));
										// If we reached the same x and y position, solved
										if (cordX === second.x) {
											console.log("Match! via Case P");
											solved = true;
											break;
										}

									}// Third while
									// Reset to same cordY before going down and left
									cordY = tempY;				
								}
							}
							// Else row moved down to is occupied
							else
								break;
						}// 2nd while
						// Reset x cord after iterating left and down
						cordX = first.x;
					}
					// Else the cell down is occupied
					else
						break;

				}// first while

			}
		}


		//final
		if (solved) {
			app.matchSuccess(first,second);
			return true;
		}
		else
			return false;


	}//case3



};



$(document).ready(function(){
	
	app.init();
	app.eventListeners();

});