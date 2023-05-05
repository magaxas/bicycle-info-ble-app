import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import DeviceModal from './components/DeviceModal';
import SettingsModal from './components/SettingsModal';
import useBLE from './useBLE';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StatsModal, StatsData} from './components/StatsModal';
import Button from './components/Button';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';


const App = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    revolutions,
    unitSpeed,
    disconnectFromDevice,
  } = useBLE();

  const [isDeviceModalVisible, setIsDeviceModalVisible] = useState<boolean>(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState<boolean>(false);
  const [isStatsModalVisible, setIsStatsModalVisible] = useState<boolean>(false);
  const [isKmphMode, setKmphMode] = useState<boolean>(false);
  const [wheelDiameter, setWheelDiameter] = useState<number>(70);
  const [statsData, setStatsData] = useState<StatsData[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date());

  const scanForDevices = () => {
    requestPermissions(isGranted => {
      if (isGranted) {
        scanForPeripherals();
      }
    });
  };

  const getSpeed = () => {
    // wheelDiameter is in millimeters so we divide by 1000
    const speed = unitSpeed * wheelDiameter / 1000;
    return isKmphMode ? (speed * 3.6) : speed;
  };

  const getDistance = () => {
    let unit = ' m';
    let distance = 3.14159 * revolutions * wheelDiameter / 1000;
    if (distance > 1000) {
      unit = ' km';
      return (distance / 1000).toFixed(1) + unit;
    }

    return distance.toFixed(0) + unit;
  };

  const hideDeviceModal = () => {
    setStartDate(new Date());
    enableKeepAwake();
    setIsDeviceModalVisible(false);
  };

  const stopJourney = async () => {
    deactivateKeepAwake();
    disconnectFromDevice();
    loadStatsData();

    try {
      let data = statsData ?? [];
      const newStatsData: StatsData = {
        distance: getDistance(),
        endDate: new Date(),
        startDate: startDate
      };
      
      data.push(newStatsData);
      setStatsData(data);
      await AsyncStorage.setItem('@statsData', JSON.stringify(data));
    } catch (error) {
      console.log(error);
    }
  }

  const enableKeepAwake = async () => {
    await activateKeepAwakeAsync();
  }

  const openDeviceModal = async () => {
    scanForDevices();
    setIsDeviceModalVisible(true);
  };

  const openStatsModal = async () => {
    loadStatsData();
    setIsStatsModalVisible(true)
  };

  const openSettingsModal = async () => {
    setIsSettingsModalVisible(true);
  };

  const saveAndCloseSettingsModal = async () => {
    saveData();
    setIsSettingsModalVisible(false);
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('isKmphMode', JSON.stringify(isKmphMode));
      await AsyncStorage.setItem('wheelDiameter', JSON.stringify(wheelDiameter));
    } catch (e) {
      console.log(e);
    }
  };

  const loadData = async () => {
    try {
      const kmphMode = await AsyncStorage.getItem('isKmphMode');
      const wheelDiameter = await AsyncStorage.getItem('wheelDiameter');

      if (kmphMode !== null) {
        setKmphMode(JSON.parse(kmphMode));
      }
      if (wheelDiameter !== null) {
        setWheelDiameter(JSON.parse(wheelDiameter));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const loadStatsData = async () => {
    try {
      const data = await AsyncStorage.getItem('@statsData');
      if (data !== null) {
        let parsedData = JSON.parse(data);
        parsedData.map((card: StatsData) => {
          card.startDate = new Date(card.startDate);
          card.endDate = new Date(card.endDate);
        });

        setStatsData(parsedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadData();
    loadStatsData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleWrapper}>
        {connectedDevice ? (
          <>
            <Text style={styles.titleText}>Greitis:</Text>
            <Text style={styles.textStyle}>{getSpeed().toFixed(0)} {isKmphMode ? 'km/h' : 'm/s'}</Text>
            
            <Text style={styles.titleTextMarginTop}>Nuvažiuotas atstumas:</Text>
            <Text style={styles.textStyle}>{getDistance()}</Text>
          </>
        ) : (
          <Text style={styles.titleText}>
            Spauskite pradėti kelionę ir susiekite įrenginį
          </Text>
        )}
      </View>
      <Button
        onPress={connectedDevice ? stopJourney : openDeviceModal}
        theme={connectedDevice ? 'danger' : 'secondary'}
        text={connectedDevice ? 'Užbaigti kelionę' : 'Pradėti kelionę'}
      />
      <Button
        onPress={openStatsModal}
        theme='primary'
        text='Statistika'
      />
      <Button
        onPress={openSettingsModal}
        theme='primary'
        text='Nustatymai'
      />
      <DeviceModal
        closeModal={hideDeviceModal}
        visible={isDeviceModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
      <SettingsModal
        isKmphMode={isKmphMode}
        setKmphMode={setKmphMode}
        wheelDiameter={wheelDiameter}
        setWheelDiameter={setWheelDiameter}
        saveAndCloseModal={saveAndCloseSettingsModal}
        visible={isSettingsModalVisible}
      />
      <StatsModal
        statsData={statsData}
        setStatsData={setStatsData}
        closeModal={() => {setIsStatsModalVisible(false)}}
        visible={isStatsModalVisible}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  titleWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginVertical: 20,
  },
  titleText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
    color: 'black',
  },
  titleTextMarginTop: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
    color: 'black',
    marginTop: 40,
  },
  textStyle: {
    fontSize: 25,
    marginTop: 15,
  },
  ctaButton: {
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default App;
