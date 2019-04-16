
const app = new Vue({
  el: '#app',
  data: {
    activePage: "landing-page",
    previousPage: "landing-page",
    schedPage: false,
    gameInfo: {},
    dateArray: [],
    filterCollapsed: true,
    checkedNames: [],
    filteredGames: [],
    expandedGames: [],
    expandedMorningDates: [],
    expandedAfternoonDates: [],
    selectedLocations: [],
    markerArray: [],
    infoWindowArray: [],
    loggedIn: false,
    showLoader: true,
    text: "",
    messages: {},
    currentUser: ''
  },
  created: function() {
    this.redirected();
    this.getData();
  },
  methods: {
    getData: function() {
      fetch('https://api.myjson.com/bins/1avsuw', {
          method: "GET"
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(json) {
          app.gameInfo = json;
          app.createDateData();
          app.populateDateData();
          // for google map
          app.initMap();
        })
        .catch(function(error) {
          console.log(error);
        })
    },
    redirected: function() {
      if(localStorage["currentPage"] == "messages-page"){
        console.log("local storage current page == messages page")
        // this.checkIfLoggedIn();
        // setTimeout(function() {this.activePage="messages-page";}, 3000);
        this.launchPage("messages-page");
      } else {
        this.activePage="landing-page";
      }
    },
    //nav-Page
    openNav: function() {
      app.previousPage = this.activePage;
      console.log("previous page: "+ this.previousPage);
      app.activePage = "nav-page";
    },
    closeNav: function() {
      if (app.previousPage == 'location-page') {
        app.getData()
      }
      app.activePage = app.previousPage;
    },
    launchPage:function(page){
      console.log("launching page");
      if(page == 'schedule-page'){
        this.activePage = "landing-page";
        Vue.nextTick()
          .then(function() {

            $('html, body').animate({
              scrollTop: $("#schedule-title").offset().top
            }, 0);
          })
        localStorage["currentPage"]="";
      }
      else if (page == 'location-page') {
        this.activePage = 'location-page';
        localStorage["currentPage"]="";
        this.getData();
      }
      else if (page == 'messages-page') {
        localStorage["currentPage"]="messages-page";
        console.log("launching page 2");
        this.activePage = 'messages-page';
        this.showLoader = true;
        this.checkIfLoggedIn();
      }
      console.log("local storage: " + localStorage.currentPage);
    },
    //schedule-page
    createDateData: function() {
      let uniqueDates = [];
      for (let i = 0; i < this.gameInfo.games.length; i++) {
        if (!uniqueDates.includes(this.gameInfo.games[i].date)) {
          uniqueDates.push(this.gameInfo.games[i].date);
          this.dateArray.push({
            "date": this.gameInfo.games[i].date,
            "morning": {
              "time": "",
              "team1": "",
              "opponent1": "",
              "team2": "",
              "opponent2": "",
              "location": ""
            },
            "afternoon": {
              "time": "",
              "team1": "",
              "opponent1": "",
              "team2": "",
              "opponent2": "",
              "location": ""
            }
          })
        }
      }
    },
    populateDateData: function() {
      for (let i = 0; i < this.dateArray.length; i++) {
        for (let j = 0; j < this.gameInfo.games.length; j++) {
          if (this.dateArray[i].date == this.gameInfo.games[j].date) {
            if (this.gameInfo.games[j].time == "9:30 am" &&
              (j == 0 || this.gameInfo.games[j - 1].time != "9:30 am")) {
              this.dateArray[i].morning.time = this.gameInfo.games[j].time;
              this.dateArray[i].morning.team1 = this.gameInfo.games[j].team;
              this.dateArray[i].morning.opponent1 = this.gameInfo.games[j].opponent;
              this.dateArray[i].morning.location = this.gameInfo.games[j].location;
              this.dateArray[i].morning.locationLink = this.getLocationLink(this.gameInfo.games[j].location);
            } else if (this.gameInfo.games[j].time == "9:30 am" &&
              (this.gameInfo.games[j - 1].time == "9:30 am")) {
              this.dateArray[i].morning.team2 = this.gameInfo.games[j].team;
              this.dateArray[i].morning.opponent2 = this.gameInfo.games[j].opponent;
            }
            if (this.gameInfo.games[j].time == "1:00 pm" &&
              (this.gameInfo.games[j - 1].time != "1:00 pm")) {
              this.dateArray[i].afternoon.time = this.gameInfo.games[j].time;
              this.dateArray[i].afternoon.team1 = this.gameInfo.games[j].team;
              this.dateArray[i].afternoon.opponent1 = this.gameInfo.games[j].opponent;
              this.dateArray[i].afternoon.location = this.gameInfo.games[j].location;
              this.dateArray[i].afternoon.locationLink = this.getLocationLink(this.gameInfo.games[j].location);
            } else if (this.gameInfo.games[j].time == "1:00 pm" &&
              (this.gameInfo.games[j - 1].time == "1:00 pm")) {
              this.dateArray[i].afternoon.team2 = this.gameInfo.games[j].team;
              this.dateArray[i].afternoon.opponent2 = this.gameInfo.games[j].opponent;
            }
          }
        }
      }
    },
    getLocationLink: function(location_name) {
      for (let i = 0; i < app.gameInfo.locations.length; i++) {
        if (app.gameInfo.locations[i].name == location_name) {
          return app.gameInfo.locations[i].gmapLink;
        }
      }
    },
    filterGames: function() {
      if (!app.checkedNames.includes(event.target.value)) {
        app.checkedNames.push(event.target.value);
      } else {
        let index = app.checkedNames.indexOf(event.target.value);
        app.checkedNames.splice(index, 1);
      }
      app.filteredGames = [];
      for (var i = 0; i < app.gameInfo.games.length; i++) {
        if (app.checkedNames.includes(app.gameInfo.games[i].team)) {
          app.filteredGames.push(app.gameInfo.games[i]);
        }
      }
    },
    closeFilter: function() {
      this.filterCollapsed = !this.filterCollapsed;
      this.checkedNames = [];
      this.filteredGames = [];
      this.expandedGames = [];
      this.expandedMorningDates = [];
      this.expandedAfternoonDates = [];
    },
    toggleGameExpansion: function(i) {
      if (app.expandedGames.includes(i)) {
        let index = app.expandedGames.indexOf(i);
        app.expandedGames.splice(index, 1);
      } else {
        app.expandedGames.push(i);
      }
    },
    toggleDateExpansion: function(i, time) {
      if (time == "9:30 am") {
        expandedArray = app.expandedMorningDates;
      } else if (time == "1:00 pm") {
        expandedArray = app.expandedAfternoonDates;
      }
      if (expandedArray.includes(i)) {
        let index = expandedArray.indexOf(i);
        expandedArray.splice(index, 1);
      } else {
        expandedArray.push(i);
      }
    },

    //location-page
    toggleLocationActivity: function(i) {
      if (!app.selectedLocations.includes(i)) {
        app.selectedLocations.push(i)
        app.infoWindowArray[i].open(map, app.markerArray[i]);
      } else {
        let index = app.selectedLocations.indexOf(i);
        app.selectedLocations.splice(index, 1);
        app.infoWindowArray[i].close(map, app.markerArray[i]);
        // close appropriate marker
      }
    },
    initMap: function() {
      // map options
      var options = {
        zoom: 14,
        center: {
          lat: 41.920,
          lng: -87.6412634
        }
      }
      // new map
      var map = new google.maps.Map(document.getElementById('map'), options);
      for (let i = 0; i < this.gameInfo.locations.length; i++) {
        addMarker(this.gameInfo.locations[i]);
      }
      return (map);
      // add marker function
      function addMarker(props) {
        var marker = new google.maps.Marker({
          position: {
            lat: props.lat,
            lng: props.lng
          },
          map: map
        });
        var infoWindow = new google.maps.InfoWindow({
          content: props.name
        });
        marker.addListener('click', function() {
          if (!app.selectedLocations.includes(props.index)) {
            app.selectedLocations.push(props.index);
            infoWindow.open(map, marker);
          } else {
            let index = app.selectedLocations.indexOf(props.index);
            app.selectedLocations.splice(index, 1);
            infoWindow.close(map, marker);
          }
        });
        app.markerArray.push(marker);
        app.infoWindowArray.push(infoWindow);
      }
    },
    // -----Messages Page-----
    checkIfLoggedIn: function() {
      firebase.auth().onAuthStateChanged(function(user){
        console.log("hehehbjachb")
        if (user != null) {
          app.loggedIn = true;
          app.getPosts();
        } else {
          app.loggedIn = false;
        }
      })
    },
    login: function() {
      localStorage['currentPage']='messages-page';
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider)
        .then(function() {
          app.loggedIn = true;
          app.getPosts();
        })
    },
    logout: function() {
      firebase.auth().signOut();
      app.loggedIn = false;
    },
    writeNewPost: function() {
      var userName = firebase.auth().currentUser.displayName.split(' ')[0];
      var picture = firebase.auth().currentUser.photoURL;
      var mail = firebase.auth().currentUser.email;
      // Create post entry
      var postData = {
        name: userName,
        image: picture,
        body: app.text,
        email: mail
      };
      // Key for new post
      var newPostKey = firebase.database().ref().child('chat').push().key;
      // Write data
      var updates = {};
      updates[newPostKey] = postData;
      app.text = "";
      return firebase.database().ref('chat').update(updates);
    },
    getPosts: function() {
      app.currentUser = firebase.auth().currentUser.email;
      app.loggedIn = true;
      firebase.database().ref('chat').on('value', function(data) {
        app.messages = data.val();
        Vue.nextTick()
          .then(function() {
            app.scrollToBottom("posts");
          })
      })
      this.showLoader = false;
    },
    scrollToBottom: function(elementID) {
      element = $("#" + elementID)
      element.animate({
        scrollTop: element.prop("scrollHeight")
      }, 500);
    }
  }
})
