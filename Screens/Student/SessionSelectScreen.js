import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, Dimensions, Platform, Image, TextInput, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { firestore } from '../../Firebase';
import { collection, getDocs } from 'firebase/firestore';
import images from '../../constants/images';

const { width: screenWidth } = Dimensions.get('window');

const SessionSelectScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(false); // Error state

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionSnapshot = await getDocs(collection(firestore, 'sessions'));
        const sessionList = sessionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSessions(sessionList);
        setError(false); // Reset error state on success
      } catch (error) {
        console.error('Error fetching sessions: ', error);
        setError(true); // Set error state on failure
      }
      setLoading(false);
    };

    fetchSessions();
  }, []);

  const handleSelectSession = (session) => {
    console.log(`Selected session ID: ${session.id}`);
    navigation.navigate('TakeAttendanceScreen', {
      courseCode: session.courseCode,
      courseName: session.courseName,
      day: session.day,
      time: session.time,
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredSessions = sessions.filter((session) =>
    session.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelectSession(item)}>
      <View style={{ gap: 5 }}>
        {/* course code and icons */}
        <View style={styles.flexRow}>
          <Text style={[styles.itemText, styles.font]}>{item.courseCode}</Text>
          <View />
        </View>
        {/* course name */}
        <Text style={[styles.itemText, styles.font]}>
          {item.courseName.length > 40 ? `${item.courseName.slice(0, 40)}...` : item.courseName}
        </Text>
      </View>
      {/* day and time */}
      <View style={styles.flexRow}>
        <View style={styles.flexDate}>
          <View style={{ display: 'flex', flexDirection: 'row', gap: 4, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ height: 20, width: 20 }}>
              <Image source={images.calendar_icon} style={{ height: '100%', width: '100%', tintColor: '#1E90FF' }} />
            </View>
            <Text style={[styles.itemText, styles.smallFont]}>{item.day}</Text>
          </View>
          <View style={{ display: 'flex', flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ height: 20, width: 20 }}>
              <Image source={images.clock_icon} style={{ height: '100%', width: '100%', tintColor: '#1E90FF' }} />
            </View>
            <Text style={[styles.itemText, styles.smallFont]}>{item.time}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" translucent={true} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={{ height: 20, width: 20 }}>
            <Image source={images.left_arrow} style={{ height: '100%', width: '100%', tintColor: '#1E90FF' }} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerText}>Select Session</Text>
        <View />
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search by course code or name"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1E90FF" />
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <View style={{ height: "60%", width: screenWidth - 40, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={images.error} style={{ width: '100%', height: '100%' }} />
            </View>
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => {
            if (sessions.length === 0) {
              return (
                <View style={styles.emptyContainer}>
                  <View style={{ height: "60%", width: screenWidth - 40, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={images.no_session} style={{ width: '100%', height: '100%', top: -40 }} />
                  </View>
                  <Text style={styles.emptyText}>Admin hasn't added a session yet</Text>
                </View>
              );
            } else if (searchQuery && filteredSessions.length === 0) {
              return (
                <View style={styles.emptyContainer}>
                  <View style={{ height: "60%", width: screenWidth - 40, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={images.not_found} style={{ width: '100%', height: '100%', top: -40 }} />
                  </View>
                  <Text style={styles.emptyText}>Course not found</Text>
                </View>
              );
            }
            return null;
          }}
        />
      )}
    </View>
  );
};

export default SessionSelectScreen;

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
    paddingTop: 20,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    margin: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    fontSize: 16,
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
