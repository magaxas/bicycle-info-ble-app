import React, {FC} from 'react';
import {
  View,
  Modal,
  SafeAreaView,
  Text,
  Switch,
  TextInput,
  StyleSheet
} from 'react-native';
import Button from './Button';

type SettingsModalProps = {
  visible: boolean;
  saveAndCloseModal: () => void;
  isKmphMode: boolean;
  setKmphMode: React.Dispatch<React.SetStateAction<boolean>>;
  wheelDiameter: number;
  setWheelDiameter: React.Dispatch<React.SetStateAction<number>>;
};

const SettingsModal: FC<SettingsModalProps> = props => {
  const {
    visible, 
    isKmphMode,
    setKmphMode, 
    wheelDiameter,
    setWheelDiameter,
    saveAndCloseModal
  } = props;

  const toggleSwitch = () => setKmphMode(previousState => !previousState);
  const handleDiameterInputChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setWheelDiameter(parseFloat(numericValue));
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.titleWrapper}>
          <Text style={styles.titleText}>
            Nustatymai
          </Text>
          <Text style={styles.attributeText}>
            Rodyti greitį km/h:
          </Text>
          <Switch
            style={styles.switch}
            onValueChange={toggleSwitch}
            value={isKmphMode}
          />
          <Text style={styles.attributeText}>
            Rato diametras (mm):
          </Text>
          <TextInput
            style={styles.input}
            value={wheelDiameter.toString()}
            onChangeText={handleDiameterInputChange}
          />
        </View>
        <Button
          onPress={saveAndCloseModal}
          theme='primary'
          text='Išsaugoti ir uždaryti'
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  titleWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  attributeText: {
    fontSize: 20,
    textAlign: 'center',
    color: 'black',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    marginBottom: 20,
  },
  switch: {
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
    marginBottom: 20,
  },
  input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 18,
  },
});

export default SettingsModal;
