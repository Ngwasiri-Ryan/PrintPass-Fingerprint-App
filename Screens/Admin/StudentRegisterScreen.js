import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { firestore } from '../../Firebase';  // Ensure the correct path to your firebase.js
import { collection, addDoc } from 'firebase/firestore';
import images from '../../constants/images';
import * as Crypto from 'expo-crypto';

const StudentRegisterScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [matricule, setMatricule] = useState('');
  const [fingerprintData, setFingerprintData] = useState(false);
  const [uniqueIdentifier, setUniqueIdentifier] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const generateUniqueIdentifier = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleFingerprintRegistration = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate with fingerprint',
        });

        if (result.success) {
          const identifier = generateUniqueIdentifier();
          setUniqueIdentifier(identifier);
          setFingerprintData(true);
          Alert.alert("Fingerprint Registration", `Fingerprint registered successfully, Click on Register!`);
        } else {
          Alert.alert("Fingerprint Registration", "Fingerprint registration failed. Please try again.");
        }
      } else {
        Alert.alert("Fingerprint Registration", "Your device does not support fingerprint authentication.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Fingerprint Registration", "An error occurred during fingerprint registration.");
    }
  };

  const handleRegister = async () => {
    if (name.trim() === '' || matricule.trim() === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const hashedIdentifier = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        uniqueIdentifier
      );

      await addDoc(collection(firestore, 'students'), { 
        name: name,
        matricule: matricule,
        fingerprintRegistered: fingerprintData,
        uniqueIdentifier: uniqueIdentifier,
        hashedUniqueIdentifier: hashedIdentifier,
      });
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error registering student: ', error);
      Alert.alert('Error', 'Failed to register student');
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Image source={images.register} style={{ width: '100%', height: '45%' }} />
      <Text style={styles.title}>Register Student</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Matricule"
          value={matricule}
          onChangeText={setMatricule}
        />
        <TouchableOpacity style={styles.fingerprintContainer} onPress={handleFingerprintRegistration}>
          <Image source={images.fingerprint_scanner} style={styles.fingerprintImage} />
          <Text style={styles.fingerprintText}>
            {fingerprintData ? "Fingerprint Registered" : "Register Fingerprint"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalText}>{name}, your unique identifier is:</Text>
            <Text style={styles.identifierText}>{uniqueIdentifier}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default StudentRegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 30,
    color: '#1E90FF',
    top: '40%',
    marginLeft: '20%',
    position: 'absolute',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f2f2f2',
  },
  fingerprintContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  fingerprintImage: {
    width: 100,
    height: 100,
    tintColor: '#1E90FF',
  },
  fingerprintText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1E90FF',
  },
  registerButton: {
    width: '80%',
    backgroundColor: '#1E90FF',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1E90FF',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  identifierText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
  },
});
