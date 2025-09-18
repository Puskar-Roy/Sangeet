import { View, Text } from 'react-native'
import React from 'react'
import { Fonts } from '../../styles/Fonts'
export default function HomeScreen() {
  return (
    <View>
      <Text style={ { fontSize: 50 , color:"#fff" , fontFamily:Fonts.Regular }} >HomeScreen</Text>
    </View>
  )
}