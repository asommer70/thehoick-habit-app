var React = require('react-native');
var {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
} = React;
var Subscribable = require('Subscribable');

module.exports = React.createClass({
  mixins: [Subscribable.Mixin],

  componentDidMount: function() {
    this.addListenerOn(this.props.events, 'got-habits', (habits) => {
      if (habits.length > 0) {
        var habit = habits[habits.length - 1];
      } else {
        var habit = {name: '', days: []};
      }
      this.setState({habit: habit, days: habit.days});
    });

    this.addListenerOn(this.props.events, 'day-added', (habits) => {
      var habit = habits[habits.length - 1];
      this.setState({habit: habit, days: habit.days});
    });

    this.addListenerOn(this.props.events, 'chain-restarted', (data) => {
      if (this.state.habit == data.habits[data.habitIdx]) {
        this.setState({days: []});
      }
    });

    this.addListenerOn(this.props.events, 'new-habit', (habits) => {
      var habit = habits[habits.length - 1];

      if (habits.length >= 1) {
        this.setState({habit: habit, days: habit.days});
      } else {
        this.setState({habit: {name: '', days: []}, days: []});
      }
    });
  },

  getInitialState: function() {
    return {
      days: [],
      habit: {name: '', days: []}
    }
  },

  render: function() {
    var chains;

    var chainIcons = this.state.days.map(function(day, index) {
      var icon;
      if (index % 30 == 0 && index !=0) {
        icon = require('../img/chain-icon-green.png');
      } else {
        icon = require('../img/chain-icon.png');
      }

      if (day.checked == false) {
        icon = require('../img/broken-chain-left-icon.png');
      }

      return <Image key={day.dayId} style={styles.icon}
              source={icon} />;
    });

    if (this.state.habit.name != '') {
      chains =  <View style={styles.chains}>
                  {chainIcons}
                </View>
    } else {
      chains = <View></View>;
    }

    return (
      <ScrollView style={[styles.scroll]} automaticallyAdjustContentInsets={true} scrollEventThrottle={200}>
       {chains}
      </ScrollView>
    )
  },
});

var styles = StyleSheet.create({
  scroll: {
    height: 600,
  },

  icon: {
    padding: 0,
  },

  chains: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
    overflow: 'visible',
    borderColor: '#DFD9B9',
    borderWidth: 1
  },
})
