<template>
  <v-app light id="app">
    <v-navigation-drawer
      fixed app clipped
      width=250
      v-model="left"
    >
      <lists/>
    </v-navigation-drawer>

    <v-navigation-drawer
      fixed app right clipped
      width=250
      v-model="right"
    >
      <editors/>
    </v-navigation-drawer>

    <v-toolbar
      fixed dense app
      clipped-left clipped-right
      height=40
      >
      <v-toolbar-side-icon @click.stop="left = !left"></v-toolbar-side-icon>
      <!-- <v-toolbar-title>Application</v-toolbar-title> -->
      <v-spacer></v-spacer>
      <v-toolbar-side-icon @click.stop="right = !right"></v-toolbar-side-icon>
    </v-toolbar>

    <v-content>
      <v-container id="spread-container" fluid fill-height>
        <spreadDisplay/>
      </v-container>
    </v-content>


    <!-- <router-spread/> -->
  </v-app>
</template>

<script>

import SpreadDisplay from './components/SpreadDisplay'
import Lists from './components/Lists/Lists'
import Editors from './components/Editors/Editors'

export default {

  name: 'App',

  components: {
    spreadDisplay: SpreadDisplay,
    lists: Lists,
    editors: Editors,
  },

  data: () => ({
    right: null,
    left: null
  }),

  created () {
    this.$store.dispatch('project/select', 'base')
    // this.$store.dispatch('project/select', 'family_and_friends')

    window.onclick = function(event) {
      if (!event.target.matches('.dropbtn')) {

        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    }
  },
}
</script>

<style>
#spread-container {
  padding: 0
}
/* Dropdown Button */
.dropbtn {
  background-color: #dddddd;
  color: black;
  border: none;
  padding: 3px 15px;
  cursor: pointer;
}

/* Dropdown button on hover & focus */
.dropbtn:hover, .dropbtn:focus {
  background-color: #b5b5b5;
}

/* The container <div> - needed to position the dropdown content */
.dropdown {
  position: relative;
  display: inline-block;
}

/* Dropdown Content (Hidden by Default) */
.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  width: 180px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

/* Links inside the dropdown */
.dropdown-content a {
  color: black;
  padding: 5px 5px;
  text-decoration: none;
  display: block;
}
.dropdown-content .color-box {
  font-weight: bold;
  color: white;
  float:left;
  padding: 5px 5px;
  width: 60px;
  height: 30px;
}

/* Change color of dropdown links on hover */
.dropdown-content a:hover {background-color: #ddd}

/* Show the dropdown menu (use JS to add this class to the .dropdown-content container when the user clicks on the dropdown button) */
.show {display:block;}
</style>
