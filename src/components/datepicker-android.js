var React = require('react-native');
var {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  NativeModules
} = React;

module.exports = React.createClass({
    handleClick: function () {
      NativeModules.DateAndroid.showTimepicker(function() {}, function(hour, minute) {
        console.log(hour + ":" + minute);
        this.props.events.emit('date-changed', hour + ":" + minute);
      });
    },

    render: function() {
      return (
        <View style={styles.container}>
          <TouchableOpacity onPress={this.handleClick}>
            <Text style={styles.instructions}>
              Click me
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
});

var styles = StyleSheet.create({
  instructions: {
    textAlign: 'center',
    color: '#333333',
    margin: 5,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  }
});
