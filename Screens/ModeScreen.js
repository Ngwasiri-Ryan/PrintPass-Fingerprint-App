import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import styles from '../constants/global'
import images from '../constants/images'

const ModeScreen = ({navigation}) => {
  return (
    <View className="flex-1 items-center justify-center bg-[#ffff]">
 
   <Text className="text-[25px]">Select Role</Text>

     <View className="w-[90%] h-[50%] bg-red-100">
     <Image source={images.role} style={styles.mode} />
     </View>
     {/** <Image source={images.role} style={styles.mode_pic} /> */}
    
      <View className="gap-5 mt-10">
      <TouchableOpacity 
      onPress={() => navigation.navigate("LoginScreen")}
      style={styles.button}>
         <Text style={styles.buttonText}>Admin</Text>
      </TouchableOpacity>

      <TouchableOpacity
      onPress={() => navigation.navigate("StudentIntroScreen")}
      style={styles.button}>
         <Text style={styles.buttonText}>Student</Text>
      </TouchableOpacity>
      </View>

    </View>
  )
}

export default ModeScreen