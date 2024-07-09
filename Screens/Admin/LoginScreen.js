import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, Modal, ActivityIndicator } from 'react-native';
import { firestore } from '../../Firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import images from '../../constants/images';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Add state for loading

  const handleUsernameChange = (text) => {
    setUsername(text);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
  };

  const handleLoginPress = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    setLoading(true); // Start loading

    try {
      const adminCollection = collection(firestore, 'admin');
      const q = query(adminCollection, where('username', '==', username), where('password', '==', password));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const adminData = querySnapshot.docs[0].data();
        const adminName = adminData.admin_name; // Replace 'name' with the actual field name in your Firestore document

        console.log('Login Successful');
        navigation.replace('AdminDashboard', { adminName });
      } else {
        Alert.alert('Invalid Entry', 'Username or password is incorrect.');
      }
    } catch (error) {
      console.error('Error logging in: ', error);
      Alert.alert('Error', 'An error occurred while trying to log in.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Image source={images.login_pic} style={{ width: '100%', height: '45%' }} />
      <View style={styles.inputView}>
        <View style={styles.iconContainer}>
          <View style={{ height: 20, width: 20 }}>
            <Image source={images.user} style={{ height: '100%', width: '100%', tintColor: 'gray' }} />
          </View>
        </View>
        <TextInput
          style={styles.inputText}
          placeholder="Username"
          placeholderTextColor="#003f5c"
          onChangeText={handleUsernameChange}
        />
      </View>
      <View style={styles.inputView}>
        <View style={styles.iconContainer}>
          <View style={{ height: 20, width: 20 }}>
            <Image source={images.lock} style={{ height: '100%', width: '100%', tintColor: 'gray' }} />
          </View>
        </View>
        <TextInput
          style={styles.inputText}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#003f5c"
          onChangeText={handlePasswordChange}
        />
      </View>
      <TouchableOpacity onPress={handleLoginPress} style={styles.loginBtn}>
        <Text style={styles.loginText}>LOGIN</Text>
      </TouchableOpacity>

      <Text onPress={() => navigation.navigate('SignUpScreen')} style={{ color: '#1e90ff', marginTop: 10 }}>
        Don't have an account? Sign up
      </Text>

      <Modal transparent={true} visible={loading} animationType="fade">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={50} color="#1E90FF" />
          <Text style={styles.loadingText}>Logging in, please wait...</Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffff',
    marginTop: 15,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 30,
    color: '#1E90FF',
    marginBottom: 10,
  },
  inputView: {
    width: '80%',
    backgroundColor: '#f2f2f2',
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  inputText: {
    flex: 1,
    height: 50,
    color: '#000',
    paddingLeft: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  loginBtn: {
    width: '80%',
    backgroundColor: '#1E90FF',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  loginText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'white',
  },
});

export default LoginScreen;
