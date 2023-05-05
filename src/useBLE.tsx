import {useState} from 'react';
import {PermissionsAndroid, Platform, ToastAndroid} from 'react-native';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';
import {atob} from 'react-native-quick-base64';

const HOST_NAME = 'BicycleInfo';
const BICYCLE_INFO_UUID = '0000dead-0000-1000-8000-00805f9b34fb';
const UNIT_SPEED_CHARACTERISTIC = '0000f4f4-0000-1000-8000-00805f9b34fb';
const REVOLUTIONS_CHARACTERISTIC = '0000e4e4-0000-1000-8000-00805f9b34fb';

const bleManager = new BleManager();

type VoidCallback = (result: boolean) => void;

interface BLE {
  requestPermissions(cb: VoidCallback): Promise<void>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  revolutions: number;
  unitSpeed: number;
}

function useBLE(): BLE {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  const [revolutions, setRevolutions] = useState<number>(0);
  const [unitSpeed, setUnitSpeed] = useState<number>(0);

  const requestPermissions = async (cb: VoidCallback) => {
    if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Vetovės leidimas',
            message: 'Bluetooth Low Energy reikalauja vietovės',
            buttonNeutral: 'Klausti vėliau',
            buttonNegative: 'Atšaukti',
            buttonPositive: 'Gerai',
          },
        );
        cb(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]);

        const isGranted =
          result['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED;

        cb(isGranted);
      }
    } else {
      cb(true);
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex(device => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device && device.name?.includes(HOST_NAME)) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
    } catch (e) {
      ToastAndroid.showWithGravity(
        'Nepavyko prisijungti, bandykite dar kart!',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
      console.log('FAILED TO CONNECT', e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setRevolutions(0);
      setUnitSpeed(0);
    }
  };

  const getCharacteristicValue = (
    error: BleError | null,
    characteristic: Characteristic | null,
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log('No Data was recieved');
      return -1;
    }

    const rawData = atob(characteristic.value);
    let value: number = Number(rawData);
    return value;
  };

  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        BICYCLE_INFO_UUID,
        UNIT_SPEED_CHARACTERISTIC,
        (error, characteristic) => setUnitSpeed(getCharacteristicValue(error, characteristic)),
      );

      device.monitorCharacteristicForService(
        BICYCLE_INFO_UUID,
        REVOLUTIONS_CHARACTERISTIC,
        (error, characteristic) => setRevolutions(getCharacteristicValue(error, characteristic))
      );
    } else {
      console.log('No Device Connected');
    }
  };

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    revolutions,
    unitSpeed
  };
}

export default useBLE;
