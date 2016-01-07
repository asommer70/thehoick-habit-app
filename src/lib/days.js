module.exports = {

  today: new Date(),
  dayKey: today.getMonth().toString() + today.getDate().toString() + today.getFullYear().toString(),
  yesterdayKey: today.getMonth().toString() + (today.getDate() - 1).toString() + today.getFullYear().toString(),
  day: undefined,

  findToday: function() {
    // Find today's days entry.
    if (this.state.days !== null) {
      day = this.state.days.findIndex(function(day, index, days) {
        if (day.dayId == dayKey) {
          return true;
        }
      });
    } else {
      day = -1;
    }
  },

  addDay: function() {
    if (day === -1) {
      var newDay = {dayId: dayKey, created_at: Date.now(), habit: this.state.habit};

      if (this.state.days === null) {
        this.setState({days: [newDay], checked: true});
      } else {
        this.state.days.push(newDay);
        this.setState({days: this.state.days, checked: true});
      }
      store.save('days', this.state.days);
    }
  },

  checkPastDays: function(days) {
    // Get last day entered.
    var lastDay = days[days.length - 1];


    // Find yesterday's key in this.state.days, and if it's not there create it as checked: false.
    // What happens when more than one day is missed?
    if (day.dayId == yesterdayKey) {
      var newDay = {dayId: dayKey, created_at: Date.now(), habit: this.state.habit};
      this.setState(days: this.state.days.push(newDay));
      store.save('days', this.state.days);
    }
  }
}
