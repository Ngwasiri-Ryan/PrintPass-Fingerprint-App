import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { firestore } from '../../Firebase';
import { collection, addDoc } from 'firebase/firestore';
import images from '../../constants/images';

const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleUsernameChange = (text) => setUsername(text);
  const handleNameChange = (text) => setName(text);
  const handlePasswordChange = (text) => setPassword(text);
  const handleConfirmPasswordChange = (text) => setConfirmPassword(text);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match, try again");
      return;
    }

    try {
      await addDoc(collection(firestore, 'admin'), {
        admin_name: name,
        username: username,
        password: password,
      });
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while signing up.');
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setUsername('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setErrorMessage('');
    navigation.navigate('LoginScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Image source={images.signup} style={{ width: '100%', height: '40%' }} />

      <View style={styles.inputView}>
        <View style={styles.iconContainer}>
          <View style={{ height: 20, width: 20 }}>
            <Image source={images.name} style={{ height: '100%', width: '100%', tintColor: 'gray' }} />
          </View>
        </View>
        <TextInput
          style={styles.inputText}
          placeholder="Name"
          placeholderTextColor="#003f5c"
          onChangeText={handleNameChange}
          value={name}
        />
      </View>

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
          value={username}
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
          value={password}
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
          placeholder="Confirm Password"
          placeholderTextColor="#003f5c"
          onChangeText={handleConfirmPasswordChange}
          value={confirmPassword}
        />
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity style={styles.loginBtn} onPress={handleSignUp}>
        <Text style={styles.loginText}>Sign Up</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold',fontSize: 20,color: '#1E90FF',marginBottom: 15,}}>Sign Up Successful</Text>
            <Text style={styles.modalText}>{name}</Text>
            <Text style={styles.modalText1}> You are now an admin</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleModalClose}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 30,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 30,
    color: '#1E90FF',
    marginBottom: 5,
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
    marginTop: 10,
    marginBottom: 10,
  },
  loginText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalText1: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
