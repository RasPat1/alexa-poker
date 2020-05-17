'use strict';
/**
 * Texas Holdem Poker as an Alexa App.
 * Eack player recieves their hand via text and dictates their actions to Alexa
 * Alexa lays out the community hands, handles turn order, chip counts, etc.
 *
 **/

/******************************************************************************
 Global Config
 ******************************************************************************/

var inquirer = require('inquirer');

var SUITS = ['clubs', 'diamonds', 'clovers', 'hearts'];
var VALUES = ['two', 'three', 'four', 'five', 'six', 'seven', 'eight',
              'nine', 'ten', 'jack', 'queen', 'king', 'ace'];

var game = {
  debugMode: true,
  players: [],
  playerCount: 0,
  deck: [],
  handNumber: 0,
  communityCards: [],
  potSize: 0,
  buttonPlayerIndex: 0,
  gameOn: true,
  currentBet: 0,
  defaultChipCount: 100
};

/******************************************************************************
 Initiate GAME!
 ******************************************************************************/

gameInitLoop();

/******************************************************************************
 Main Game Loop
 ******************************************************************************/

function gameInitLoop() {
  // Get player Count
  // Get Player Names
  // Get player phone numbers
  // Initiate chip counts
  // Talk about chip counts and turn order
  // Deal cards i.e. text the players

  var playerCount;
  var playerInfo;

  if (game.debugMode) {
    playerInfo = debugInit();
  } else {
    playerCount = getPlayerCount();
    playerInfo = getTextInfo(playerCount);
  }

  game.players = initPlayers(playerInfo);
  game.deck = createNewDeck();
  game.buttonPlayerIndex = 0;
  // Debug this should triger the gameLoop when initilization is done
}

function gameLoop() {
  while(game.gameOn) {
    playHand();
  }

  announceGameEnd();
}

// Hardcode rounds for now?
function playHand() {
  var currentBetRound = 0;
  var handInProgress = true;

  dealHands();
  while (handInProgress) {
    handInProgress = betNextRound(game.buttonPlayerIndex, currentBetRound);
  }

  resolveChips();
  resolveGame();
}

function dealHands() {
  var handSize = 2;

  for (var i = 0; i < game.players.length; i++) {
    var currentHand = extractRandomCards(game.deck, handSize);
    game.players[i].currentHand = currentHand;
  }

  return null;
}

function betNextRound(buttonPlayerIndex, currentBetRound) {
  var order = getPlayerOrder(buttonPlayerIndex, currentBetRound);
  for (var i = 0; i < order.length; i++) {
    var currentPlayer = game.players[order[i]];
    var action = getPlayerAction();
    executePlayerAction(currentPlayer, action);
  }
}

function executePlayerAction(currentPlayer, action) {
  var type = action.type;
  var value = action.value;

  if (type === 'fold') {
    currentPlayer.inHand = false;
  } else if (type === 'bet') {
    addToPot(currentPlayer, value);
    game.currentBet = value;
  } else if (type === 'call') {
    addToPot(currentPlayer, game.currentBet);
  } else if (type === 'raise') {
    addToPot(currentPlayer, game.currentBet);
    addToPot(currentPlayer, value);
    game.currentBet = game.currentBet + value;
  }

}

function addToPot(currentPlayer, value) {
  if (currentPlayer.chipCount >= value) {
    currentPlayer.chipCount -= value;
    game.potSize += value;
  }
}

function getPlayerOrder(buttonPlayerIndex) {
  var result = [];

  for (var i = 0; i < game.players.length; i++) {
    // cycle through the players starting at the button...
    var currentPlayer = game.players[(i + buttonPlayerIndex) % game.players.length];
    if (currentPlayer.inGame && currentPlayer.inHand) {
      result.push(i);
    }
  }

  return result;
}

function resolveChips() {
    // TODO: Stub
}

function resolveGame() {
    // TODO: Stub
}

function announceGameEnd() {
  // Announce the winner and that the game is over
  // TODO: Stub
}

/******************************************************************************
 Game Utility Functions
 ******************************************************************************/

function extractRandomCards(deck, handSize) {
  var result = [];

  deck = shuffle(deck);
  for (var i = 0; i < handSize; i++) {
    result.push(deck.pop());
  }

  return result;
}

/******************************************************************************
 Game Init Functions
 ******************************************************************************/

function initPlayers(playerInfo) {
  var result = [];

  for (var i = 0; i < playerInfo.length; i++) {
    result.push(createNewPlayer(playerInfo.name, playerInfo.phoneNumber));
  }

  return result;
}

function createNewPlayer(name, phoneNumber) {
  return {
    name: name,
    phoneNumber: phoneNumber,
    chipCount: game.defaultChipCount,
    currentHand: [],
    inHand: true,
    inGame: true
  };

}

function createNewDeck() {
  var deck = [];

  for (var i = 0; i < SUITS.length; i++) {
    for (var j = 0; j < VALUES.length; j++) {
      deck.push(createNewCard(SUITS[i], VALUES[j]));
    }
  }

  return deck
}

function createNewCard(suit, value) {
  return {suit: suit, value: value};
}

/******************************************************************************
 Alexa Functions
 ******************************************************************************/

function getPlayerAction() {
  if (game.debugMode) {
    return getPlayerActionDebug();
  }

  // TODO: Stub get alexa intent stuff
  return {type:'call', value: null}
}


/******************************************************************************
 Twilio Functions
 ******************************************************************************/

function getPlayerCount() {
  if (game.debugMode) {
    return getPlayerCountDebug();
  }

  return 2;
}

function getTextInfo(playerCount) {
  if (game.debugMode) {
    return getTextInfoDebug(playerCount);
  }

  var info = [
    {
      name: 'ras',
      phoneNumber: '7732264075'
    },
    {
      name: 'shur',
      phoneNumber: '123456789'
    }
  ];

  return info;
}


/******************************************************************************
 Debug Functions
 ******************************************************************************/

function printDeck(deck) {
  for (var i = 0; i < deck.length; i++) {
    var card = deck[i];
    console.log(card.value + ' ' + card.suit);
    if (i % 13 == 12) {
      console.log('\n');
    }
  }
}

function debugInit() {
  var playerSchema = {
    propeties: {
      userCount: {
        description: 'How many people will be playing?'
      },
      user: {

      }
    }
  }

  prompt.start();
  var playerCount;
  var playerInfo = [];

  prompt.get(['playerCount'], function(err, result) {
    playerCount = result.playerCount;
    innerAsk(playerCount)
  });

  return initPlayers(playerInfo);
}

function innerAsk(playerCount) {
  var counter = 0;
  prompt.start();
  prompt.get(['name', 'phoneNumber']), function(err, result2) {
    if (playerCount)
    playerInfo.push({
      name: result2.name,
      phoneNumber: result2.phoneNumber
    });

  }
}


function getTextInfoDebug(playerCount) {
  // var info = [
  //   {
  //     name: 'ras',
  //     phoneNumber: '7732264075'
  //   },
  //   {
  //     name: 'shur',
  //     phoneNumber: '123456789'
  //   }
  // ];

  var info = [];

  prompt.start();

  for (var i = 0; i < playerCount; i++) {
    prompt.get(['playerName', 'phoneNumber'], function(err, result) {
      console.log('  playerName: ' + result.playerName);
      info.push({
          name: result.playerName,
          phoneNumber: result.phoneNumber
        });
    });
  }

  return info;
}

function getPlayerCountDebug() {
  prompt.start();

  var result = prompt.get(['playerCount'], function(err, result) {
    console.log('  playerCount: ' + result.playerCount);
    return result.playerCount;
  });

  return result;
}

/******************************************************************************
 Utility Functions
 ******************************************************************************/

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
