import React, {FC} from 'react';
import {
  View,
  Modal,
  SafeAreaView,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from './Button';

type StatsModalProps = {
  visible: boolean;
  statsData: StatsData[];
  setStatsData: React.Dispatch<React.SetStateAction<StatsData[]>>;
  closeModal: () => void;
};

type StatsData = {
  distance: string;
  startDate: Date;
  endDate: Date;
};

const StatsModal: FC<StatsModalProps> = props => {
  const {visible, closeModal, statsData, setStatsData} = props;

  const getDateDiff = (card: StatsData) => {
    const diffSeconds = Math.abs(card.endDate.getTime() - card.startDate.getTime()) / 1000;
    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds - hours * 3600) / 60);
    const seconds = Math.floor(diffSeconds - hours * 3600 - minutes * 60);

    let diffArray = [];
    if (hours !== 0) diffArray.push(hours + 'h');
    if (minutes !== 0) diffArray.push(minutes + 'm');
    if (seconds !== 0) diffArray.push(seconds + 's');

    return diffArray.join(' ');
  };

  const formatDate = (date: Date) => {
    const offset = date.getTimezoneOffset()
    date = new Date(date.getTime() - (offset*60*1000))
    return date.toISOString().split('T')[0]
  }

  const deleteCard = async (index: number) => {
    try {
      const updatedData = [...statsData];
      updatedData.splice(index, 1);
      await AsyncStorage.setItem('@statsData', JSON.stringify(updatedData));
      setStatsData(updatedData);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}>
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.scrollView}>
        {(statsData !== undefined && statsData.length > 0) ? (statsData.map((card, index) => (
            <View key={index} style={styles.card}>
              <Text>Nuvažiuotas atstumas: {card.distance}</Text>
              <Text>Trukmė: {getDateDiff(card)}</Text>
              <Text>Data: {formatDate(card.endDate)}</Text>
              <Button
                onPress={() => deleteCard(index)} 
                theme='danger'
                text='Ištrinti'
              />
            </View>
          ))) : (
            <Text style={styles.titleText}>
              Nieko gero nėra :(
            </Text>
          )}
        </ScrollView>
        <Button
          onPress={closeModal} 
          theme='primary'
          text='Grįžti'
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
  scrollView: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  titleText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    marginBottom: 20,
  }
});

export {StatsModal, StatsData};
