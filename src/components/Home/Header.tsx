import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useState, useRef } from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { BellIcon } from '../svgs/Bell';
import { SearchIcon } from '../svgs/Search';

export default function Header({
  name,
  member,
}: {
  name: string;
  member: string;
}) {
  const [searchText, setSearchText] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

  const handleSearch = () => {
    if (searchText.trim()) {
      console.log('Searching for:', searchText);
      // Implement your search logic here
      //Alert("hello")
      Keyboard.dismiss();
    }
  };

  const handleSearchIconPress = () => {
    if (searchInputRef.current) {
      //@ts-ignore
      searchInputRef.current.focus();
    }
  };

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
    if (searchInputRef.current) {
      //@ts-ignore
      searchInputRef.current.blur();
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  return (
    <TouchableWithoutFeedback onPress={handleKeyboardDismiss}>
      <View>
        <View style={styles.maincontainer}>
          <View style={styles.nameContainer}>
            <Image
              style={styles.image}
              source={require('../../../assets/pfp.png')}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.maintext}>{name}</Text>
              <Text style={styles.secondtext}>{member}</Text>
            </View>
          </View>
          <BellIcon />
        </View>

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = ScaledSheet.create({
  maincontainer: {
    width: '89%',
    marginHorizontal: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
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
