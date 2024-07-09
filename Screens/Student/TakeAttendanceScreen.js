import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firestore } from '../../Firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import images from '../../constants/images';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const TakeAttendanceScreen = () => {
  const [uniqueIdentifier, setUniqueIdentifier] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [sessionEnded, setSessionEnded] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { courseCode, courseName, day, time } = route.params;
  const lineAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(lineAnimation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, [lineAnimation]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setSessionEnded(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isModalVisible) {
      setUniqueIdentifier('');
    }
  }, [isModalVisible]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFingerprintAuthentication = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with fingerprint',
      });

      if (result.success) {
        const hashedIdentifier = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          uniqueIdentifier
        );

        const studentsSnapshot = await getDocs(collection(firestore, 'students'));
        let studentMatch = null;

        studentsSnapshot.forEach(doc => {
          const studentData = doc.data();
          if (studentData.hashedUniqueIdentifier === hashedIdentifier) {
            studentMatch = studentData;
          }
        });

        if (studentMatch) {
          const currentDate = new Date();
          const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}`;
          const attendanceQuery = query(
            collection(firestore, 'attendances'),
            where('studentName', '==', studentMatch.name),
            where('courseCode', '==', courseCode),
            where('date', '==', formattedDate)
          );

          const attendanceSnapshot = await getDocs(attendanceQuery);

          if (attendanceSnapshot.empty) {
            const attendanceRecord = {
              studentName: studentMatch.name,
              matricule: studentMatch.matricule, // Added matricule
              courseCode: courseCode,
              courseName: courseName,
              day: day,
              time: time,
              date: formattedDate,
            };

            await addDoc(collection(firestore, 'attendances'), attendanceRecord);

            setAttendanceData(attendanceRecord);
            setIsModalVisible(true);
          } else {
            Alert.alert('Duplicate Entry', `${studentMatch.name}, your attendance has already been taken.`);
          }
        } else {
          Alert.alert('Error', 'Authentication failed. Please check your unique identifier and try again.');
        }
      } else {
        Alert.alert('Error', 'Fingerprint authentication failed. Please try again.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred during fingerprint authentication.');
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const translateY = lineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 100], // Adjust as necessary
  });

  return (
    <View style={styles.container}>
      {!sessionEnded ? (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <View style={{ height: 20, width: 20 }}>
                <Image source={images.left_arrow} style={{ height: '100%', width: '100%', tintColor: '#1E90FF' }} />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerText}>Mark Attendance</Text>
            <View />
          </View>

          <View style={styles.box}>
            <View style={styles.courseRow}>
              <Text style={styles.font}>{courseCode}-</Text>
              <Text style={styles.font}>{courseName}</Text>
            </View>
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <View style={styles.iconContainer}>
                  <Image source={images.calendar} style={styles.icon} />
                </View>
                <Text style={styles.timeText}>{day}</Text>
              </View>
              <View style={styles.timeItem}>
                <View style={styles.iconContainer}>
                  <Image source={images.clock} style={styles.icon} />
                </View>
                <Text style={styles.timeText}>{time}</Text>
              </View>
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter Unique Identifier"
            value={uniqueIdentifier}
            onChangeText={setUniqueIdentifier}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity style={styles.fingerprintContainer} onPress={handleFingerprintAuthentication}>
            <Image source={images.fingerprint_scanner} style={[styles.fingerprintImage, { tintColor: '#1E90FF' }]} />
            <Animated.View style={[styles.animatedLine, { transform: [{ translateY }] }]} />
          </TouchableOpacity>

          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>Place registered finger on scanner</Text>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: "red", borderRadius: 30, width: 130, top: 20 }}>
              <View style={styles.iconContainer}>
                <Image source={images.alarm} style={{ width: 30, height: 30 }} />
              </View>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
          </View>

          <Modal visible={isModalVisible} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Attendance Taken ✅</Text>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTextBold}>{attendanceData.studentName}</Text>
                  <Text style={styles.modalText}>Your attendance has been taken</Text>
                </View>
                <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                  <Text style={styles.modalButtonText}> OK </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <View style={styles.sessionEndedContainer}>
          <Text style={styles.sessionEndedText}>{`${courseName} session is over`}</Text>
          <View style={{ height: "55%", width: '80%', alignItems: 'center', justifyContent: 'center' }} className="gap-5 mt-10">
                <Image source={images.ended_session} style={{ width: '100%', height: '100%' }} />
          </View>

          <View className="gap-5 mt-10">
      <TouchableOpacity 
      onPress={() => navigation.navigate("StudentIntroScreen")}
      style={styles.button}>
         <Text style={styles.buttonText}>Next Session</Text>
      </TouchableOpacity>

      <TouchableOpacity 
      onPress={() => navigation.navigate("StudentIntroScreen")}
      style={styles.button1}>
         <Text style={styles.buttonText}>End Sessions</Text>
      </TouchableOpacity>

      </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  backButton: {
    position: 'absolute',
    left: 10,
  },
  backIcon: {
    height: 20,
    width: 20,
    tintColor: '#1E90FF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  box: {
    alignItems: 'center',
    backgroundColor: '#1E90FF',
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  courseRow: {
    flexDirection: 'row',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 5,
  },
  icon: {
    width: 40,
    height: 40,
  },
  font: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  timeText: {
    fontSize: 15,
    color: '#fff',
  },
  input: {
    width: '80%',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f2f2f2',
    alignSelf: 'center',
  },
  fingerprintContainer: {
    width: 200,
    height: 200,
    marginTop: '20%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  fingerprintImage: {
    width: '100%',
    height: '100%',
  },
  animatedLine: {
    position: 'absolute',
    width: '80%',
    height: 2,
    backgroundColor: '#1E90FF',
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#000',
  },
  timerText: {
    fontSize: 15,
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1E90FF',
  },
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTextBold: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#1E90FF',
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sessionEndedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionEndedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000', // Adjust color as needed
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
  button1: {
    backgroundColor: '#FF6347',
    padding: 20,
    borderRadius: 30,
    width:300,
    alignItems: 'center',
  },
});

export default TakeAttendanceScreen;
