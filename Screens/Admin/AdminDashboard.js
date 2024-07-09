import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet,Dimensions , Image} from 'react-native';
import { useNavigation , useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome icons
import images from '../../constants/images';

const data = [
  { id: '1', title: 'Register Student', screenName: 'StudentRegisterScreen', pic: require('../../assets/images/add_student.png') },
  { id: '2', title: 'Create Session', screenName: 'SessionScreen',  pic: require('../../assets/images/session.png') },
  { id: '3', title: 'Generate Reports', screenName: 'ReportIntroScreen',  pic: require('../../assets/images/reports.png')  },
];

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AdminDashboard = () => {
  const navigation = useNavigation();
  const route = useRoute(); // Hook to access route object
  const adminName = route.params?.adminName || 'Admin'; 
  
  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigateToScreen(item.screenName)}
    >
       <View style={{ height: 60, width: 60 }}>
              <Image source={item.pic} style={{ height: '100%', width: '100%',tintColor: '#1E90FF' }} />
        </View> 
        <Text style={{marginTop:25, fontSize:13}}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
   
      <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={{height:20, width:20,}}>
               <Image source={images.left_arrow} style={{height:'100%', width:'100%',tintColor: '#fff',  }}/>
            </View>
        </TouchableOpacity>
        <Text style={styles.headerText}>Admin Dashboard</Text>
        
        <View />
      </View>
    
          <View style={styles.reportHeader}>
             <View style={{ display: 'flex', flexDirection: 'row', gap: 20, alignItems: 'center' }}>
               <View style={{width:'70%'}}>
                <View style={{display:'flex', gap:5, width:'100%',flexDirection:'column'}}>
                  <Text style={{fontSize: 35,fontWeight:600, color:'#FFFF'}}>Welcome</Text>
                  <Text  style={{fontSize: 20,fontWeight:800, color:'#FFFF'}}>{adminName}</Text>
                </View>
             </View>
             
              <View style={{ height: 80, width: 80 }}>
              <Image source={images.admin} style={{ height: '100%', width: '100%' }} />
            
             </View>
               
          </View>
           </View>
   

      <FlatList
        data={data}
        numColumns={2}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 120,
  },
  header: {
    backgroundColor: '#1E90FF',
    display:'flex',
    flexDirection:'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
    gap:50,
    justifyContent: 'center',
    elevation: 5,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingVertical: 12,
    paddingTop: screenHeight/15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  flatListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  itemContainer: {
    flexBasis: '50%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginVertical: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    height: 150, // Fixed height for each box
    marginRight: 10,
    marginBottom:20,
    
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  reportHeader: {
    padding: 16,
    backgroundColor: '#1E90FF',
    marginBottom: 30,
    alignItems: 'center',
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
    paddingHorizontal:30,
    gap: 10,
  },
});

export default AdminDashboard;
