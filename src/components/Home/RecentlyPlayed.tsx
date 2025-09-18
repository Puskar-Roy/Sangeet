import { View, Text } from 'react-native';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import RecentMusics from './RecentMusics';
export default function RecentlyPlayed() {
  return (
    <View style={styles.wraper}>
      <View style={styles.maincontainer}>
        <Text style={styles.fourthtext}>Populer Songs</Text>
        <RecentMusics/>
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  wraper: {
    marginTop: '30@ms',
  },
  maincontainer: {
    width: '90%',
    marginHorizontal: 'auto',
    display: 'flex',
    gap: '2@ms',
    //justifyContent: 'space-between',
    flexDirection: 'column',
    //alignItems: 'center',
  },
  nameContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10@ms',
  },
  listencontainer: {
    width: '90%',
    marginHorizontal: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '30@ms',
  },
  image: {
    width: '40@s',
    height: '40@vs',
  },
  maintext: {
    fontSize: '15@ms',
    color: '#fff',
    fontFamily: 'SSemiBold',
  },
  secondtext: {
    fontSize: '11@ms',
    color: '#fff',
    fontFamily: 'SSemiBold',
  },
  thrdtext: {
    fontSize: '26@ms',
    color: '#F2F2F2',
    fontFamily: 'SSemiBold',
  },
  fourthtext: {
    fontSize: '22@ms',
    color: '#fff',
    fontFamily: 'SSemiBold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A091E',
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: '12@ms',
    paddingVertical: '8@ms',
    height: '40@vs',
    width: '153@s',
    // borderColor: '#fff',
  },
  searchContainerFocused: {
    borderColor: '#fff',
    backgroundColor: '#1A1A2E',
  },
  searchIconContainer: {
    marginRight: '2@ms',
    padding: '2@ms',
  },
  input: {
    flex: 1,
    fontSize: '14@ms',
    fontWeight: '400',
    color: '#fff',
    fontFamily: 'SSemiBold',
    paddingVertical: 0,
    //paddingHorizontal:'15@ms'
  },
});
