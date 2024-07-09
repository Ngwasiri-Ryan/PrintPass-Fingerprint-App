// global.js
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

 {/**#57abd9 */}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop:StatusBar.currentHeight
    },
  welcome: {
    fontSize: 46,
    textAlign: 'center',
    fontWeight:'800',
    margin: 10,
    color: '#1E90FF',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 20,
    borderRadius: 30,
    width:300,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
  mode_pic: {
    height:400,
    width: '100%',
  },
  mode: {
    height:'100%',
    width: '100%',
  }
});

export default styles;
