import React, {FC} from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';

const themes = {
  primary: {
    backgroundColor: 'green'
  },
  secondary: {
    backgroundColor: '#4e54c8'
  },
  danger: {
    backgroundColor: '#ff6347'
  }
};

type ButtonProps = {
  theme: keyof typeof themes;
  text: string;
  onPress: () => void;
};

const Button: FC<ButtonProps> = props => {
  const {theme, text, onPress} = props;
  const themeStyle = themes[theme];

  return (
    <TouchableOpacity
        onPress={onPress}
        style={[styles.containerDefault, themeStyle]}>
        <Text style={styles.textDefault}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    containerDefault: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 50,
      marginHorizontal: 20,
      paddingHorizontal: 20,
      marginVertical: 10,
      marginBottom: 5,
      borderRadius: 8,
    },
    textDefault: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
});

export default Button;