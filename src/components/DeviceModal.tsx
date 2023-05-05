import React, {FC, useCallback} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  SafeAreaView,
  Text,
  StyleSheet,
} from 'react-native';
import {Device} from 'react-native-ble-plx';
import Button from './Button';

type DeviceModalListItemProps = {
  item: ListRenderItemInfo<Device>;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
};

type DeviceModalProps = {
  devices: Device[];
  visible: boolean;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
};

const DeviceModalListItem: FC<DeviceModalListItemProps> = props => {
  const {item, connectToPeripheral, closeModal} = props;

  const connectAndCloseModal = useCallback(() => {
    connectToPeripheral(item.item);
    closeModal();
  }, [closeModal, connectToPeripheral, item.item]);

  return (
    <Button
      onPress={connectAndCloseModal}
      theme='secondary'
      text={item.item.name ?? '?'}
    />
  );
};

const DeviceModal: FC<DeviceModalProps> = props => {
  const {devices, visible, connectToPeripheral, closeModal} = props;

  const renderDeviceModalListItem = useCallback(
    (item: ListRenderItemInfo<Device>) => {
      return (
        <DeviceModalListItem
          item={item}
          connectToPeripheral={connectToPeripheral}
          closeModal={closeModal}
        />
      );
    },
    [closeModal, connectToPeripheral],
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}>
      <SafeAreaView style={styles.modalContainer}>
        <Text style={styles.modalTitleText}>
          Pasirink įrenginį
        </Text>
        <FlatList
          contentContainerStyle={styles.modalFlatlistContiner}
          data={devices}
          renderItem={renderDeviceModalListItem}
        />
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
  modalFlatlistContiner: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  modalTitleText: {
    marginTop: 40,
    marginBottom: 20,
    fontSize: 30,
    fontWeight: 'bold',
    marginHorizontal: 20,
    textAlign: 'center',
  },
});

export default DeviceModal;
