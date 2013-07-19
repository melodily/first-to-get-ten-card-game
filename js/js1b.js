var unopened=makeDeck("unopened");
var playerHand=	makeDeck("playerHand");
var compHand =	makeDeck("compHand");
var discards=	makeDeck("discards"); //last in first out
var playerScore = 0;
var compScore = 0;
var hasGameEnded = false;

$(document).ready(startApp);

function startApp() {
	initialise();
	playerTurn();
	$(".newgame").on("click", function () {
		if (hasGameEnded) {
			startApp();
		}
		else if (confirm ("Resign? You will lose this round!")) {
			gameOver(compHand);
		}
	})

}

// move a card from one hand to the other
function throwOneOver() {
	// get the deck DIV (first div of type "deck"
	var deck = $(".deck").first();
	// get the first div of type "myhand"
	var hand = $(".myhand").first();
	// get the first card in the deck 
	var card = deck.children().first();
	
	// make the first card zoom to the right
	card.addClass("offright");
	
	// look! a closure that we'll call on a timer!
	setTimeout(function() {
		// after one second, remove the style that zoom the card
		// to the right (i.e. after the animation plays)
		card.removeClass("offright");
		// remove the card (from the deck)
		card.remove();
		// add the card to the hand
		hand.prepend(card);
	}, 1000);
}



function initialise(){
	hasGameEnded = false;
	refreshGame();
	generateDeck();
	dealInitialCards();
}



function playerTurn(){
	if (playerHand.cards.length==5) {
		//either pick card from unopened or discards (if either isn't empty)
		var hasPicked = false;
		var hasGameEnded = false;
		$(".discards>.card").on("mouseover", function() {
			$(this).addClass("cardhover");
		})
		$(".discards>.card").on("mouseleave", function() {
			$(this).removeClass("cardhover");
		});
		$(".unopened").on("mouseover", function() {
			$(this).addClass("cardhover");
		})
		$(".unopened").on("mouseleave", function() {
				$(this).removeClass("cardhover");
			});
		$(".discards").on("click", function() {
			var cardPicked = discards.cards.pop();
			$("#discards"+cardPicked.number).animate({top: '170px', left: '90px', 'z-index': '20'}, 1000);
			setTimeout(function() {
				cardPicked.play(playerHand);
				hasPicked = true;
				$(".discards").off();
				$(".unopened>.card").off();
				hasGameEnded = playerPlayCard();
			}, 1200);
		})
		if (!hasPicked && !hasGameEnded) {
		$(".unopened").on("click", function() {
			var randCard = dealRandomCard();
			var cardImage = 
			'<div class = "card" id = "cardImage" style ="z-index: 20"><img src = "./images/pattern.jpg" width="85px" height = "110px"></div>';
			$(".unopened").append(cardImage);
			$("#cardImage").animate({top: '170px', left: '-130px', 'z-index': '20'},1000);
			setTimeout(function() {
				$("#cardImage").remove();
			randCard.play(playerHand);
			$(".unopened").off();
			$(".discards>.card").off();				
			playerPlayCard();
			}, 1200);
		})	
		}
	}
	else {
		playerPlayCard();
	}
	
}

function playerPlayCard() {
	if (playerHand.cards.length == 6) {
		if (checkIfVictory(playerHand)) {
			 gameOver(playerHand);
			 return true;	
		}
		else {
			$(".playerHand>.card").on("mouseover", function() {
				$(this).addClass("cardhover");
			});
			$(".playerHand>.card").on("mouseleave", function() {
				$(this).removeClass("cardhover");
			});
			
			$(".playerHand>.card").on("click", function() {
				var index = $(".playerHand>.card").index(this);
				var translateXAmt = (2-index)*30;
				translateXAmt += 'px';
				$(this).addClass(".offtop"); 
//				$(this).animate({'top': '-170px', left: translateXAmt, 'z-index': '20'}, 1000);
				
				setTimeout(function () {
					var curCard = playerHand.cards[index];
					curCard.play(discards);
					$(".playerHand>.card").off();
					compTurn();
					return false;
				}, 1200);
				
			})
		}
	}
}

function gameOver(hand) {
	hasGameEnded = true;
	if (hand.type == "playerHand") {
		alert ("Player has won!")
		playerScore++;
		updateScore();
	}
	else {
		alert ("Player has lost!")
		compScore++;
		updateScore();
	}
	if (confirm("New Game?")) {
			alert("Alright!")
			startApp();
	}
}
	


function compTurn() {

	var matched = [];
	var unmatched = [];
	for (var i = 0; i<5; i++){
		var hasMatched = false;
		if (matched.indexOf(i) != -1) {
			hasMatched = true;
		}
		else {		
			for (var j = i+1; j<5; j++){
				if (matched.indexOf(j) != -1) {
					continue;
				}
				else if (isAPair(compHand.cards[i], compHand.cards[j])) {
				  hasMatched = true;
				  matched.push(i);
				  matched.push(j);
				  break;
			  	}
			}
		}
		if (!hasMatched) unmatched.push(compHand.cards[i]);
	}
	
	var hasMatch = false;
	if (discards.cards.length > 0) {
	  for (var i = 0; i<unmatched.length; i++){
		  if (isAPair(discards.cards[discards.cards.length-1], unmatched[i])) {
			  var curCard = discards.cards.pop();
			  $("#discards"+curCard.number).animate({'top': '170px', left: '90px', 'z-index': '20'}, 1000);
			  setTimeout(function() {
				  curCard.play(compHand);
				  unmatched.splice(i, 1);
				  hasMatch = true;
				  }, 1200);
			  break;
		  }
	  }
	}
	
	if (!hasMatch) {
		var pickCard = dealRandomCard();
		pickCard.play(compHand);
		unmatched.push(pickCard);
	}
	
	if(checkIfVictory(compHand)) gameOver(compHand);
	else {
		var chosenIndex = Math.floor(Math.random()*unmatched.length);
		var translateXAmt = (2-chosenIndex)*30;
		translateXAmt +='px';
		var chosenCard = unmatched[chosenIndex];
		$("#compHand"+chosenCard.number).animate({top: '170px', left: translateXAmt, 'z-index': '20'}, 1000);
		setTimeout(function() {
		chosenCard.play(discards);
		playerTurn();
		}, 1200);
	}		
	
}


function smoothTranslate(index) {
	if (index < 2) {
		return (2-index)*30;
	}
	else {
	}
}

function updateScore() {
	$("#compScore").text(compScore);
	$("#playerScore").text(playerScore);
}
function isAPair(a, b) {
	var first = (a.number)%13;
	var second = (b.number)%13;
	//0+8,1+7,2+6,4+4,5+3
	if (first+second==8) return true;
	if (first+second>17 && first==second) return true;
	return false;
}

function checkIfVictory(hand){
	var numberOfPairs = 0;
	var matchedIndexes = [];
	for (var i = 0; i<6; i++){
		if (matchedIndexes.indexOf(i)==-1) {
			for (var j = i+1; j<6; j++){
				if (matchedIndexes.indexOf(j) == -1 && isAPair(hand.cards[i], hand.cards[j])) {
					numberOfPairs++;
					matchedIndexes.push(i);
					matchedIndexes.push(j);
					break;
				}
			}
		}
	}
	if (numberOfPairs==3) return true;
	return false;
	
}


function generateDeck(){
	for (var i =0; i<52; i++){
		makeCard(i, unopened);
	}	
}

function makeDeck(whichDeck) {
	//whichDeck: string name of one of four decks: unopened, playerHand, compHand, discards
//	var cards = [];
	var deck = {
		type: whichDeck,
		cards: []
	}
	return deck;
}


/*
Cases where we have to refresh display of cards:
1. anything.play(playerHand)
2. anything.play(discards) - only top card
3. somecardinplayerHand.play(something) - need to remove the card
*/

function makeCard(no, stack) { 
	/*
	no: number of card, ordered dimes hearts spades clubs
	whichStack: one of the four decks
	*/
	var card = {
		number: no,
		play: function(newStack) {
			var cardIndex = stack.cards.indexOf(this);
			stack.cards.splice(cardIndex, 1);
			newStack.cards.push(this);
			
			var type = newStack.type;
			var imghtml = '';
			if (newStack.type == "discards" || newStack.type == "playerHand") 
			imghtml = '<img src = "./images/' + no + '.png" width = "85" height = "110">';
			var htmlForCard = '<div class= "card" id ="' + type + no + '">'+ imghtml + '</div>';
			
			if (stack.type != 'unopened') {
				$("#"+stack.type+no).remove();
			}
			$("."+type).append(htmlForCard);			
			stack = newStack;
						
		}
	}
	stack.cards.push(card);
	return card;
}
	

function refreshGame() {
	playerHand.cards = [];
	compHand.cards = [];
	discards.cards = [];
	unopened.cards = [];
	
	$(".playerHand").empty();
	$(".compHand").empty();
	$(".discards").empty();
}


function dealInitialCards(){
	
	for (var i = 0; i<5; i++){
		dealRandomCard().play(compHand);
	}
	for (var i = 0; i<6; i++){
		dealRandomCard().play(playerHand);
	}
}


dealRandomCard = function(){
	var deckSize = unopened.cards.length;
	if (deckSize != 0){
		var randCard = Math.floor(Math.random()*deckSize);
		var curCard = unopened.cards[randCard];
		return curCard;
	}
}

