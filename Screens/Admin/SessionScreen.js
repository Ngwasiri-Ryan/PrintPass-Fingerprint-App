import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, Dimensions, Platform, Image, Modal, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { firestore } from '../../Firebase'; 
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import images from '../../constants/images';

const { width: screenWidth , height: screenHeight } = Dimensions.get('window');

const SessionScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(false); // Error state

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'sessions'));
        const sessionsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSessions(sessionsList);
        setError(false); // Reset error state on success
      } catch (error) {
        console.error('Error fetching sessions: ', error);
        setError(true); // Set error state on failure
      }
    };

    fetchSessions();
  }, []);

  //function to add courses
  const handleAddSession = async () => {
    if (!courseCode || !courseName || !day || !time) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      if (editMode) {
        const sessionDocRef = doc(firestore, 'sessions', currentSessionId);
        await updateDoc(sessionDocRef, { courseName, courseCode, day, time });
        setSessions(sessions.map(session => 
          session.id === currentSessionId ? { ...session, courseName, courseCode, day, time } : session
        ));
        setEditMode(false);
        setCurrentSessionId(null);
      } else {
        const docRef = await addDoc(collection(firestore, 'sessions'), {
          courseName,
          courseCode,
          day,
          time,
        });
        const newSession = {
          id: docRef.id,
          courseName,
          courseCode,
          day,
          time,
        };
        setSessions([...sessions, newSession]);
      }

      setModalVisible(false);
      setCourseName('');
      setCourseCode('');
      setDay('');
      setTime('');
      console.log('Session Added')
    } catch (error) {
      console.error('Error adding session: ', error);
      Alert.alert('Error', 'An error occurred while adding the session.');
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'sessions', id));
      setSessions(sessions.filter(session => session.id !== id));
      console.log('session deleted')
    } catch (error) {
      console.error('Error deleting session: ', error);
      Alert.alert('Error', 'An error occurred while deleting the session.');
    }
  };

  const handleEditSession = id => {
    const sessionToEdit = sessions.find(session => session.id === id);
    if (sessionToEdit) {
      setCourseName(sessionToEdit.courseName);
      setCourseCode(sessionToEdit.courseCode);
      setDay(sessionToEdit.day);
      setTime(sessionToEdit.time);
      setCurrentSessionId(id);
      setEditMode(true);
      setModalVisible(true); 
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={{gap: 5}}>
        <View style={styles.flexRow}>
          <Text style={[styles.itemText, styles.font]}>{item.courseCode}</Text>
          <View style={styles.iconContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={() => handleEditSession(item.id)}>
            <View style={{height:20, width:20,}}>
               <Image source={images.edit} style={{height:'100%', width:'100%',tintColor: '#1E90FF' }}/>
            </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteSession(item.id)}>
              <View style={{height:20, width:20,}}>
               <Image source={images.delete} style={{height:'100%', width:'100%',tintColor: '#FF6347' }}/>
            </View>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.itemText, styles.font]} className='mb-2'>
          {item.courseName.length > 40 ? `${item.courseName.slice(0, 40)}...` : item.courseName}
        </Text>
      </View>
      <View style={styles.flexRow}>
        <View style={styles.flexDate}>
          <View style={{display:'flex', flexDirection:'row', gap:4, justifyContent:'center', alignItems:'center'}}>
          <View style={{height:20, width:20,}}>
               <Image source={images.calendar_icon} style={{height:'100%', width:'100%',tintColor: '#1E90FF' }}/>
            </View>
            <Text style={[styles.itemText, styles.smallFont]}>{item.day}</Text>
          </View>
          <View style={{display:'flex', flexDirection:'row', gap:5, justifyContent:'center', alignItems:'center'}}>
          <View style={{height:20, width:20,}}>
               <Image source={images.clock_icon} style={{height:'100%', width:'100%',tintColor: '#1E90FF' }}/>
            </View>
            <Text style={[styles.itemText, styles.smallFont]}>{item.time}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" translucent={true} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={{height:20, width:20,}}>
               <Image source={images.left_arrow} style={{height:'100%', width:'100%',tintColor: '#1E90FF' }}/>
            </View>
        </TouchableOpacity>
        <Text style={styles.headerText}>Sessions</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <View style={styles.flex}>
            <Text className='text-[#1E90FF]'>Add  </Text>
            <View style={{height:15, width:15,}}>
               <Image source={images.add} style={{height:'100%', width:'100%',tintColor: '#1E90FF' }}/>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      {error ? (
        <View style={styles.emptyContainer}>
          <View style={{ height: "60%", width: screenWidth - 40, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={images.err} style={{ width: '100%', height: '100%' }} />
            </View>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={{ height: "60%", width: screenWidth - 40, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={images.add_session} style={{ width: '100%', height: '100%' }} />
              </View>
              <Text style={styles.emptyText}>Add A Session...</Text>
            </View>
          )}
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditMode(false);
          setCurrentSessionId(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <View style={{height:15, width:15,}}>
               <Image source={images.close} style={{height:'100%', width:'100%',tintColor: '#1E90FF' }}/>
            </View>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editMode ? 'Edit Session' : 'Add New Session'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Course Code"
              value={courseCode}
              onChangeText={setCourseCode}
            />
            <TextInput
              style={styles.input}
              placeholder="Course Name"
              value={courseName}
              onChangeText={setCourseName}
            />
            <TextInput
              style={styles.input}
              placeholder="Day"
              value={day}
              onChangeText={setDay}
            />
            <TextInput
              style={styles.input}
              placeholder="Time"
              value={time}
              onChangeText={setTime}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddSession}>
              <Text style={styles.addButtonText}>{editMode ? 'Update' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SessionScreen;

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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  itemContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    width: screenWidth - 32,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 10,
  },
  itemText: {
    fontSize: 15,
    color: '#000',
  },
  font: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  smallFont: {
    fontSize: 13,
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexDate: {
    flexDirection: 'row',
    gap: 20,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: screenWidth - 40,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 7,
    marginLeft: 10,
  },
  iconButton: {
    padding: 5,
  },
});
