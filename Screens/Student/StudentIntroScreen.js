import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import images from '../../constants/images';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const StudentIntroScreen = ({ navigation }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Initiate Attendance marking</Text>
      <View style={styles.imageContainer}>
        <Image source={images.student_intro} style={styles.image} />
      </View>
      <View style={styles.buttonContainer}>
        <Animated.View style={[styles.animatedButtonWrapper, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            onPress={() => navigation.navigate("SessionSelectScreen")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>GO</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageContainer: {
    height: "60%",
    width: "70%",
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    marginTop: 10,
  },
  animatedButtonWrapper: {
    borderWidth: 2,
    borderColor: "#1e90ff",
    borderRadius: 50,
    padding: 2,
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderRadius: 50,
    width: 100,
    backgroundColor: '#1E90FF',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 30,
    color: '#FFF',
  },
});

export default StudentIntroScreen;
