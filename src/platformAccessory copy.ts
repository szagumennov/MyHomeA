import { Service, PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';

import { SZHomebridgePlatform } from './platform';

//import mqtt = require('mqtt'); //we will get data from mqtt server
//"mqtt": "^4.1.0"

const connectedTopic = 'szTest/connected';
const timerTopic = 'szTest/timer';
const tempTopic = 'szTest/temp';

let timer=0; //variables
let temp=0;
let interval; //interval handler

const options = {
  clientId: 'mqttjs' +Math.random().toString(16).substr(2, 8),
  username: '',
  password: '',
  keepalive:  60,
  connectTimeout: 10000,
  reconnectPeriod: 1000,
  clean:  true  
};

let client;


function stateUpdate() {
  client.publish(timerTopic, ''+timer);
  client.publish(tempTopic, ''+temp.toFixed(1));
  timer++;
  temp=Math.random()*100;
}

client.on('connect', (connack) => {
  // Inform controllers that client connected
  client.publish(connectedTopic, 'true'); 
  client.subscribe(timerTopic);
  client.subscribe(tempTopic);
  interval=setInterval(stateUpdate, 1000);
  console.log('connected: ', connack, '\n');

})

client.on('error', function(error){
  console.log('error \n', error);
})

client.on('offline', ()=>{
  client.end();
  console.log('offline \n');
})

client.on('message', (topic, message)=>{

  if (topic===timerTopic) {
      console.log(topic, ':', message.toString);
  }

  if (topic===tempTopic) {
      console.log(topic, ':', message.toString, '\n');
  }

})




/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */

export class HeaterCoolerAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private CurrentTemp = 0.0;
  private HeaterCoolerState = 0;
  private TargetState = 0;
  private isActive = this.platform.Characteristic.Active.ACTIVE;

  constructor(
    private readonly platform: SZHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)! /// ! here is a not null assertion operator
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'SZ')
      .setCharacteristic(this.platform.Characteristic.Model, 'Tinker heater')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'SZ00002');

    // get the service if it exists, otherwise create a new service    
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.HeaterCooler) ||   
      this.accessory.addService(this.platform.Service.HeaterCooler);

    // To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
    // when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
    // this.accessory.getService('NAME') ?? this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE');

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.deviceName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .on('get', this.getTemp.bind(this));               // GET - bind to the `getOn` method below

    this.service.getCharacteristic(this.platform.Characteristic.Active)
      .on('get', this.getActive.bind(this))       // GET 
      .on('set', this.setActive.bind(this));     // SET

    this.service.getCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState)
      .on('get', this.getHCState.bind(this)); 

    this.service.getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
      .on('get', this.getTHCState.bind(this))
      .on('set', this.setTHCState.bind(this));

     //client = mqtt.connect('mqtt://192.168.0.114', options);

    // EXAMPLE ONLY
    // Example showing how to update the state of a Characteristic asynchronously instead
    // of using the `on('get')` handlers.
  
    // Here we update data a random value every 5 seconds using 
    // the `updateCharacteristic` method.
    setInterval(() => {
      // assign the current brightness a random value between 0 and 100
      this.CurrentTemp = Math.floor(Math.random() * 100);

      // push the new value to HomeKit
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, this.CurrentTemp);

      this.platform.log.debug('Pushed updated current Temp state to HomeKit:', this.CurrentTemp);
    }, 10000);

  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  /*setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    // implement your own code to turn your device on/off
    this.exampleStates.On = value as boolean;

    this.platform.log.debug('Set Characteristic On ->', value);

    // you must call the callback function
    callback(null);
  }
  */

  getTemp(callback: CharacteristicGetCallback) {

  // implement your own code to check if the device is on

  this.platform.log.debug('Get  Temp->', this.CurrentTemp);

  // you must call the callback function
  // the first argument should be null if there were no errors
  // the second argument should be the value to return
  callback(null, this.CurrentTemp);
  }

  getActive(callback: CharacteristicSetCallback) {

  this.platform.log.debug('Get Active -> ', this.isActive);
  // you must call the callback function
  callback(null, this.isActive);
  }
   setActive(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    this.platform.log.debug('Set Active Characteristic ->', value);

    this.isActive = value as number;

    callback(null);
  }

  getHCState(callback: CharacteristicGetCallback) {

    // implement your own code to check if the device is on
  
    this.platform.log.debug('Get State->', this.HeaterCoolerState);
  
    // you must call the callback function
    // the first argument should be null if there were no errors
    // the second argument should be the value to return
    callback(null, this.HeaterCoolerState);
  }

  getTHCState(callback: CharacteristicGetCallback) {

    // implement your own code to check if the device is on
  
    this.platform.log.debug('Get THC State->', this.TargetState);
  
    // you must call the callback function
    // the first argument should be null if there were no errors
    // the second argument should be the value to return
    callback(null, this.TargetState);
  }
  setTHCState(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    this.platform.log.debug('Set THC State ->', value);

    this.TargetState = value as number;

    callback(null);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   * 
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   * 
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class TempSensorAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private CurrentTemp = 0.0;

  constructor(
    private readonly platform: SZHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'SZ')
      .setCharacteristic(this.platform.Characteristic.Model, 'Tinker board')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'SZ00001');

    // get the TempSensor service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.TemperatureSensor) || 
      this.accessory.addService(this.platform.Service.TemperatureSensor);

    // To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
    // when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
    // this.accessory.getService('NAME') ?? this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE');

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.deviceName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .on('get', this.getTemp.bind(this));               // GET - bind to the `getOn` method below

    // register handlers for the Brightness Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.StatusActive)
      .on('get', this.getActive.bind(this));       // GET 

    // EXAMPLE ONLY
    // Example showing how to update the state of a Characteristic asynchronously instead
    // of using the `on('get')` handlers.
    //
    // Here we change update the brightness to a random value every 5 seconds using 
    // the `updateCharacteristic` method.
    setInterval(() => {
      // assign the current brightness a random value between 0 and 100
      this.CurrentTemp = Math.floor(Math.random() * 100);

      // push the new value to HomeKit
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, this.CurrentTemp);

      this.platform.log.debug('Pushed updated current Temp state to HomeKit:', this.CurrentTemp);
    }, 10000);
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  /*setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    // implement your own code to turn your device on/off
    this.exampleStates.On = value as boolean;

    this.platform.log.debug('Set Characteristic On ->', value);

    // you must call the callback function
    callback(null);
  }
  */

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   * 
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   * 
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  getTemp(callback: CharacteristicGetCallback) {

    // implement your own code to check if the device is on

    this.platform.log.debug('Get  Temp->', this.CurrentTemp);

    // you must call the callback function
    // the first argument should be null if there were no errors
    // the second argument should be the value to return
    callback(null, this.CurrentTemp);
  }

  getActive(callback: CharacteristicSetCallback) {

    this.platform.log.debug('Get Active -> ', true);

    // you must call the callback function
    callback(null, true);
  }

}
