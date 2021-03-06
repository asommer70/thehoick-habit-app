var React = require('react-native');
var {
  Text,
  StyleSheet,
  TouchableHighlight,
  Image,
  View
} = React;

module.exports = React.createClass({
  render: function() {
    var image;
    if (this.props.imageSrc) {
      image = <Image source={this.props.imageSrc} style={[styles.shareIcon, this.props.imageStyle]} />;
    } else {
      image = <View></View>;
    }

    return (
      <TouchableHighlight style={[styles.button, this.props.buttonType]} underlayColor={'gray'} onPress={this.props.onPress}>
        <View style={this.props.imagePos}>
          {image}
          {this.props.text ? <Text style={[styles.buttonText, this.props.textType]}>{this.props.text}</Text> : <View/>}
        </View>
      </TouchableHighlight>
    )
  }
});

var styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    padding: 5,
    borderColor: '#424242',
    margin: 10
  },

  buttonText: {
    flex: 1,
    alignSelf: 'center',
    fontSize: 20,
    color: '#424242'
  },

  shareIcon: {
    padding: 5,
    paddingBottom: 7,
    alignSelf: 'center',
    justifyContent: 'center',
  }
});
