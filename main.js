const app = new Vue({
  el: '#app',
  data: {
    gameInfo: {},
    dateArray: [],
    filterCollapsed: true,
    checkedNames: [],
    filteredGames: [],
    expandedGames: [],
    expandedMorningDates: [],
    expandedAfternoonDates: []
  },
  created: function() {
    this.getData();
  },
  methods: {
    getData: function() {
      fetch('https://api.myjson.com/bins/hfwwq', {
          method: "GET"
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(json) {
          app.gameInfo = json;
          app.createDateData();
          app.populateDateData();
        })
        .catch(function(error) {
          console.log(error);
        })
    },
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
              (j == 0 || this.gameInfo.games[j-1].time != "9:30 am")) {
              this.dateArray[i].morning.time = this.gameInfo.games[j].time;
              this.dateArray[i].morning.team1 = this.gameInfo.games[j].team;
              this.dateArray[i].morning.opponent1 = this.gameInfo.games[j].opponent;
              this.dateArray[i].morning.location = this.gameInfo.games[j].location;
            }
            else if (this.gameInfo.games[j].time == "9:30 am" &&
              (this.gameInfo.games[j-1].time == "9:30 am")) {
              this.dateArray[i].morning.team2 = this.gameInfo.games[j].team;
              this.dateArray[i].morning.opponent2 = this.gameInfo.games[j].opponent;
            }
            if (this.gameInfo.games[j].time == "1:00 pm" &&
              (this.gameInfo.games[j-1].time != "1:00 pm")) {
              this.dateArray[i].afternoon.time = this.gameInfo.games[j].time;
              this.dateArray[i].afternoon.team1 = this.gameInfo.games[j].team;
              this.dateArray[i].afternoon.opponent1 = this.gameInfo.games[j].opponent;
              this.dateArray[i].afternoon.location = this.gameInfo.games[j].location;
            }
            else if (this.gameInfo.games[j].time == "1:00 pm" &&
              (this.gameInfo.games[j-1].time == "1:00 pm")) {
              this.dateArray[i].afternoon.team2 = this.gameInfo.games[j].team;
              this.dateArray[i].afternoon.opponent2 = this.gameInfo.games[j].opponent;
            }
          }
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
      this.filterCollapsed=!this.filterCollapsed;
      this.checkedNames=[];
      this.filteredGames=[];
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
      if(time == "9:30 am"){
        expandedArray = app.expandedMorningDates;
      }
      else if (time == "1:00 pm"){
        expandedArray = app.expandedAfternoonDates;
      }
      if(expandedArray.includes(i)){
        let index = expandedArray.indexOf(i);
        expandedArray.splice(index, 1);
      }
      else {
          expandedArray.push(i);
      }
    }
  }
})
