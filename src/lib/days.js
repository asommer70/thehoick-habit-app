module.exports = {

  today: new Date(),
  dayKey: today.getMonth().toString() + today.getDate().toString() + today.getFullYear().toString(),
  yesterdayKey: today.getMonth().toString() + (today.getDate() - 1).toString() + today.getFullYear().toString(),
  day: undefined,

  // Determine if the Habit is checked.
  //  if not find the number of days between today and the last day recorded.
  //  if the number of days is greater than 1 add entries for those days with the different unchecked status.
  //  else add a day for today with a checked status.
  // Might be able to just put this on addDays().

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
