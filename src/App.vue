<template>
  <v-app light v-if="games && game">
    <v-navigation-drawer
      persistent
      v-model="drawer"
      enable-resize-watcher
    >
      <v-toolbar dark>
        <v-toolbar-title>Round List</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          @click.native.stop="newRound()"
          icon
        >
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar>
      <v-dialog v-model="round_.show" fullscreen transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar dark>
            <v-btn icon @click.native.stop="closeRound()" dark>
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>Round {{round_.active ? 'Edit' : 'Add'}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn dark flat @click.native.stop="addRound()">Save</v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-card-text>
            <v-layout row>
              <v-flex xs6>
                <v-select
                  :items="config.gameList"
                  v-model="round_.game.count"
                  label="game"
                ></v-select>
              </v-flex>
              <v-flex xs6>
                <v-select
                  :items="config.gameType"
                  v-model="round_.game.type"
                  label="type"
                ></v-select>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs6
                      v-for="(item, i) in game.player"
                      :key="i"
              >
                {{item}}
                <v-layout row>
                  <v-flex xs6>
                    <v-select
                      :items="config.bribeList"
                      v-model="round_.player[playerLen][i].count"
                      label="count"
                    ></v-select>
                  </v-flex>
                  <v-flex xs6>
                    <v-select
                      :items="config.playerType"
                      v-model="round_.player[playerLen][i].type"
                      label="type"
                    ></v-select>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-list>
        <v-list-tile
          value="true"
          v-for="(item, i) in game.rounds"
          :key="i"
          @click.native.stop="editRound(item, i)"
          :class="{ active: i ===  round_.active}"
        >
          <v-list-tile-avatar>
            {{item.game.split(':')[0]}}
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.game.split(':')[1]"></v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-avatar>
            <confirm-button :on-confirm="removeRound" :item="i" confirm-text="Delete?">
              <v-icon>delete</v-icon>
            </confirm-button>
          </v-list-tile-avatar>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar dark fixed>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>{{game.name}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>menu</v-icon>
      </v-btn>
    </v-toolbar>
    <main>
      <v-container fluid>
        <v-layout row wrap>
          <v-flex xs6
                  v-for="(item, i) in player"
                  :key="i"
          >
            <v-card>
              <div>
                <b>{{game.player[i]}}</b>
              </div>
              <div>
                g
                 <span :class="{'blue': item.last.gorka && (i === item.gorka.length - 1)}"
                       v-for="(g, i) in item.gorka"
                 >{{g}}.</span>
              </div>
              <div>
                p
                <span :class="{'blue': item.last.pulja && (i === item.pulja.length - 1)}"
                     v-for="(p, i) in item.pulja"
                >{{p}}.</span>
              </div>
              <div
                v-for="(vist, ii) in item.vist"
                v-if="i !== ii"
              >
                <b>{{game.player[ii]}}</b>
                <span :class="{'blue': item.last.vist[ii] && (iii === vist.length - 1)}"
                      v-for="(v, iii) in vist"
                >{{v}}.</span>
              </div>
              <div>{{item.calculation}}</div>
              <div>
                <v-icon class="green" v-if="item.total > 0">arrow_drop_up</v-icon>
                <v-icon class="red" v-if="item.total < 0">arrow_drop_down</v-icon>
                {{item.total}}
              </div>
            </v-card>
          </v-flex>
        </v-layout>

      </v-container>
    </main>
    <v-navigation-drawer
      right
      v-model="rightDrawer"
      temporary
    >
      <v-toolbar dark>
        <v-toolbar-title>Game List</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          @click.native.stop="newGame()"
          icon
        >
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar>
      <v-dialog v-model="game_.show" fullscreen transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar dark>
            <v-btn icon @click.native.stop="closeGame()" dark>
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>Game {{game_.change ? 'Edit' : 'Add'}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn dark flat @click.native.stop="addGame()">Save</v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-card-text>
            <v-layout row>
              <v-flex xs6>
                <v-text-field
                  v-model="game_.name.name"
                  label="game name"
                ></v-text-field>
              </v-flex>
              <v-flex xs6>
                <v-select
                  :items="config.puljaList"
                  v-model="game_.name.pulja"
                  label="pulja"
                ></v-select>
              </v-flex>
              <v-flex xs6>
                <v-select
                  :items="config.playerList"
                  v-model="game_.players"
                  label="players"
                  :disabled="game_.change"
                ></v-select>
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs6
                      v-for="(item, i) in game_.player[game_.players]"
                      :key="i"
              >
                <v-text-field
                  v-model="game_.player[game_.players][i]"
                  label="player"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-list>
        <v-list-tile
          v-for="(item, i) in games"
          :key="i"
          @click="changeGame(item, i)"
          :class="{ active: i ===  game_.active}"
        >
          <v-list-tile-title>{{ item.name.split(':')[0] }}</v-list-tile-title>
          <v-list-tile-avatar>
            <span>{{ item.name.split(':')[1] }}</span>
            <span @click.stop="editGame(item, i)"><v-icon>mode_edit</v-icon></span>
            <confirm-button :on-confirm="removeGame" :item="item" confirm-text="Delete?">
              <v-icon>delete</v-icon>
            </confirm-button>
          </v-list-tile-avatar>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
  </v-app>
</template>

<script src="./app.js"></script>

<style lang="stylus">
  @import './stylus/main'
</style>
