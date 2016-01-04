var React = require('react-native');
var {
  Text,
  StyleSheet,
  TouchableHighlight
} = React;

module.exports = React.createClass({
  render: function() {
    return (
      <TouchableHighlight style={[styles.button, this.props.buttonType]} underlayColor={'gray'} onPress={this.props.onPress}>
        <Text style={[styles.buttonText, this.props.textType]}>{this.props.text}</Text>
      </TouchableHighlight>
    )
  }
});

var styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 3,
    padding: 5,
    borderColor: '#424242',
    marginTop: 10,
    marginBottom: 10,
  },

  buttonText: {
    flex: 1,
    alignSelf: 'center',
    fontSize: 20,
    color: '#424242'
  }
});
