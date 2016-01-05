var React = require('react-native');
var {
  View,
  Text,
  StyleSheet,
  TextInput,
  AsyncStorage,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  TouchableHighlight
} = React;
var store = require('react-native-simple-store');
var Share = require('react-native-share');

var Button = require('./components/button');

var today = new Date();
var dayKey = today.getMonth().toString() + today.getDate().toString() + today.getFullYear().toString();
var day;


module.exports = React.createClass({
  componentDidMount() {
    // Get the habit from AsyncStorage.
    store.get('habit').then((data) => {
      if (this.isMounted()) {
        this.setState({habit: data, editHabit: false});
      }
    });

    // Get the days array from AsyncStorage, and check if today has been checked.
    store.get('days').then((data) => {
      if (this.isMounted()) {
        this.setState({days: data});

        //
        // Populate the days with test data.
        //
        // var thirty = [];
        // for (var i = 0; i < 365; i++) {
        //   var newDay = {dayId: '0' + i, created_at: Date.now(), habit: this.state.habit};
        //   thirty.push(newDay);
        // }
        // this.setState({days: thirty});
      }

      day = data.findIndex(function(day, index, days) {
        if (day.dayId == dayKey) {
          return true;
        }
      });

      if (day !== -1) {
        this.setState({checked: true});
      }
    })
  },

  getInitialState: function() {

    return {
      habit: '',
      checked: false,
      days: [],
      editHabit: true,
    }
  },

  saveHabit: function() {
    if (this.state.text) {
      store.save('habit', this.state.text).then(() => {
        this.setState({habit: this.state.text, editHabit: false});
      });
    } else {
      this.setState({editHabit: false});
    }
  },

  editHabit: function() {
    this.setState({editHabit: true})
  },

  addDay: function() {
    if (this.state.days !== null) {
      day = this.state.days.findIndex(function(day, index, days) {
        if (day.dayId == dayKey) {
          return true;
        }
      });
    } else {
      day = -1;
    }

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

  restartHabit: function() {
    store.delete('days');
    this.setState({days: [], editHabit: false, checked: false});
  },

  cancelHabitEdit: function() {
    this.setState({editHabit: false});
  },

  onShare: function() {
    Share.open({
      share_text: 'Habit Progress',
      share_URL: 'For my ' + this.state.habit + ' habit I have done ' + this.state.days.length + ' days in a row.  Yay for progress! #thehoickhabitapp',
      title: 'For my ' + this.state.habit + ' habit I have done ' + this.state.days.length + ' days in a row.  Yay for progress! #thehoickhabitapp',
    },function(e) {
      console.log(e);
    });
  },

  render: function() {
    var input, save;

    if (this.state.editHabit !== true) {
      label = <View></View>;
      input = <View></View>;
      save = <View></View>;
      cancel = <View></View>;
      restart = <View></View>;
    } else {
      label = <Text style={styles.label}>Enter Habit</Text>;
      input = <TextInput style={styles.input} onChangeText={(text) => this.setState({text})} value={this.state.habit} />;
      save =  <Button text={'Save'} onPress={this.saveHabit} textType={styles.saveText} buttonType={styles.saveButton} />;
      cancel =  <Button text={'Cancel'} onPress={this.cancelHabitEdit} />;
      restart = <Button text={'Restart Chain'} onPress={this.restartHabit} textType={styles.restartText} buttonType={styles.restartButton} />;
    }

    return (
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.shadow}>
            <TouchableWithoutFeedback onLongPress={this.editHabit} onPress={this.addDay}>
              <View style={[styles.habit, this.state.checked && styles.checked]}>
                <Text style={styles.habitText}>{this.state.habit ? this.state.habit : 'No habit configured...'}</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>

          <View style={styles.formElement}>
            {label}
            {input}
            <View style={styles.editButtons}>
              {save}
              {cancel}
            </View>
            {restart}
          </View>

          <Text style={styles.days}>{this.state.days ? this.state.days.length : '0'} links in the chain.</Text>
        </View>

        <ScrollView style={[styles.scroll]} automaticallyAdjustContentInsets={true} scrollEventThrottle={200}>
          <View style={styles.chains}>
            {this.state.days.map(function(day, index) {
              return <Image key={day.dayId} style={styles.icon}
                      source={index % 30 == 0 && index != 0 ? require('./img/chain-icon-green.png') : require('./img/chain-icon.png')} />;
            })}
          </View>
        </ScrollView>

        <Button text={'Share'} imageSrc={require('./img/share-icon.png')} onPress={this.onShare} textType={styles.shareText} buttonType={styles.shareButton} />
      </View>
    )
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#045491',
  },

  wrapper: {
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  habit: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#DFD9B9',
  },

  shadow: {
    shadowColor: '#424242',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.7,
    shadowRadius: 3,
  },

  habitText: {
    fontSize: 35,
    color: '#DFD9B9'
  },

  checked: {
    backgroundColor: '#4D9E7E',
  },

  input: {
    padding: 4,
    height: 40,
    borderWidth: 1,
    borderColor: '#424242',
    borderRadius: 3,
    margin: 5,
    width: 200,
    alignSelf: 'center',
  },

  formElement: {
    backgroundColor: '#eeeeee',
    margin: 5,
  },

  label: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 18,
    marginTop: 10,
  },

  days: {
    padding: 10,
    color: '#DFD9B9',
    fontSize: 16
  },

  icon: {
    padding: 0,
  },

  scroll: {
    height: 600,
  },

  chains: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
    overflow: 'visible',
    borderColor: '#DFD9B9',
    borderWidth: 1
  },

  restartButton: {
    borderColor: '#CE4B41',
  },

  restartText: {
    color: '#CE4B41',
  },

  saveButton: {
    borderColor: '#4D9E7E',
  },

  saveText: {
    color: '#4D9E7E',
  },

  editButtons: {
    flexDirection: 'row',
    flex: 2,
    alignSelf: 'center',
    justifyContent: 'center',
  },

  share: {
    marginBottom: 15,
    marginTop: 15,
    paddingTop: 5,
    borderColor: '#DFD9B9',
    borderWidth: 1,
    width: 45,
    alignSelf: 'center',
    justifyContent: 'center',
  },

  shareButton: {
    borderColor: '#DFD9B9',
    borderRadius: 0
  },

  shareText: {
    textAlign: 'center',
    color: '#DFD9B9',
    paddingTop: 2
  },
});
