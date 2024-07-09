import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import styles from '../constants/global'
import images from '../constants/images'

const StarterScreen = ({navigation}) => {
  return (
    <View className="flex-1 items-center justify-center bg-[#ffff]">
      <Text style={styles.welcome}>PrintPass</Text>

<View style={{
    height:'65%',
    width: '90%',
    backgroundColor:'red',
    marginBottom:10,
}}>
 <Image source={images.phone} style={{height:'100%' , width:'100%'}}/>
</View>
    <Image source={images.logo} style={styles.logo} />
      <TouchableOpacity 
       onPress={() => navigation.replace("IntroScreen")} 
      style={styles.button}>
         <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

    </View>
  )
}

export default StarterScreen