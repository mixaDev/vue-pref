import database from './database.js'
import config from './config.js'
import { player } from './helpers.js'

export default {
  data () {
    return {
      drawer: true,
      rightDrawer: false,
      config: config,

      round_: {
        game: {
          count: 6,
          type: 'game'
        },
        player: {
          3: [{}, {}, {}],
          4: [{}, {}, {}, {}]
        },
        show: false,
        active: false
      },
      game_: {
        name: {
          name: 'new game',
          pulja: 11
        },
        player: {
          3: ['','',''],
          4: ['','','','']
        },
        rounds: [],
        show: false,
        change: false,
        active: 0,
        players: 0
      }
    }
  },
  computed: {
    roundAdd: {
      get: function () {
        return {
          game: this.round_.game.count + ':' + this.round_.game.type + ':' + this.round_.game.type2,
          player: this.round_.player[this.playerLen].map(i => i.count + ':' + i.type)
        }
      },
      set: function (round) {
        let i = this.playerLen

        this.round_.game.count = parseInt(round.game.split(':')[0])
        this.round_.game.type = round.game.split(':')[1]
        this.round_.game.type2 = round.game.split(':')[2] || ''

        while (i) {
          i--
          this.$set(this.round_.player[this.playerLen][i], 'count', parseInt(round.player[i].split(':')[0] || 0));
          this.$set(this.round_.player[this.playerLen][i], 'type', round.player[i].split(':')[1] || 'pas');
        }
      }
    },
    gameAdd: {
      get: function () {
        return {
          name: this.game_.name.name + ':' + this.game_.name.pulja,
          player: this.game_.player[this.game_.players],
          rounds: this.game_.rounds
        }
      },
      set: function (game) {
        this.game_.name.name = game.name.split(':')[0]
        this.game_.name.pulja = parseInt(game.name.split(':')[1] || 0)
        this.game_.player[this.game_.players] = game.player
        this.game_.rounds = game.rounds || []
      }
    },
    player () {
      return player(this.game)
    },
    playerLen () {
      return this.game.player.length
    },
    roundsReverse () {
      return this.rounds.slice().reverse();
    },
    gamesReverse () {
      return this.games.slice().reverse();
    }
  },
  watch: {
    'game_.active': function (val, oldVal) {
      this.$bindAsObject('game', database.getRef('games/' + this.game_.active))
      this.$bindAsArray('rounds', database.getRef('games/' + this.game_.active + '/rounds'))
    }
  },
  firebase () {
    return {
      games: database.getRef('games'),
      rounds: database.getRef('games/' + this.game_.active + '/rounds'),
      game: {
        source: database.getRef('games/' + this.game_.active),
        asObject: true,
      },
      active:  {
        source: database.getRef('active'),
        asObject: true,
      }
    }
  },
  methods: {
    changeGame (game) {
      this.game_.active = game['.key']
      this.setActive (game['.key'])
      this.setGame (game)
    },
    editGame (game) {
      this.game_.active = game['.key']
      this.game_.show = true
      this.game_.change = game['.key']
      this.setGame (game)
    },
    newGame(){
      this.game_.show = true
      this.game_.change = false
      this.setGame (config.gameAdd)
    },
    setGame (game) {
      this.game_.players = game.player.length
      this.gameAdd = game
    },
    closeGame() {
      this.game_.show = false
    },
    addGame (){
      if(this.game_.change){
        this.$firebaseRefs.games.child(this.game_.change).set(this.gameAdd)
      } else {
        this.$firebaseRefs.games.push(this.gameAdd)
      }
      this.closeGame()
    },
    removeGame (game){
      if(this.game['.key'] !== game['.key'] && game['.key'] != 0){
        this.$firebaseRefs.games.child(game['.key']).remove()
      }
    },

    editRound (round) {
      this.round_.active = round['.key']
      this.setRound(round)
    },
    newRound(){
      this.round_.active = false
      this.setRound(config.roundAdd)
    },
    setRound (round) {
      this.round_.show = true;
      this.$nextTick(function () {
        this.roundAdd = round
      })
    },
    closeRound () {
      this.round_.show = false
    },
    addRound (){
      if(this.round_.active){
        this.$firebaseRefs.games.child(this.game['.key']).child('rounds').child(this.round_.active).set(this.roundAdd)
      } else {
        this.$firebaseRefs.games.child(this.game['.key']).child('rounds').push(this.roundAdd)
      }
      this.closeRound()
    },
    removeRound (round){
      this.$firebaseRefs.games.child(this.game['.key']).child('rounds').child(round['.key']).remove()
    },
    setActive (id){
      this.$firebaseRefs.active.set(id)
    }
  }
}
