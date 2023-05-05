# BicycleInfo app using BLE

Currently this app is only runnable on Android.

## Prod
Pre-deploy:
+ `cd android/app`
+ `keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000`

Test prod build:
+ `npx react-native run-android --variant=release`


Inspired by: https://github.com/friyiajr/BluetoothLowEnergySample
